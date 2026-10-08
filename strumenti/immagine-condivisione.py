#!/usr/bin/env python3
"""
Fa l'immagine che compare quando si incolla il link del sito.

A COSA SERVE
Incollando dueeffemoto.it in WhatsApp, su Facebook o in una mail, finora
usciva un riquadro con titolo e descrizione e nessuna figura: il sito non
aveva nessuna immagine di condivisione. Un collegamento senza figura, in
mezzo a una chat, si legge come un collegamento qualunque.

Le schede delle singole moto ce l'avevano gia' - usano la fotografia su
strada di quella moto, che e' la cosa giusta da mostrare. Mancava per la
home, per il catalogo e per la pagina privacy.

COM'E' FATTA
Milleduecento per seicentotrenta pixel, che e' la misura che tutti i
social ritagliano senza tagliare niente, fondo nero del sito e in mezzo il
logo vero del salone, grande. Niente scritte aggiunte: il titolo e la
descrizione li mette gia' il social accanto alla figura, e ripeterli nella
figura stessa vuol dire leggerli due volte.

L'alone rosso dietro al logo e' lo stesso del sito, cosi' chi apre il
collegamento ritrova quello che ha visto nell'anteprima.

COME SI USA
    python strumenti/immagine-condivisione.py

Scrive app/opengraph-image.png, che Next riconosce dal nome e attacca da
solo a tutte le pagine che non ne hanno una propria.
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

# La misura che i social ritagliano senza perdere niente.
LARGHEZZA, ALTEZZA = 1200, 630

FONDO = (7, 7, 9)
ROSSO = (208, 0, 32)

LOGO = os.path.join("public", "brand", "dueffe-logo.png")
USCITA = os.path.join("app", "opengraph-image.png")


def main():
    tela = Image.new("RGB", (LARGHEZZA, ALTEZZA), FONDO)

    # L'alone rosso dietro al logo, lo stesso dell'apertura del sito.
    # Si disegna su un livello a parte e si sfoca: una sfumatura radiale
    # fatta pixel per pixel costerebbe di piu' e si vedrebbe uguale.
    alone = Image.new("RGB", (LARGHEZZA, ALTEZZA), FONDO)
    penna = ImageDraw.Draw(alone)
    penna.ellipse(
        [LARGHEZZA // 2 - 330, ALTEZZA // 2 - 190, LARGHEZZA // 2 + 330, ALTEZZA // 2 + 190],
        fill=(58, 6, 16),
    )
    tela = Image.blend(tela, alone.filter(ImageFilter.GaussianBlur(110)), 1.0)

    logo = Image.open(LOGO).convert("RGBA")
    # Il logo occupa poco piu' di meta' larghezza: abbastanza da leggersi
    # anche nell'anteprima piccola di una chat, non tanto da toccare i
    # bordi, che certi social arrotondano.
    larghezza_logo = int(LARGHEZZA * 0.56)
    altezza_logo = round(logo.height * larghezza_logo / logo.width)
    logo = logo.resize((larghezza_logo, altezza_logo), Image.LANCZOS)

    tela = tela.convert("RGBA")
    tela.alpha_composite(
        logo,
        ((LARGHEZZA - larghezza_logo) // 2, (ALTEZZA - altezza_logo) // 2),
    )

    os.makedirs(os.path.dirname(USCITA), exist_ok=True)
    tela.convert("RGB").save(USCITA, "PNG", optimize=True)
    print("Scritto %s — %dx%d, %.0f kB" % (USCITA, LARGHEZZA, ALTEZZA, os.path.getsize(USCITA) / 1024))


if __name__ == "__main__":
    main()
