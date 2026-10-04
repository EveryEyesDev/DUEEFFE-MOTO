#!/usr/bin/env python3
"""
Estrae viste e nomi dei colori dal catalogo Voge 2026 in PDF.

A COSA SERVE
Dalle pagine del sito Voge si ricavano una o due fotografie per modello, e
le livree restano senza nome. Il catalogo ufficiale in PDF, invece,
dedica a ogni modello due pagine con tre o quattro immagini grandi e con i
nomi veri dei colori stampati accanto ("Black Knight", "Matt Sand",
"Stellar Yellow"). E' materiale ufficiale, e vale la pena prenderlo.

COME SI USA
    python strumenti/importa-catalogo-voge.py            scarica ed estrae
    python strumenti/importa-catalogo-voge.py --elenca   mostra e basta

COME RICONOSCE I MODELLI
Ogni pagina del catalogo porta il nome del modello nel testo. Lo cerchiamo
li' e lo confrontiamo con le cartelle che abbiamo gia' sotto public/moto:
se combacia, le immagini di quella pagina e della successiva (che e' la
pagina illustrata dello stesso modello) appartengono a quel modello.

COSA SCARTA
Le immagini piccole, i fondi e le texture: teniamo solo quelle larghe
almeno 900 pixel e con una forma plausibile per una moto.

DIRITTI
E' il catalogo pubblico pubblicato da Voge Italy sul proprio sito.
"""

import argparse
import io as _io
import os
import re
import shutil
import subprocess
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("Manca pypdf.\nInstallalo con:  pip install pypdf")

PDF = "https://vogeitaly.it/wp-content/uploads/Catalogo-Moto-VOGE-2026.pdf"
DESTINAZIONE = os.path.join("public", "moto")
CURL = shutil.which("curl")

LARGHEZZA_MINIMA = 900

# I nomi dei colori che il catalogo stampa, da riconoscere nel testo.
COLORI_NOTI = [
    "Total Black", "Black Knight", "Matt Sand", "Matt Black", "Stellar Yellow",
    "Glacier White", "Basalt Black", "Lime Yellow", "Pearl White", "Racing Red",
    "Army Green", "Titanium Grey",
]


def scarica(url, destinazione):
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    esito = subprocess.run(
        [CURL, "-sLg", "--max-time", "180", "--fail", "-o", destinazione, url],
        capture_output=True,
    )
    if esito.returncode != 0:
        raise RuntimeError("catalogo non scaricato")


def cartelle_voge():
    """Le cartelle dei modelli Voge che abbiamo gia', per riconoscerle nel testo."""
    fuori = {}
    radice = os.path.join(DESTINAZIONE)
    if not os.path.isdir(radice):
        return fuori
    for nome in sorted(os.listdir(radice)):
        if not nome.startswith("voge-"):
            continue
        # "voge-valico525dsx" -> cerchiamo "valico" e "525dsx" nel testo
        piatto = re.sub(r"[^a-z0-9]+", "", nome[len("voge-"):])
        fuori[piatto] = nome
    return fuori


def riconosci(testo, mappa):
    """Quale modello descrive questa pagina, se lo capiamo."""
    piatto = re.sub(r"[^a-z0-9]+", "", testo.lower())
    migliore = None
    for chiave, cartella in mappa.items():
        if len(chiave) >= 6 and chiave in piatto:
            if migliore is None or len(chiave) > migliore[0]:
                migliore = (len(chiave), cartella)
    return migliore[1] if migliore else None


def colori_nel_testo(testo):
    trovati = []
    for colore in COLORI_NOTI:
        if colore.lower() in testo.lower() and colore not in trovati:
            trovati.append(colore)
    return trovati


def utile(immagine):
    """Scarta fondi, strisce e texture: teniamo solo quello che puo' essere una moto."""
    if immagine.width < LARGHEZZA_MINIMA:
        return False
    proporzione = immagine.width / immagine.height
    if proporzione < 0.55 or proporzione > 3.2:
        return False
    # Un fondo pieno ha pochissima varieta' di colore.
    piccola = immagine.convert("RGB").resize((80, 80), Image.BILINEAR)
    a = np.array(piccola) // 32
    chiavi = a[:, :, 0] * 64 + a[:, :, 1] * 8 + a[:, :, 2]
    return len(np.unique(chiavi)) >= 12


def main():
    p = argparse.ArgumentParser(description="Catalogo Voge in PDF.")
    p.add_argument("--elenca", action="store_true")
    a = p.parse_args()

    cartella_lavoro = os.path.join("strumenti", "_scarico")
    os.makedirs(cartella_lavoro, exist_ok=True)
    percorso = os.path.join(cartella_lavoro, "catalogo-voge.pdf")
    if not os.path.isfile(percorso):
        print("Scarico il catalogo...")
        scarica(PDF, percorso)

    lettore = PdfReader(percorso)
    mappa = cartelle_voge()
    print("Pagine: %d, modelli Voge gia' a catalogo: %d\n" % (len(lettore.pages), len(mappa)))

    # Primo giro: a quale modello appartiene ogni pagina.
    di_chi = {}
    colori = {}
    for n, pagina in enumerate(lettore.pages):
        testo = pagina.extract_text() or ""
        modello = riconosci(testo, mappa)
        if modello:
            di_chi[n] = modello
            # La pagina successiva, senza testo, e' l'illustrazione dello stesso modello.
            if n + 1 < len(lettore.pages) and not (lettore.pages[n + 1].extract_text() or "").strip():
                di_chi[n + 1] = modello
            trovati = colori_nel_testo(testo)
            if trovati:
                colori.setdefault(modello, trovati)

    raccolte = {}
    for n, pagina in enumerate(lettore.pages):
        modello = di_chi.get(n)
        if not modello:
            continue
        try:
            immagini = list(pagina.images)
        except Exception:
            continue
        for im in immagini:
            try:
                figura = im.image
            except Exception:
                continue
            if utile(figura):
                raccolte.setdefault(modello, []).append(figura)

    for modello in sorted(raccolte):
        print("  %-30s %d immagini   colori: %s" % (
            modello, len(raccolte[modello]), ", ".join(colori.get(modello, [])) or "-"))

    if a.elenca:
        return

    # Le salviamo come viste aggiuntive, senza toccare quelle gia' presenti.
    ETICHETTE = ["dal-catalogo-1", "dal-catalogo-2", "dal-catalogo-3", "dal-catalogo-4"]
    scritte = 0
    for modello, figure in raccolte.items():
        base = os.path.join(DESTINAZIONE, modello, "catalogo")
        os.makedirs(base, exist_ok=True)
        for k, figura in enumerate(figure[:4]):
            fuori = os.path.join(base, ETICHETTE[k] + ".webp")
            fig = figura.convert("RGB")
            if fig.width > 1600:
                fig = fig.resize((1600, round(fig.height * 1600 / fig.width)), Image.LANCZOS)
            fig.save(fuori, "WEBP", quality=86, method=4)
            scritte += 1

    print("\n%d immagini salvate sotto public/moto/<modello>/catalogo/." % scritte)
    print("Sono materiale grezzo: vanno guardate prima di metterle in pagina.")
    if colori:
        print("\nNomi dei colori trovati nel catalogo:")
        for modello, elenco in sorted(colori.items()):
            print("  %-30s %s" % (modello, ", ".join(elenco)))


if __name__ == "__main__":
    main()
