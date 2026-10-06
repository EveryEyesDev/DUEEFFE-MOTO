#!/usr/bin/env python3
"""
Controlla che le viste di una scheda siano davvero sei viste diverse.

DUE ERRORI CHE SI VEDONO SUBITO IN PAGINA
Il primo e' il doppione: il sito dei costruttori pubblica lo stesso scatto
a due indirizzi, e la scheda finisce per mostrare due volte la stessa
fotografia sotto due nomi diversi. Chi sfoglia le viste se ne accorge al
primo clic.

Il secondo e' il profilo sinistro che mostra il fianco destro, cioe' lo
stesso scatto catalogato due volte sotto due nomi.

COME LI TROVA
Il doppione, confrontando le immagini ridotte in scala di grigio: se la
differenza media e' quasi nulla sono lo stesso scatto.

Il lato, fra i due profili: una vista che mostra il fianco destro somiglia
al profilo destro piu' di quanto somigli al suo specchio, e viceversa.

NON CONTROLLA LA LIVREA
Quello lo fa strumenti/livree-incoerenti.py, con una misura pensata
apposta. Qui c'era stato un tentativo, e dava fastidio piu' che altro:
confrontava ogni vista col profilo destro e segnalava sempre il fronte e
il retro, che sono piccoli, scuri e di carrozzeria ne mostrano poca. Due
strumenti che si contraddicono sullo stesso difetto sono peggio di uno
solo, quindi questo si occupa delle fotografie e quello dei colori.

PERCHE' NON CONTROLLA IL LATO DELLE TRE QUARTI
Si era provato. Non funziona: fra una tre quarti e un profilo la
differenza la fa la posa, non il fianco, e le due misure finiscono a un
paio di punti l'una dall'altra. Verificato a mano su una Hayabusa, lo
strumento sbagliava e avrebbe fatto rovesciare venticinque livree che
stavano bene. Il confronto regge solo fra due profili, ed e' li' che e'
rimasto.

COME SI USA
    python strumenti/controlla-viste.py voge-xwolf-300
    python strumenti/controlla-viste.py --tutte
"""

import glob
import itertools
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

FOTO = os.path.join("public", "moto")

# Sotto questa differenza media sono la stessa fotografia.
STESSA = 8.0
# Fra i due profili il verdetto vale solo con un distacco netto: sotto
# questa soglia si tace, che e' meglio di un falso allarme.
MARGINE = 10.0


def ridotta(percorso, specchio=False):
    im = Image.open(percorso).convert("RGBA")
    tela = Image.new("RGBA", im.size, (255, 255, 255, 255))
    tela.alpha_composite(im)
    grigia = tela.convert("L").resize((128, 96), Image.LANCZOS)
    if specchio:
        grigia = grigia.transpose(Image.FLIP_LEFT_RIGHT)
    return np.array(grigia, dtype=float)


def differenza(a, b):
    return float(np.abs(a - b).mean())


def controlla(cartella):
    file = sorted(glob.glob(os.path.join(cartella, "*.webp")))
    if len(file) < 2:
        return []
    nomi = {os.path.basename(f)[:-5]: f for f in file}
    dritte = {n: ridotta(f) for n, f in nomi.items()}

    avvisi = []
    for a, b in itertools.combinations(sorted(dritte), 2):
        if differenza(dritte[a], dritte[b]) < STESSA:
            avvisi.append("%s e %s sono la stessa fotografia" % (a, b))

    # Il lato, solo fra i due profili: li' il confronto e' fra pose uguali.
    if "lato-destro" in nomi and "lato-sinistro" in nomi:
        dritto = differenza(dritte["lato-sinistro"], dritte["lato-destro"])
        storto = differenza(
            dritte["lato-sinistro"], ridotta(nomi["lato-destro"], specchio=True)
        )
        if storto - dritto > MARGINE:
            avvisi.append(
                "lato-sinistro mostra lo stesso fianco di lato-destro "
                "(%.1f contro %.1f)" % (dritto, storto)
            )

    return avvisi


def main():
    if sys.argv[1:] == ["--tutte"]:
        cartelle = sorted(glob.glob(os.path.join(FOTO, "*", "*")))
    elif sys.argv[1:]:
        cartelle = []
        for m in sys.argv[1:]:
            cartelle += sorted(glob.glob(os.path.join(FOTO, m, "*")))
    else:
        sys.exit(__doc__)

    guai = 0
    for cartella in cartelle:
        if not os.path.isdir(cartella):
            continue
        avvisi = controlla(cartella)
        if avvisi:
            guai += len(avvisi)
            etichetta = os.path.relpath(cartella, FOTO).replace(os.sep, "/")
            for a in avvisi:
                print("  %-34s %s" % (etichetta, a))
    print("Segnalazioni: %d" % guai)


if __name__ == "__main__":
    main()
