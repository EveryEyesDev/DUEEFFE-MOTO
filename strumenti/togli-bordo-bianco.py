#!/usr/bin/env python3
"""
Toglie l'alone bianco rimasto sul bordo delle moto scontornate.

IL PROBLEMA
Lo scontorno segue il contorno della moto, ma sul filo del contorno
restano i pixel in cui il bianco dello studio si mescola al colore della
moto. Su fondo bianco non si vedono; sulle nostre pagine scure diventano
una righina chiara attorno alla sagoma, e la moto sembra ritagliata male
con le forbici.

COME SI TOGLIE
Guardiamo solo i pixel di bordo, cioe' quelli che hanno almeno un vicino
trasparente. Se sono chiari e senza tinta, sono fondo rimasto attaccato e
li rendiamo trasparenti. Ripetiamo qualche volta, perche' l'alone e'
spesso due o tre pixel.

Dentro la sagoma non entriamo mai: un parafango bianco non ha vicini
trasparenti, quindi non viene toccato.

COME SI USA
    python strumenti/togli-bordo-bianco.py            tutte le viste studio
    python strumenti/togli-bordo-bianco.py suzuki-    solo quelle che iniziano cosi'
"""

import glob
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

# Quante volte sbucciare il bordo: l'alone e' spesso due o tre pixel.
PASSATE = 3
# Quanto dev'essere chiaro un pixel di bordo per essere fondo.
CHIARO = 170
# Quanto dev'essere senza tinta.
SENZA_TINTA = 34

VISTE = {"fronte", "retro", "lato-destro", "lato-sinistro", "angolo-destro", "angolo-sinistro"}


def sbuccia(percorso):
    im = Image.open(percorso)
    if im.mode != "RGBA":
        return 0
    a = np.array(im.convert("RGBA")).astype(int)
    alpha = a[:, :, 3]
    rgb = a[:, :, :3]
    chiaro = (rgb.min(axis=2) > CHIARO) & ((rgb.max(axis=2) - rgb.min(axis=2)) < SENZA_TINTA)

    tolti = 0
    for _ in range(PASSATE):
        pieno = alpha > 10
        vuoto = ~pieno
        vicino_al_vuoto = np.zeros_like(pieno)
        vicino_al_vuoto[1:, :] |= vuoto[:-1, :]
        vicino_al_vuoto[:-1, :] |= vuoto[1:, :]
        vicino_al_vuoto[:, 1:] |= vuoto[:, :-1]
        vicino_al_vuoto[:, :-1] |= vuoto[:, 1:]

        bordo_chiaro = pieno & vicino_al_vuoto & chiaro
        if not bordo_chiaro.any():
            break
        alpha = np.where(bordo_chiaro, 0, alpha)
        tolti += int(bordo_chiaro.sum())

    if tolti == 0:
        return 0
    a[:, :, 3] = alpha
    Image.fromarray(a.astype(np.uint8), "RGBA").save(percorso, "WEBP", quality=86, method=4)
    return tolti


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""
    schema = os.path.join("public", "moto", filtro + "*", "*", "*.webp")
    viste = 0
    pixel = 0
    for percorso in sorted(glob.glob(schema)):
        if os.path.splitext(os.path.basename(percorso))[0] not in VISTE:
            continue
        n = sbuccia(percorso)
        if n:
            viste += 1
            pixel += n
    print("%d viste sbucciate, %d pixel di bordo tolti." % (viste, pixel))


if __name__ == "__main__":
    main()
