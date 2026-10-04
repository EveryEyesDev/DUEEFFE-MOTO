#!/usr/bin/env python3
"""
Sostituisce le fotografie di catalogo che non vanno bene.

A COSA SERVE
strumenti/controlla-ambientate.py segnala le moto che nel catalogo si
presentano con uno scatto sbagliato: un fondo bianco da studio, oppure un
dettaglio ravvicinato invece di una scena. Questo strumento torna sulla
pagina del costruttore, guarda tutte le fotografie disponibili, e tiene la
migliore.

COME SI USA
    python strumenti/sostituisci-ambientate.py            solo quelle bocciate
    python strumenti/sostituisci-ambientate.py --tutte    riesamina tutto

COME SCEGLIE
Dà un punteggio a ogni candidata e prende quella che vince:
  + larghezza dell'inquadratura, perche' il riquadro del catalogo e'
    orizzontale e una fotografia stretta ci sta male;
  + varieta' dei colori, che distingue una scena vera (strada, cielo,
    case) da un dettaglio ravvicinato o da un fondo pieno;
  - quota di bianco, che smaschera gli scatti da studio;
  - superficie senza trama, che smaschera i fondi lisci e i dettagli
    ravvicinati anche quando sono colorati;
  + dimensione del file originale, a parita' di tutto il resto.

Se nessuna candidata raggiunge la sufficienza, non tocca niente: meglio
tenere quella di prima che metterne una peggiore.
"""

import argparse
import io as _io
import os
import re
import shutil
import subprocess
import sys
import time

try:
    import numpy as np
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

CURL = shutil.which("curl")
INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "it-IT,it;q=0.9",
}

SUZUKI = "https://moto.suzuki.it"
VOGE = "https://vogeitaly.it"
SCARTI = r"(logo|icon|cropped|revslider|sfondo|patente|player|landing|placeholder|banner|thumb)"


