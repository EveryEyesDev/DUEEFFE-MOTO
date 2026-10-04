#!/usr/bin/env python3
"""
Controlla che le fotografie del catalogo siano davvero ambientate.

A COSA SERVE
Nel catalogo ogni moto si presenta con uno scatto in scena: la moto su una
strada, in citta', fra le montagne. E' quella che fa venire voglia di
cliccare. Ma i siti dei costruttori, in mezzo alle fotografie buone,
pubblicano anche fondi bianchi da studio e dettagli ravvicinati, e
l'importatore non puo' distinguerli dal nome del file.

Questo strumento le guarda una per una e segnala quelle che non vanno, con
il motivo. Non cancella e non modifica niente: dice solo quali vanno
sostituite.

COME SI USA
    python strumenti/controlla-ambientate.py

COSA CONSIDERA SBAGLIATO
  - fondo da studio: troppa superficie quasi bianca o quasi nera uniforme,
    il segno di uno scatto scontornato su fondo pieno;
  - scatto piatto: pochissima varieta' di colore, tipico dei dettagli
    ravvicinati e delle immagini di sfondo;
  - inquadratura stretta: piu' alta che larga, o quasi quadrata, che nel
    riquadro del catalogo si vede male.
"""

import glob
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

# Oltre questa quota di pixel quasi bianchi e' un fondo da studio.
QUOTA_BIANCO = 0.30
# Sotto questa varieta' di colori lo scatto e' piatto: un dettaglio, non una scena.
VARIETA_MINIMA = 0.055
# Sotto questa proporzione l'inquadratura e' troppo stretta per il catalogo.
PROPORZIONE_MINIMA = 1.25


def esamina(percorso):
    """Torna la lista dei motivi per cui la fotografia non va bene."""
    im = Image.open(percorso).convert("RGB")
    proporzione = im.width / im.height
    piccola = im.resize((160, max(1, round(160 / proporzione))), Image.BILINEAR)
    a = np.array(piccola).astype(int)

    motivi = []

    bianco = (a.min(axis=2) > 225).mean()
    if bianco > QUOTA_BIANCO:
        motivi.append("fondo da studio (%.0f%% quasi bianco)" % (bianco * 100))

    # Varieta': quante tinte diverse compaiono, su quante potrebbero essercene.
    grossolano = a // 32
    chiavi = grossolano[:, :, 0] * 64 + grossolano[:, :, 1] * 8 + grossolano[:, :, 2]
    varieta = len(np.unique(chiavi)) / 512
    if varieta < VARIETA_MINIMA:
        motivi.append("scatto piatto (varieta' %.3f)" % varieta)

    if proporzione < PROPORZIONE_MINIMA:
        motivi.append("inquadratura stretta (%.2f:1)" % proporzione)

    return motivi


def main():
    percorsi = sorted(glob.glob(os.path.join("public", "moto", "*", "in-strada.webp")))
    print("Fotografie di catalogo esaminate: %d\n" % len(percorsi))

    bocciate = []
    for percorso in percorsi:
        modello = os.path.basename(os.path.dirname(percorso))
        motivi = esamina(percorso)
        if motivi:
            bocciate.append((modello, motivi))
            print("  %-34s %s" % (modello, "; ".join(motivi)))

    if not bocciate:
        print("  Vanno bene tutte.")
    else:
        print("\n%d da sostituire su %d." % (len(bocciate), len(percorsi)))
        print("Per queste serve scegliere un altro scatto dalla pagina del costruttore.")


if __name__ == "__main__":
    main()
