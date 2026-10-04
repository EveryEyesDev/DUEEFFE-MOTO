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
Partiamo dalle righe piu' basse della moto, quelle che poggiano a terra,
e ci allarghiamo solo attraverso i pixel bianchi. Quello che si raggiunge
cosi' e' l'ombra; tutto il resto e' moto e non si tocca.

Il criterio "e' chiaro e sta in basso" non bastava: su uno scooter color
crema anche la carrozzeria e' chiara e sta in basso, e veniva bucata.

ATTENZIONE ALL'ORDINE
Va lanciato PRIMA di strumenti/uniforma-foto.py, mai dopo. Uniforma
centra la moto sulla tela misurandone la sagoma: se poi togliamo
l'ombra, la sagoma si accorcia e la moto resta scentrata, appesa in alto
con un vuoto sotto. E' successo, e in pagina la moto usciva dal riquadro.

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

# Quanta parte in basso della moto conta come 'a terra', da dove parte
# la ricerca dell'ombra.
SUOLO = 0.06
# Quanto dev'essere chiaro un pixel per essere ombra e non moto.
CHIARO = 196
# Quanto dev'essere senza tinta: l'ombra e' grigia, la moto no.
SENZA_TINTA = 16

VISTE = {"fronte", "retro", "lato-destro", "lato-sinistro", "angolo-destro", "angolo-sinistro"}


def ripulisci(percorso):
    """
    Toglie l'ombra di studio, riconoscendola dal fatto che poggia a terra.

    La regola sola "e' chiara e sta in basso" non basta: su uno scooter
    color crema anche la carrozzeria e' chiara e sta in basso, e verrebbe
    bucata. La differenza vera e' un'altra: l'ombra e' una macchia bianca
    attaccata al suolo, mentre la carrozzeria chiara non arriva mai fin
    la', perche' sotto ci sono ruote, motore e plastiche scure.

    Percio' partiamo dalle righe piu' basse della moto e ci allarghiamo
    solo attraverso il bianco: quello che raggiungiamo e' ombra, il resto
    e' moto e non lo tocchiamo.
    """
    im = Image.open(percorso)
    if im.mode != "RGBA":
        return 0
    a = np.array(im.convert("RGBA")).astype(int)
    alpha = a[:, :, 3]
    if not (alpha > 0).any():
        return 0

    righe = np.where((alpha > 0).any(axis=1))[0]
    alto, basso = righe[0], righe[-1]

    rgb = a[:, :, :3]
    bianco = (alpha > 0) & (rgb.min(axis=2) > CHIARO) &              ((rgb.max(axis=2) - rgb.min(axis=2)) < SENZA_TINTA)
    if not bianco.any():
        return 0

    # Da dove partiamo: il bianco nelle ultime righe della moto, cioe' a terra.
    inizio = max(alto, basso - max(2, int((basso - alto) * SUOLO)))
    partenze = np.zeros_like(bianco)
    partenze[inizio:basso + 1, :] = True
    semi = bianco & partenze
    if not semi.any():
        return 0

    # Ci allarghiamo nel bianco a partire da li', riga per riga.
    ombra = semi.copy()
    for _ in range(400):
        cresciuto = ombra.copy()
        cresciuto[1:, :] |= ombra[:-1, :]
        cresciuto[:-1, :] |= ombra[1:, :]
        cresciuto[:, 1:] |= ombra[:, :-1]
        cresciuto[:, :-1] |= ombra[:, 1:]
        cresciuto &= bianco
        if cresciuto.sum() == ombra.sum():
            break
        ombra = cresciuto

    quanti = int(ombra.sum())
    if quanti == 0:
        return 0

    a[:, :, 3] = np.where(ombra, 0, alpha)
    Image.fromarray(a.astype(np.uint8), "RGBA").save(percorso, "WEBP", quality=86, method=4)
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
