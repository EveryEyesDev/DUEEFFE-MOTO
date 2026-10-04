#!/usr/bin/env python3
"""
Prepara le icone del sito a partire dal logo vero.

A COSA SERVE
E' quello che fa comparire il simbolo della concessionaria nella linguetta
del browser, accanto all'indirizzo e nei preferiti. Senza, i browser
mostrano un foglio bianco anonimo.

PERCHE' DUE DISEGNI DIVERSI
Il logo per esteso, con le scritte "dueffe" e "moto", nella linguetta del
browser e' largo 16 pixel: le lettere diventano una macchia illeggibile.
Per quella misura serve un segno semplice, e nel nostro logo c'e' gia': il
motociclista. Sta in piedi anche piccolissimo.

Percio':
  app/icon.png         il motociclista, per la linguetta e i preferiti
  app/apple-icon.png   il logo intero, per l'icona sulla schermata del
                       telefono, dove lo spazio c'e'

COME SI USA
    python strumenti/genera-icone.py
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

SORGENTE = os.path.join("public", "brand", "dueffe-logo.png")
FONDO = (7, 7, 9, 255)


def ritagliata():
    im = Image.open(SORGENTE).convert("RGBA")
    riquadro = im.split()[-1].getbbox()
    return im.crop(riquadro) if riquadro else im


def solo_motociclista(logo):
    """Il motociclista sta in alto a destra nel logo, sopra le scritte."""
    w, h = logo.size
    rider = logo.crop((round(w * 0.22), 0, w, round(h * 0.58)))
    riquadro = rider.split()[-1].getbbox()
    return rider.crop(riquadro) if riquadro else rider


def su_quadrato(disegno, lato, occupazione):
    tela = Image.new("RGBA", (lato, lato), FONDO)
    utile = round(lato * occupazione)
    fattore = min(utile / disegno.width, utile / disegno.height)
    piccolo = disegno.resize(
        (max(1, round(disegno.width * fattore)), max(1, round(disegno.height * fattore))),
        Image.LANCZOS,
    )
    tela.alpha_composite(piccolo, ((lato - piccolo.width) // 2, (lato - piccolo.height) // 2))
    return tela


def main():
    logo = ritagliata()
    su_quadrato(solo_motociclista(logo), 512, 0.80).save(os.path.join("app", "icon.png"))
    su_quadrato(logo, 180, 0.84).save(os.path.join("app", "apple-icon.png"))
    print("Icone scritte: app/icon.png (motociclista), app/apple-icon.png (logo intero)")


if __name__ == "__main__":
    main()
