#!/usr/bin/env python3
"""
Mette tutte le fotografie delle moto sulla stessa tela.

IL PROBLEMA
Ogni scatto viene ritagliato attorno alla moto, quindi ogni file ha una sua
forma: uno largo e basso, uno quasi quadrato. In pagina, con un'altezza
fissa, una moto lunga risulta enorme e una corta minuscola; con una
larghezza fissa succede il contrario. In ogni caso non sembrano mai della
stessa misura.

LA SOLUZIONE
Qui riscriviamo ogni scatto dentro una tela sempre uguale, in proporzione
3:2, con la moto larga nove decimi della tela e appoggiata in basso. Da
quel momento tutti i file hanno la stessa forma: al sito basta un'altezza
sola e tutte le moto occupano lo stesso spazio, con le ruote sulla stessa
riga.

Se una moto alta (un'adventure, uno scooter) sforasse in altezza, la
rimpiccioliamo quel tanto che basta a farla stare: meglio una moto un filo
piu' piccola che una tagliata.

COME SI USA
    python strumenti/uniforma-foto.py              tutte le cartelle
    python strumenti/uniforma-foto.py suzuki-      solo quelle che iniziano cosi'

Lavora sulle viste studio (fronte, retro, lato, inclinata) e lascia stare
le fotografie ambientate, che non sono scontornate.
"""

import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

# Proporzione della tela: 3 di larghezza ogni 2 di altezza.
PROPORZIONE = 3 / 2
# Quanta parte della tela occupa la moto in larghezza e, al massimo, in altezza.
LARGHEZZA_MOTO = 0.90
ALTEZZA_MASSIMA = 0.86
# Quanto spazio resta sotto le ruote, per non incollarle al bordo.
ZOCCOLO = 0.04

VISTE = {
    "fronte",
    "retro",
    "lato-destro",
    "lato-sinistro",
    "angolo-destro",
    "angolo-sinistro",
}


def uniforma(percorso, larghezza_tela):
    im = Image.open(percorso).convert("RGBA")

    riquadro = im.split()[-1].getbbox()
    if riquadro is None:
        return None
    im = im.crop(riquadro)

    altezza_tela = round(larghezza_tela / PROPORZIONE)

    # Quanto ingrandire o rimpicciolire: di norma comanda la larghezza, ma
    # se cosi' la moto non ci sta in altezza, comanda l'altezza.
    fattore = larghezza_tela * LARGHEZZA_MOTO / im.width
    if im.height * fattore > altezza_tela * ALTEZZA_MASSIMA:
        fattore = altezza_tela * ALTEZZA_MASSIMA / im.height

    nuova = (max(1, round(im.width * fattore)), max(1, round(im.height * fattore)))
    im = im.resize(nuova, Image.LANCZOS)

    tela = Image.new("RGBA", (larghezza_tela, altezza_tela), (0, 0, 0, 0))
    x = (larghezza_tela - im.width) // 2
    y = altezza_tela - im.height - round(altezza_tela * ZOCCOLO)
    tela.paste(im, (x, max(0, y)))
    return tela


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""
    schema = os.path.join("public", "moto", filtro + "*", "*", "*.webp")

    fatti = 0
    saltati = 0
    for percorso in sorted(glob.glob(schema)):
        nome = os.path.splitext(os.path.basename(percorso))[0]
        if nome not in VISTE:
            saltati += 1
            continue

        im = Image.open(percorso)
        if im.mode != "RGBA":
            saltati += 1
            continue
        # La tela non scende sotto i 1200 pixel: sotto, le viste
        # grandi in pagina si vedrebbero sgranate.
        larghezza = max(im.width, 1200)
        im.close()

        tela = uniforma(percorso, larghezza)
        if tela is None:
            saltati += 1
            continue
        tela.save(percorso, "WEBP", quality=86, method=4)
        fatti += 1

    print("%d scatti uniformati, %d lasciati stare." % (fatti, saltati))
    if fatti:
        print("Ora hanno tutti proporzione 3:2: al sito basta fissare l'altezza.")


if __name__ == "__main__":
    main()
