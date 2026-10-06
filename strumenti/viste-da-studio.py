#!/usr/bin/env python3
"""
Ricava le viste di scheda da fotografie di studio su fondo bianco.

PERCHE' SERVE
Alcuni modelli Voge hanno sul sito il giro completo - fronte, retro, i due
profili, le due tre quarti - ma pubblicato in JPEG su fondo bianco invece
che in PNG gia' scontornato. L'importatore raccoglie solo i PNG, quindi
quelle schede restano con una vista sola mentre alla fonte ce ne sono sei.

COME SCONTORNA
Il fondo di questi scatti e' bianco pieno e continua fino ai bordi: basta
partire dai quattro angoli e allagare verso l'interno finche' il colore
resta chiaro e senza tinta. Non si tocca niente che non sia collegato al
bordo, quindi il bianco dentro la moto - un faro acceso, un adesivo -
resta dov'e'.

L'ombra sotto la ruota sparisce con lo stesso criterio di
ripulisci-ombre.py: nel fondo dell'immagine tutto cio' che e' grigio senza
tinta e piu' chiaro di una gomma e' ombra di studio, non moto.

COME SI USA
    python strumenti/viste-da-studio.py voge-xwolf-300 \
        fronte=03 lato-destro=05 retro=07 angolo-destro=04 \
        angolo-sinistro=08 lato-sinistro=09

I numeri sono quelli del provino di ambientate-voge.py. Dopo aver scritto
le viste va rifatta la normalizzazione:
    python strumenti/uniforma-foto.py
"""

import os
import sys

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

PROVINI = os.path.join("strumenti", "_scarico", "provini")
DESTINAZIONE = os.path.join("public", "moto")

# Un pixel appartiene al fondo se e' chiaro e praticamente senza tinta.
CHIARO = 232
SENZA_TINTA = 18
# Nella fascia bassa, quello che e' grigio e piu' chiaro di una gomma e' ombra.
# La fascia si misura sulla moto, non sul fotogramma: in questi scatti la
# moto sta in mezzo e sotto c'e' tela vuota, quindi una fascia calcolata
# sull'immagine intera cadrebbe sotto l'ombra invece che sopra.
FASCIA_BASSA = 0.18
CHIARO_OMBRA = 150
TINTA_OMBRA = 16


def maschera_fondo(arr):
    """Vero dove il pixel e' fondo di studio, partendo dai bordi."""
    chiaro = arr.min(axis=2) >= CHIARO - 40
    senza_tinta = (arr.max(axis=2).astype(int) - arr.min(axis=2)) <= SENZA_TINTA
    candidato = chiaro & senza_tinta & (arr.mean(axis=2) >= CHIARO - 40)

    # Solo il fondo collegato al bordo e' fondo: il bianco chiuso dentro la
    # moto - un faro acceso, un adesivo - non si tocca.
    #
    # L'allagamento lo fa Pillow, che lavora in C. Scritto a mano con numpy
    # sarebbe una dilatazione ripetuta finche' non cresce piu': su uno
    # scatto da tremila pixel sono migliaia di passate sull'intera matrice,
    # e una vista sola ci metteva un minuto.
    #
    # La cornice di un pixel aggiunta attorno serve a partire da un punto
    # solo: unisce fra loro tutti i tratti di fondo che toccano il bordo,
    # anche quelli che fra loro non si toccherebbero.
    alto, largo = candidato.shape
    tela = Image.new("L", (largo + 2, alto + 2), 255)
    tela.paste(Image.fromarray(np.where(candidato, 255, 0).astype(np.uint8), "L"), (1, 1))
    ImageDraw.floodfill(tela, (0, 0), 128, thresh=0)
    return np.array(tela)[1:-1, 1:-1] == 128


def togli_ombra(arr, alfa, riquadro):
    """
    Toglie il grigio di studio rimasto sotto la moto.

    L'allagamento dai bordi non lo prende perche' l'ombra sotto il pianale
    e' chiusa fra le ruote: non tocca nessun bordo, quindi per
    l'allagamento e' "dentro" la moto. Qui invece si guarda il colore e
    basta, limitandosi alla fascia bassa della moto stessa, dove l'unica
    cosa chiara e senza tinta che puo' esserci e' l'ombra.
    """
    alto, basso = riquadro[1], riquadro[3]
    da = int(basso - (basso - alto) * FASCIA_BASSA)
    fascia = arr[da:]
    grigia = (fascia.max(axis=2).astype(int) - fascia.min(axis=2)) <= TINTA_OMBRA
    chiara = fascia.mean(axis=2) >= CHIARO_OMBRA
    alfa[da:][grigia & chiara] = 0
    return alfa


def scontorna(percorso):
    im = Image.open(percorso).convert("RGB")
    arr = np.array(im)
    alfa = np.where(maschera_fondo(arr), 0, 255).astype(np.uint8)

    riquadro = Image.fromarray(alfa, "L").getbbox()
    if riquadro is None:
        return Image.fromarray(np.dstack([arr, alfa]), "RGBA")
    alfa = togli_ombra(arr, alfa, riquadro)

    fuori = Image.fromarray(np.dstack([arr, alfa]), "RGBA")
    riquadro = fuori.split()[-1].getbbox()
    return fuori.crop(riquadro) if riquadro else fuori


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    modello = sys.argv[1]
    slug = modello[5:] if modello.startswith("voge-") else modello

    cartella = os.path.join(DESTINAZIONE, modello, "unica")
    os.makedirs(cartella, exist_ok=True)

    for voce in sys.argv[2:]:
        vista, _, numero = voce.partition("=")
        sorgente = os.path.join(PROVINI, slug, "%s.jpg" % numero)
        if not os.path.exists(sorgente):
            print("  manca %s" % sorgente)
            continue
        im = scontorna(sorgente)
        im.save(os.path.join(cartella, vista + ".webp"), "WEBP", quality=88, method=6)
        print("  %-18s %s  (%dx%d)" % (vista, modello, im.width, im.height))


if __name__ == "__main__":
    main()
