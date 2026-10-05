#!/usr/bin/env python3
"""
Sostituisce il profilo destro delle Suzuki con la fotografia di prodotto.

IL PROBLEMA
Le altre marche, in vetrina, mostrano un profilo perfetto: la moto vista
esattamente di fianco. Le Suzuki no, sembravano sempre un po' girate.

Il motivo e' nel giro a 360 gradi, da cui prendevamo le viste: ha
diciotto scatti, uno ogni venti gradi, e nessuno dei diciotto cade
esattamente sui novanta gradi dal lato destro. Il piu' vicino e' il
fotogramma 18, che sta a ottanta: si vede ancora un pezzo di muso, e
accanto a una moto fotografata di fianco si nota.

Misurato sulla GSX-8S, con il rapporto fra larghezza e altezza della
sagoma (piu' alto vuol dire piu' di profilo):
    fotogramma 09   1,63   profilo pieno, ma guarda a sinistra
    fotogramma 18   1,46   guarda a destra, ma e' girato
    foto prodotto   1,62   profilo pieno, e guarda a destra

LA SOLUZIONE
Suzuki pubblica, per ogni colore, una fotografia di prodotto che e' il
profilo destro esatto. Stava li' dall'inizio: la usavamo solo come ripiego
per i modelli senza giro a 360 gradi. Qui la mettiamo al posto del
fotogramma 18 su tutti i modelli che ce l'hanno.

Le altre cinque viste restano quelle del giro, che vanno benissimo:
fronte, retro e le tre quarti non hanno un angolo "giusto" da sbagliare.

COME SI USA
    python strumenti/profilo-suzuki.py            sostituisce
    python strumenti/profilo-suzuki.py --elenca   mostra e basta

DOPO
Vanno rilanciati, in quest'ordine:
    python strumenti/ripulisci-ombre.py suzuki-
    python strumenti/togli-bordo-bianco.py suzuki-
    python strumenti/uniforma-foto.py suzuki-
"""

import argparse
import io as _io
import os
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from urllib.parse import quote

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

BASE = "https://moto.suzuki.it"
CURL = shutil.which("curl")
DESTINAZIONE = os.path.join("public", "moto")

INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "it-IT,it;q=0.9",
    "Referer": BASE + "/",
}

SEGNO = (1, 2, 3)


