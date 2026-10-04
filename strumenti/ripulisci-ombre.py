#!/usr/bin/env python3
"""
Toglie l'ombra di studio rimasta sotto le moto scontornate.

IL PROBLEMA
Lo scontorno segue il contorno della moto, ma l'ombra morbida che lo
scatto ha a terra resta attaccata alle gomme: e' chiara, e sulle nostre
pagine scure si vede come una macchia bianca sotto la moto. Nel riquadro
del catalogo sembra che la fotografia sia tagliata male.

PERCHE' SERVE UNO STRUMENTO A PARTE
In fase di importazione l'ombra viene gia' aggredita, ma solo da fuori:
la parte che sta chiusa fra le due ruote non e' collegata al bordo
dell'immagine, quindi il riempimento non la raggiunge. Qui la togliamo
guardando il colore invece che la posizione.

COME FUNZIONA
Nella fascia bassa dell'immagine, dove c'e' il terreno, rendiamo
trasparenti i pixel quasi bianchi e senza tinta. La moto in quella fascia
e' fatta di gomme, scarico e piastre, che sono scuri o colorati: non
vengono toccati. Fuori dalla fascia non tocchiamo niente, cosi' un
parafango bianco o una carena chiara restano interi.

COME SI USA
    python strumenti/ripulisci-ombre.py            tutte le viste studio
    python strumenti/ripulisci-ombre.py suzuki-    solo quelle che iniziano cosi'
"""

import glob
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

# La fascia bassa dove puo' esserci l'ombra a terra.
FASCIA = 0.30
# Quanto dev'essere chiaro un pixel per essere ombra e non moto.
CHIARO = 205
# Quanto dev'essere senza tinta: l'ombra e' grigia, la moto no.
SENZA_TINTA = 26

VISTE = {"fronte", "retro", "lato-destro", "lato-sinistro", "angolo-destro", "angolo-sinistro"}


def ripulisci(percorso):
    im = Image.open(percorso)
    if im.mode != "RGBA":
        return 0
    a = np.array(im.convert("RGBA")).astype(int)
    alpha = a[:, :, 3]
    if not (alpha > 0).any():
        return 0

    righe = np.where((alpha > 0).any(axis=1))[0]
    alto, basso = righe[0], righe[-1]
    inizio = int(basso - (basso - alto) * FASCIA)

    rgb = a[:, :, :3]
    chiaro = rgb.min(axis=2) > CHIARO
    senza_tinta = (rgb.max(axis=2) - rgb.min(axis=2)) < SENZA_TINTA

    fascia = np.zeros_like(alpha, dtype=bool)
    fascia[inizio:basso + 1, :] = True

    ombra = fascia & chiaro & senza_tinta & (alpha > 0)
    quanti = int(ombra.sum())
    if quanti == 0:
        return 0

    a[:, :, 3] = np.where(ombra, 0, alpha)
    Image.fromarray(a.astype(np.uint8), "RGBA").save(
        percorso, "WEBP", quality=86, method=4
    )
    return quanti


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""
    schema = os.path.join("public", "moto", filtro + "*", "*", "*.webp")

    toccate = 0
    pixel = 0
    for percorso in sorted(glob.glob(schema)):
        if os.path.splitext(os.path.basename(percorso))[0] not in VISTE:
            continue
        n = ripulisci(percorso)
        if n:
            toccate += 1
            pixel += n

    print("%d viste ripulite, %d pixel di ombra tolti." % (toccate, pixel))


if __name__ == "__main__":
    main()