def scarica(url, referer, tentativi=2):
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    comando = [CURL, "-sLg", "--max-time", "60", "--fail", "--compressed"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", "%s: %s" % (chiave, valore)]
    comando += ["-H", "Referer: %s" % referer, url]
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        time.sleep(0.5 * (n + 1))
    raise RuntimeError("non scaricata")


def punteggio(dati):
    """Quanto e' adatta al catalogo questa fotografia. Torna (voto, immagine)."""
    try:
        im = Image.open(_io.BytesIO(dati))
        im.load()
        im = im.convert("RGB")
    except Exception:
        return (-1, None)

    if im.width < 700:
        return (-1, None)

    proporzione = im.width / im.height
    piccola = im.resize((160, max(1, round(160 / proporzione))), Image.BILINEAR)
    a = np.array(piccola).astype(int)

    bianco = float((a.min(axis=2) > 225).mean())

    # Quanta superficie e' senza dettaglio: il fondo di uno studio e' liscio,
    # l'asfalto e il paesaggio no.
    grigio = a.mean(axis=2)
    orizzontale = np.abs(np.diff(grigio, axis=1))[:-1, :]
    verticale = np.abs(np.diff(grigio, axis=0))[:, :-1]
    liscia = float(((orizzontale + verticale) < 4).mean())

    grossolano = a // 32
    chiavi = grossolano[:, :, 0] * 64 + grossolano[:, :, 1] * 8 + grossolano[:, :, 2]
    varieta = len(np.unique(chiavi)) / 512

    voto = 0.0
    voto += min(proporzione, 2.2) * 1.2        # inquadratura larga
    voto += varieta * 14                        # scena vera, non dettaglio
    voto -= bianco * 9                          # fondo da studio
    voto -= liscia * 7                          # superficie senza trama
    voto += min(im.width / 2500.0, 1.0) * 0.6   # a parita' di tutto, la piu' grande
    return (voto, im)


def candidate_suzuki(cartella, mappa):
    slug = cartella[len("suzuki-"):]
    percorso = mappa.get(slug)
    if not percorso:
        return []
    html = scarica(SUZUKI + percorso, SUZUKI + "/").decode("utf-8", "replace")
    # La galleria numerata (_1, _2, _3...) raccoglie gli scatti in scena:
    # la moto in pista, in citta', in viaggio. L'immagine grande di apertura
    # invece, per certi modelli, e' un fotomontaggio da studio su fondo
    # diagonale. Percio' guardiamo prima la galleria.
    galleria = re.findall(r"(/upl/cache/Suzuki_[^\"']+?_\d+-\d+-800x470\.jpg)", html, re.I)
    apertura = re.findall(r"(/upl/cache/Suzuki_[^\"']+?-\d+-2880x1755\.jpg)", html, re.I)
    tutte = list(dict.fromkeys(list(galleria) + list(apertura)))
    return [SUZUKI + u for u in tutte if not re.search(SCARTI, u, re.I)]


def candidate_voge(cartella):
    slug = cartella[len("voge-"):]
    html = scarica("%s/%s/" % (VOGE, slug), VOGE + "/").decode("utf-8", "replace")
    trovate = re.findall(r"https://vogeitaly\.it/wp-content/uploads/[^\"'\s)]+\.jpe?g", html, re.I)
    trovate = [re.sub(r"-\d+x\d+(\.jpe?g)$", r"\1", u, flags=re.I) for u in trovate]
    trovate = [re.sub(r"-scaled(\.jpe?g)$", r"\1", u, flags=re.I) for u in trovate]
    return [u for u in dict.fromkeys(trovate) if not re.search(SCARTI, u, re.I)]


def mappa_suzuki():
    html = scarica(SUZUKI + "/", SUZUKI + "/").decode("utf-8", "replace")
    percorsi = sorted(set(re.findall(r'href="(/modelli/\d+/[^"]+\.aspx)"', html)))
    return {p.rsplit("/", 1)[-1].replace(".aspx", ""): p for p in percorsi}


def miniatura_sfondo(origine):
    im = Image.open(origine).convert("RGB")
    altezza = max(1, round(im.height * 64 / im.width))
    im = im.resize((64, altezza), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    im.save(origine.replace("in-strada.webp", "in-strada-sfondo.webp"), "WEBP", quality=80, method=6)


def main():
    p = argparse.ArgumentParser(description="Sostituisce le fotografie di catalogo scadenti.")
    p.add_argument("--tutte", action="store_true")
    p.add_argument("--modelli", nargs="*", default=None, help="solo queste cartelle")
    a = p.parse_args()

    # Quali rifare: quelle bocciate dal controllo, o tutte se richiesto.
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "controllo", os.path.join("strumenti", "controlla-ambientate.py"))
    controllo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(controllo)

    import glob
    tutte = sorted(os.path.basename(os.path.dirname(x))
                   for x in glob.glob(os.path.join("public", "moto", "*", "in-strada.webp")))
    if a.modelli:
        da_fare = [c for c in tutte if c in a.modelli]
    elif a.tutte:
        da_fare = tutte
    else:
        da_fare = [c for c in tutte
                   if controllo.esamina(os.path.join("public", "moto", c, "in-strada.webp"))]

    print("Da rifare: %d\n" % len(da_fare))
    mappa = mappa_suzuki() if any(c.startswith("suzuki-") for c in da_fare) else {}

    sistemate = 0
    for cartella in da_fare:
        destinazione = os.path.join("public", "moto", cartella, "in-strada.webp")
        attuale = punteggio(open(destinazione, "rb").read())[0]

        try:
            if cartella.startswith("suzuki-"):
                candidate = candidate_suzuki(cartella, mappa)
                referer = SUZUKI + "/"
            elif cartella.startswith("voge-"):
                candidate = candidate_voge(cartella)
                referer = VOGE + "/"
            else:
                continue
        except RuntimeError:
            print("  %-34s pagina non raggiunta" % cartella)
            continue

        migliore = (attuale, None)
        for url in candidate[:18]:
            try:
                dati = scarica(url, referer)
            except RuntimeError:
                continue
            voto, im = punteggio(dati)
            if im is not None and voto > migliore[0]:
                migliore = (voto, im)

        if migliore[1] is None:
            print("  %-34s nessuna migliore (voto attuale %.2f)" % (cartella, attuale))
            continue

        im = migliore[1]
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(destinazione, "WEBP", quality=86, method=4)
        miniatura_sfondo(destinazione)
        sistemate += 1
        print("  %-34s %.2f -> %.2f" % (cartella, attuale, migliore[0]))

    print("\n%d fotografie sostituite." % sistemate)


if __name__ == "__main__":
    main()
