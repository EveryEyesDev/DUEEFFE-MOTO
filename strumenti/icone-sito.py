#!/usr/bin/env python3
"""
Fa le icone del sito: quella della scheda del browser e quella di Google.

IL PROBLEMA
Accanto al risultato di ricerca Google mostrava il mondo generico invece
del logo. Due cause, tutte e due da togliere di mezzo.

La prima: mancava /favicon.ico. Google l'icona la cerca prima di tutto
li', a quell'indirizzo esatto, e solo dopo guarda i tag della pagina.
Next da solo scrive il tag ma non il file.

La seconda: l'icona c'era ma lasciava margini vuoti attorno al disegno,
quindi il logo occupava meno della meta' del quadratino e a misura di
unghia restava poco.

IL LOGO, RITAGLIATO STRETTO
E' il logo vero del salone, non un segno ricavato: si ritaglia sui suoi
stessi bordi - via il trasparente attorno - e si mette sul nero del sito
riempiendo quasi tutto il quadrato. Piu' grande di cosi' non si puo'
farlo stare.

UNA COSA DA SAPERE
A sedici pixel, che e' la misura nei risultati di ricerca, un disegno a
filo come la moto del logo si impasta: si riconoscera' il blocco rosso di
"moto" e poco altro. E' il limite di questo logo a quella misura, non un
difetto del file. Se un domani si volesse un segno che regge anche li',
la "f" rossa dentro "dueffe" sarebbe la candidata naturale - e' gia' nel
logo, quindi non ci sarebbe niente da inventare.

LE MISURE
favicon.ico tiene 16, 32 e 48 pixel insieme: i browser scelgono.
icon.png e' 192, che e' multiplo di 48 come Google chiede nelle sue
indicazioni. apple-icon.png e' 180, la misura che vuole iOS per l'icona
sulla schermata.

COME SI USA
    python strumenti/icone-sito.py
"""

import os
import sys

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

LOGO = os.path.join("public", "brand", "dueffe-logo.png")
ROSSO = (208, 0, 32)

# Il fondo delle icone: lo stesso nero della pagina, cosi' l'icona non
# sembra incollata sopra un riquadro di un altro colore.
FONDO = (7, 7, 9)


def logo_ritagliato():
    """Il logo, tolto il trasparente attorno."""
    im = Image.open(LOGO).convert("RGBA")
    riquadro = im.split()[-1].getbbox()
    return im.crop(riquadro) if riquadro else im


def icona(lato, logo, quadrata=False):
    """Il logo centrato su un quadrato nero."""
    tela = Image.new("RGBA", (lato, lato), (0, 0, 0, 0))
    penna = ImageDraw.Draw(tela)
    if quadrata:
        # Dentro un .ico gli angoli smussati lascerebbero trasparenze che
        # certi browser disegnano di bianco: meglio pieno fino al bordo.
        penna.rectangle([0, 0, lato - 1, lato - 1], fill=FONDO)
    else:
        penna.rounded_rectangle(
            [0, 0, lato - 1, lato - 1], radius=max(2, lato // 8), fill=FONDO
        )

    # Il logo riempie il 92% del lato: piu' di cosi' tocca gli angoli.
    disponibile = round(lato * 0.92)
    fattore = min(disponibile / logo.width, disponibile / logo.height)
    misura = (max(1, round(logo.width * fattore)), max(1, round(logo.height * fattore)))
    ridotto = logo.resize(misura, Image.LANCZOS)
    tela.alpha_composite(ridotto, ((lato - misura[0]) // 2, (lato - misura[1]) // 2))
    return tela


def main():
    logo = logo_ritagliato()

    grande = icona(512, logo)
    grande.resize((192, 192), Image.LANCZOS).save(os.path.join("app", "icon.png"))
    grande.resize((180, 180), Image.LANCZOS).save(os.path.join("app", "apple-icon.png"))

    # Il .ico tiene dentro tutte e tre le misure: lo decide il browser.
    #
    # Resta in RGBA anche se e' un quadrato pieno e trasparenze non ne ha:
    # dentro un .ico Pillow incapsula dei PNG, e Next rifiuta di elaborare
    # il file se quei PNG non sono RGBA. Convertirlo in RGB faceva fallire
    # la compilazione con "The PNG is not in RGBA format" e il sito
    # rispondeva 500.
    piatta = icona(512, logo, quadrata=True)
    piatta.save(
        os.path.join("app", "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    for percorso in ("app/icon.png", "app/apple-icon.png", "app/favicon.ico"):
        print("  %-24s %.0f kB" % (percorso, os.path.getsize(percorso) / 1024))


if __name__ == "__main__":
    main()
