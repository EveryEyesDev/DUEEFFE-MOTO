#!/usr/bin/env python3
"""
Prepara le versioni minuscole e sfocate delle fotografie su strada.

PERCHE' SERVE
Nello showcase la fotografia ambientata sta sul fondo, molto sfocata. Farla
sfocare al browser con un filtro CSS significa chiedergli di rielaborare
un'immagine da 1600 pixel ad ogni fotogramma dello scorrimento: e' la prima
causa di scattosita'. Qui la sfocatura la facciamo una volta sola, in
partenza, e salviamo un file da pochi chilobyte: il browser lo ingrandisce
e basta, senza calcolare nulla.

COME SI USA
    python strumenti/sfondi-sfocati.py

Per ogni public/moto/<modello>/in-strada.webp scrive, accanto,
in-strada-sfondo.webp larga 64 pixel.
"""

import glob
import os
import sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

LARGHEZZA = 64

fatti = 0
for origine in sorted(glob.glob(os.path.join("public", "moto", "*", "in-strada.webp"))):
    destinazione = origine.replace("in-strada.webp", "in-strada-sfondo.webp")
    im = Image.open(origine).convert("RGB")
    altezza = max(1, round(im.height * LARGHEZZA / im.width))
    im = im.resize((LARGHEZZA, altezza), Image.LANCZOS)
    # Una passata leggera toglie le scalettature nate dal rimpicciolimento.
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    im.save(destinazione, "WEBP", quality=80, method=6)
    peso = os.path.getsize(destinazione)
    print("%-44s %dx%d  %.1f kB" % (destinazione, LARGHEZZA, altezza, peso / 1024))
    fatti += 1

print("\n%d sfondi preparati." % fatti)
