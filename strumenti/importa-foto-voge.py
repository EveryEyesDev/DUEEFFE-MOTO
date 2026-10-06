#!/usr/bin/env python3
"""
Importa la gamma Voge dal sito ufficiale italiano.

A COSA SERVE
Legge vogeitaly.it, ricava l'elenco dei modelli dalla mappa del sito e per
ognuno scarica le fotografie in studio gia' scontornate, piu' una
fotografia ambientata per il catalogo. Converte tutto in WebP sulla stessa
tela degli altri marchi e scrive il blocco di dati da incollare nel
catalogo.

COME SI USA
    python strumenti/importa-foto-voge.py            tutta la gamma
    python strumenti/importa-foto-voge.py --elenca   mostra cosa troverebbe
    python strumenti/importa-foto-voge.py --solo valico

QUANTE VISTE
Voge, a differenza di Suzuki, non pubblica il giro a 360 gradi: di ogni
modello ci sono una o due fotografie in studio, di solito il profilo
destro e una tre quarti anteriore. Prendiamo quelle. Le sei viste di
scheda, per questa marca, non esistono alla fonte: non le inventiamo.

COME EVITIAMO DI MESCOLARE I MODELLI
Ogni pagina Voge porta in fondo il menu delle moto sorelle, con le loro
fotografie: sulla pagina della Trofeo 525 compaiono anche la 300, la 350 e
la 500, e sulle pagine Sfida compare sempre la stessa fila di scooter.
Prese cosi' com'e', ogni modello finirebbe con le foto di un altro.

Il criterio che usiamo e' semplice e si verifica da solo: leggiamo prima
tutte le pagine, contiamo su quante compare ciascuna fotografia, e
teniamo solo quelle che stanno su una pagina sola. Le immagini del menu,
per definizione, si ripetono ovunque; quella della moto sta solo a casa
sua. Non serve indovinare nomi di file.

DIRITTI
Sono immagini ufficiali del distributore. Un concessionario puo'
normalmente usarle per i modelli che vende, ma la conferma va chiesta al
proprio referente.
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

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

BASE = "https://vogeitaly.it"
MAPPA = BASE + "/wp-sitemap-posts-page-1.xml"
CURL = shutil.which("curl")

INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "it-IT,it;q=0.9",
    "Referer": BASE + "/",
}

DESTINAZIONE = os.path.join("public", "moto")

# Le famiglie Voge: solo queste pagine sono schede di modello.
#
# Gli XWolf restano fuori di proposito: sono quad, non moto, e il salone
# non li tratta. Finivano nel catalogo perche' Voge li pubblica insieme
# alla gamma, ma in un elenco di moto erano fuori posto.
FAMIGLIE = r"^(brivido|trofeo|valico|sfida)"

# Famiglie ricondotte alle categorie del nostro catalogo.
CATEGORIE = [
    (r"^sfida", ("naked", "Scooter")),
    (r"^valico", ("adventure", "Adventure")),
    (r"^trofeo", ("naked", "Classic")),
    (r"^brivido", ("naked", "Naked")),
]

# File che stanno su ogni pagina e non c'entrano con le moto.
SCARTI = r"(logo|icon|cropped|revslider|sfondo|patente|copertina|player|landing|placeholder|banner)"

# La tela comune, la stessa degli altri marchi (vedi uniforma-foto.py).
PROPORZIONE = 3 / 2
LARGHEZZA_MOTO = 0.90
ALTEZZA_MASSIMA = 0.86
ZOCCOLO = 0.04


def scarica(url, tentativi=3):
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    comando = [CURL, "-sLg", "--max-time", "60", "--fail", "--compressed"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", "%s: %s" % (chiave, valore)]
    comando.append(url)

    ultimo = "nessun tentativo"
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        ultimo = "curl uscito con %d" % esito.returncode
        time.sleep(0.6 * (n + 1))
    raise RuntimeError(ultimo)


def ripulisci(testo):
    testo = unicodedata.normalize("NFKD", testo).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", testo).strip("-").lower()


def solo_lettere_numeri(testo):
    return re.sub(r"[^a-z0-9]+", "", testo.lower())


def categoria_di(slug):
    for schema, esito in CATEGORIE:
        if re.search(schema, slug):
            return esito
    return ("naked", "Moto")


def elenco_modelli():
    """Legge le pagine modello dalla mappa del sito. Torna (url, slug)."""
    xml = scarica(MAPPA).decode("utf-8", "replace")
    pagine = re.findall(r"<loc>([^<]+)</loc>", xml)
    modelli = []
    for url in sorted(pagine):
        slug = url.rstrip("/").rsplit("/", 1)[-1]
        if re.match(FAMIGLIE, slug):
            modelli.append((url, slug))
    return modelli


def titolo_di(html, ripiego):
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    if not m:
        return ripiego.replace("-", " ").title()
    titolo = m.group(1).split("&#8211;")[0].split("|")[0].strip()
    return titolo or ripiego.replace("-", " ").title()


def candidate_di(html):
    """Tutte le PNG della pagina che potrebbero essere una moto scontornata."""
    trovate = []
    for url in re.findall(r"https://vogeitaly\.it/wp-content/uploads/[^\"'\s)]+\.png", html, re.I):
        url = re.sub(r"-\d+x\d+\.png$", ".png", url, flags=re.I)
        if re.search(SCARTI, url.rsplit("/", 1)[-1], re.I):
            continue
        if url not in trovate:
            trovate.append(url)
    return trovate


def solo_sue(candidate, quante_pagine):
    """
    Tiene le fotografie che compaiono su una pagina sola.

    Vedi la nota in cima: le immagini del menu delle moto sorelle si
    ripetono su piu' pagine, quella del modello no.
    """
    return [u for u in candidate if quante_pagine.get(u, 0) == 1]


def ambientata_di(html, slug):
    """
    La fotografia ambientata per il catalogo.

    Prendiamo quella che il sito dichiara come immagine di anteprima
    (og:image): e' scelta dalla redazione Voge, quindi e' sempre
    rappresentativa. In mancanza, il primo scatto di reportage.
    """
    m = re.search(r'property="og:image"\s+content="([^"]+)"', html, re.I)
    if m and not re.search(SCARTI, m.group(1), re.I):
        return m.group(1)
    scatti = re.findall(r"https://vogeitaly\.it/wp-content/uploads/[^\"'\s)]+\.jpe?g", html, re.I)
    scatti = [re.sub(r"-scaled(\.jpe?g)$", r"\1", s) for s in scatti]
    scatti = [s for s in scatti if not re.search(SCARTI, s, re.I)]
    return scatti[0] if scatti else ""


def su_tela_comune(im, larghezza_tela):
    """Stessa tela 3:2 degli altri marchi, cosi' le moto hanno tutte la stessa misura."""
    riquadro = im.split()[-1].getbbox()
    if riquadro is None:
        return None
    im = im.crop(riquadro)

    altezza_tela = round(larghezza_tela / PROPORZIONE)
    fattore = larghezza_tela * LARGHEZZA_MOTO / im.width
    if im.height * fattore > altezza_tela * ALTEZZA_MASSIMA:
        fattore = altezza_tela * ALTEZZA_MASSIMA / im.height
    im = im.resize(
        (max(1, round(im.width * fattore)), max(1, round(im.height * fattore))), Image.LANCZOS
    )

    tela = Image.new("RGBA", (larghezza_tela, altezza_tela), (0, 0, 0, 0))
    tela.paste(
        im,
        ((larghezza_tela - im.width) // 2,
         max(0, altezza_tela - im.height - round(altezza_tela * ZOCCOLO))),
    )
    return tela


