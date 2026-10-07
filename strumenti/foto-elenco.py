#!/usr/bin/env python3
"""
Fa la copia ridotta che il catalogo usa nei riquadri.

IL PROBLEMA
La fotografia su strada e' larga 1600 pixel perche' nel dettaglio si vede
grande. Nel catalogo pero' lo stesso file finisce dentro un riquadro di
quattrocento pixel scarsi, e il browser scarica dieci volte i dati che gli
servono per poi buttarli. Con cinquanta moto in pagina fanno otto megabyte
e mezzo: su una connessione di campagna, con il telefono, il catalogo ci
mette un'eternita' ad apparire.

LA COPIA
Accanto all'originale si scrive in-strada-elenco.webp, larga 800 pixel:
il doppio del riquadro, cosi' sugli schermi fitti - che sono quasi tutti i
telefoni - resta nitida. L'originale non si tocca e continua a servire al
dettaglio e alla vetrina.

Ottocento pixel e non mille o seicento: a ottocento il peso cala di circa
tre quarti e la fotografia regge ancora il raddoppio senza sgranare. E'
una scelta di compromesso, e a occhio non si vede differenza.

COME SI USA
    python strumenti/foto-elenco.py

VA RILANCIATO quando si cambia una fotografia su strada, altrimenti il
catalogo continua a mostrare la versione vecchia. Lo stesso vale per
sfondi-sfocati.py, che fa la miniatura della vetrina.
"""

import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

LARGHEZZA = 800
QUALITA = 78

fatti = 0
prima = dopo = 0
for origine in sorted(glob.glob(os.path.join("public", "moto", "*", "in-strada.webp"))):
    destinazione = origine.replace("in-strada.webp", "in-strada-elenco.webp")
    with Image.open(origine) as im:
        im = im.convert("RGB")
        if im.width <= LARGHEZZA:
            # Gia' piccola: si copia com'e', cosi' il catalogo trova
            # sempre il file che si aspetta.
            altezza = im.height
            ridotta = im.copy()
        else:
            altezza = max(1, round(im.height * LARGHEZZA / im.width))
            ridotta = im.resize((LARGHEZZA, altezza), Image.LANCZOS)
    ridotta.save(destinazione, "WEBP", quality=QUALITA, method=6)

    prima += os.path.getsize(origine)
    dopo += os.path.getsize(destinazione)
    fatti += 1

print("%d copie per l'elenco." % fatti)
print(
    "Gli originali pesano %.1f MB, le copie %.1f MB: %.0f%% in meno."
    % (prima / 1048576, dopo / 1048576, (1 - dopo / prima) * 100 if prima else 0)
)