def scarica(url, tentativi=3):
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    comando = [CURL, "-sLg", "--max-time", "45", "--fail", "--compressed"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", "%s: %s" % (chiave, valore)]
    comando.append(url)
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        time.sleep(0.5 * (n + 1))
    raise RuntimeError("non scaricata")


def ripulisci_nome(testo):
    testo = unicodedata.normalize("NFKD", testo).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", testo).strip("-").lower()


def elenco_modelli():
    html = scarica(BASE + "/").decode("utf-8", "replace")
    percorsi = sorted(set(re.findall(r'href="(/modelli/\d+/[^"]+\.aspx)"', html)))
    return {p.rsplit("/", 1)[-1].replace(".aspx", ""): p for p in percorsi}


def profili_di(html):
    """Le fotografie di prodotto, una per livrea: (slug della livrea, indirizzo)."""
    fuori = []
    for percorso in re.findall(
        r"(/productimg/MOTO/models/[^/\"']+/colori/([^\"']+)\.jpg)", html, re.I
    ):
        indirizzo, grezzo = percorso
        m = re.match(r"\s*\d+\s+(.+?)\s*$", grezzo)
        etichetta = m.group(1) if m else grezzo
        etichetta = re.sub(r"\s*\(MY\d+\)\s*$", "", etichetta).strip()
        slug = ripulisci_nome(etichetta)
        if slug and all(slug != s for s, _ in fuori):
            fuori.append((slug, indirizzo))
    return fuori


def scontorna(im):
    """Toglie il fondo bianco, come fa l'importatore delle fotografie."""
    im = im.convert("RGBA")
    sorgente = im.convert("RGB")
    maschera = sorgente.copy()
    angoli = [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]
    for angolo in angoli:
        if sum(maschera.getpixel(angolo)) > 690:
            ImageDraw.floodfill(maschera, angolo, SEGNO, thresh=42)
    a = np.array(maschera)
    fondo = (a[:, :, 0] == SEGNO[0]) & (a[:, :, 1] == SEGNO[1]) & (a[:, :, 2] == SEGNO[2])

    righe = np.where(~fondo.all(axis=1))[0]
    if len(righe):
        alto, basso = righe[0], righe[-1]
        inizio = max(0, basso - round((basso - alto) * 0.22))
        fascia = sorgente.crop((0, inizio, sorgente.width, basso + 1))
        for angolo in [(0, 0), (fascia.width - 1, 0),
                       (0, fascia.height - 1), (fascia.width - 1, fascia.height - 1)]:
            if sum(fascia.getpixel(angolo)) > 690:
                ImageDraw.floodfill(fascia, angolo, SEGNO, thresh=115)
        b = np.array(fascia)
        fondo[inizio:basso + 1] |= (
            (b[:, :, 0] == SEGNO[0]) & (b[:, :, 1] == SEGNO[1]) & (b[:, :, 2] == SEGNO[2])
        )

    fuori = np.array(im)
    fuori[:, :, 3] = np.where(fondo, 0, fuori[:, :, 3])
    return Image.fromarray(fuori, "RGBA")


def main():
    p = argparse.ArgumentParser(description="Profilo destro Suzuki dalle foto di prodotto.")
    p.add_argument("--elenca", action="store_true")
    p.add_argument("--larghezza", type=int, default=1600)
    a = p.parse_args()

    mappa = elenco_modelli()
    cartelle = sorted(
        d for d in os.listdir(DESTINAZIONE)
        if d.startswith("suzuki-") and os.path.isdir(os.path.join(DESTINAZIONE, d))
    )

    sostituiti = 0
    senza = []
    for cartella in cartelle:
        slug = cartella[len("suzuki-"):]
        percorso = mappa.get(slug)
        if not percorso:
            senza.append((cartella, "non in gamma"))
            continue
        try:
            html = scarica(BASE + percorso).decode("utf-8", "replace")
        except RuntimeError:
            senza.append((cartella, "pagina non raggiunta"))
            continue

        profili = profili_di(html)
        if not profili:
            senza.append((cartella, "foto di prodotto non pubblicate"))
            continue

        if a.elenca:
            print("  %-36s %d livree" % (cartella, len(profili)))
            continue

        fatti = 0
        for slug_livrea, indirizzo in profili:
            fuori = os.path.join(DESTINAZIONE, cartella, slug_livrea, "lato-destro.webp")
            if not os.path.isdir(os.path.dirname(fuori)):
                continue
            try:
                dati = scarica(BASE + quote(indirizzo, safe="/()"), tentativi=2)
            except RuntimeError:
                continue
            try:
                im = Image.open(_io.BytesIO(dati))
                im.load()
            except Exception:
                continue
            if im.width > a.larghezza:
                im = im.resize((a.larghezza, round(im.height * a.larghezza / im.width)),
                               Image.LANCZOS)
            im = scontorna(im)
            im.save(fuori, "WEBP", quality=86, method=4)
            fatti += 1

        if fatti:
            sostituiti += 1
            print("  %-36s %d profili sostituiti" % (cartella, fatti))
        else:
            senza.append((cartella, "nessuna livrea corrispondente"))

    if a.elenca:
        return
    print("\n%d modelli con il profilo destro vero." % sostituiti)
    if senza:
        print("\nRestano col fotogramma del giro a 360 gradi:")
        for cartella, motivo in senza:
            print("  %-36s %s" % (cartella, motivo))


if __name__ == "__main__":
    main()