def salva(dati, destinazione, larghezza, qualita, scontornata):
    try:
        im = Image.open(_io.BytesIO(dati))
        im.load()
    except Exception:
        return None

    if im.width > larghezza:
        im = im.resize((larghezza, round(im.height * larghezza / im.width)), Image.LANCZOS)

    if scontornata:
        im = im.convert("RGBA")
        if im.split()[-1].getextrema()[0] == 255:
            return None  # non e' scontornata: ha il fondo pieno
        im = su_tela_comune(im, larghezza)
        if im is None:
            return None
    else:
        im = im.convert("RGB")

    os.makedirs(os.path.dirname(destinazione), exist_ok=True)
    im.save(destinazione, "WEBP", quality=qualita, method=4)
    return im.size


def miniatura_sfondo(origine):
    im = Image.open(origine).convert("RGB")
    altezza = max(1, round(im.height * 64 / im.width))
    im = im.resize((64, altezza), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    im.save(origine.replace("in-strada.webp", "in-strada-sfondo.webp"), "WEBP", quality=80, method=6)


def blocco_dati(cartella, nome, cat, etichetta_cat, viste, ambientata):
    righe = "\n".join(
        "          { id: '%s', label: '%s', src: '/moto/%s/unica/%s.webp' },"
        % (vista, etichetta, cartella, vista)
        for vista, etichetta in viste
    )
    testo = (
        "  {\n"
        "    id: '%s',\n"
        "    brand: 'Voge',\n"
        "    name: '%s',\n"
        "    subtitle: 'Scheda tecnica da completare',\n"
        "    condition: 'nuovo',\n"
        "    category: '%s',\n"
        "    categoryLabel: '%s',\n"
        "    tagline: 'Chiedici tutto in salone',\n"
        "    description: 'Modello della gamma Voge. Dati tecnici e prezzo te li "
        "diamo in concessionaria: chiamaci o passa a trovarci.',\n"
        "    image: '/moto/%s/unica/%s.webp',\n"
    ) % (cartella, nome, cat, etichetta_cat, cartella, viste[0][0])

    if ambientata:
        testo += "    roadImage: '/moto/%s/in-strada.webp',\n" % cartella

    testo += (
        "    colorways: [\n"
        "      {\n"
        "        slug: 'unica',\n"
        "        name: 'Livrea ufficiale',\n"
        "        hex: '#1a1a1e',\n"
        "        views: [\n%s\n        ],\n"
        "      },\n"
        "    ],\n"
        "    colors: [],\n"
        "    specs: {},\n"
        "    features: [],\n"
        "  }," % righe
    )
    return testo


def main():
    p = argparse.ArgumentParser(description="Importa la gamma Voge.")
    p.add_argument("--elenca", action="store_true")
    p.add_argument("--solo", default=None)
    p.add_argument("--larghezza", type=int, default=1600)
    p.add_argument("--qualita", type=int, default=86)
    a = p.parse_args()

    modelli = elenco_modelli()
    if a.solo:
        modelli = [m for m in modelli if a.solo in m[1]]
    print("Pagine modello trovate: %d" % len(modelli))

    # PRIMA PASSATA: leggiamo tutte le pagine e contiamo dove compare ogni
    # fotografia. Serve a distinguere la moto dal menu delle sorelle.
    print("Leggo le pagine...")
    pagine = {}
    quante_pagine = {}
    for url, slug in modelli:
        try:
            html = scarica(url).decode("utf-8", "replace")
        except RuntimeError as e:
            print("  %-28s pagina non raggiunta (%s)" % (slug, e))
            continue
        pagine[slug] = (url, html)
        for immagine in candidate_di(html):
            quante_pagine[immagine] = quante_pagine.get(immagine, 0) + 1
    print("")

    # SECONDA PASSATA: scarichiamo quello che resta.
    voci = []
    senza_foto = []
    for url, slug in modelli:
        if slug not in pagine:
            continue
        html = pagine[slug][1]
        cartella = "voge-" + ripulisci(slug)
        nome = titolo_di(html, slug)
        scontornate = solo_sue(candidate_di(html), quante_pagine)

        if a.elenca:
            print("  %-28s %d sue: %s" % (
                nome, len(scontornate),
                ", ".join(u.rsplit("/", 1)[-1] for u in scontornate[:4]) or "nessuna"))
            continue

        """
        QUALE SCATTO E' IL PROFILO
        Voge pubblica le fotografie senza un ordine, quindi non si puo'
        dare per scontato che la prima sia il profilo. Lo riconosciamo
        dalla sagoma: una moto di profilo e' molto piu' larga che alta,
        una di tre quarti e' piu' compatta. Mettiamo davanti la piu'
        larga, perche' il profilo e' l'inquadratura che in vetrina fa
        sembrare la moto una moto.
        """
        scaricate = []
        for indirizzo in scontornate[:4]:
            try:
                dati = scarica(indirizzo, tentativi=2)
            except RuntimeError:
                continue
            try:
                prova = Image.open(_io.BytesIO(dati))
                prova.load()
                prova = prova.convert("RGBA")
            except Exception:
                continue
            if prova.split()[-1].getextrema()[0] == 255:
                continue  # ha il fondo pieno: non e' scontornata
            riquadro = prova.split()[-1].getbbox()
            if riquadro is None:
                continue
            larghezza = riquadro[2] - riquadro[0]
            altezza = max(1, riquadro[3] - riquadro[1])
            scaricate.append((larghezza / altezza, dati))

        scaricate.sort(key=lambda x: -x[0])

        etichette = [("lato-destro", "Lato destro"), ("angolo-destro", "Inclinata a destra")]
        viste = []
        for _, dati in scaricate[:2]:
            vista, etichetta = etichette[len(viste)]
            out = os.path.join(DESTINAZIONE, cartella, "unica", vista + ".webp")
            if salva(dati, out, a.larghezza, a.qualita, True):
                viste.append((vista, etichetta))

        if not viste:
            print("  %-28s nessuna fotografia in studio" % nome)
            senza_foto.append(nome)
            continue

        ambientata = ""
        indirizzo = ambientata_di(html, slug)
        if indirizzo:
            try:
                dati = scarica(indirizzo, tentativi=2)
                out = os.path.join(DESTINAZIONE, cartella, "in-strada.webp")
                if salva(dati, out, 1600, a.qualita, False):
                    miniatura_sfondo(out)
                    ambientata = out
            except RuntimeError:
                pass

        cat, etichetta_cat = categoria_di(slug)
        voci.append((cartella, nome, cat, etichetta_cat, viste, ambientata))
        print("  %-28s %d viste%s" % (nome, len(viste), "" if ambientata else "   SENZA ambientata"))

    if a.elenca or not voci:
        return

    testo = (
        "// Generato da strumenti/importa-foto-voge.py\n"
        "// Incolla queste voci dentro MOTO_NUOVE in src/data/motorcycles.ts\n"
        "// Le schede tecniche sono vuote: vanno compilate col listino ufficiale.\n\n"
        + "\n".join(blocco_dati(*v) for v in voci)
        + "\n"
    )
    percorso_out = os.path.join("strumenti", "voge-generato.ts.txt")
    with open(percorso_out, "w", encoding="utf-8") as f:
        f.write(testo)

    print("\n%d modelli importati." % len(voci))
    print("Blocco dati scritto in %s" % percorso_out)
    if senza_foto:
        print("\nSenza fotografie in studio alla fonte:")
        for n in senza_foto:
            print("  - %s" % n)


if __name__ == "__main__":
    main()
