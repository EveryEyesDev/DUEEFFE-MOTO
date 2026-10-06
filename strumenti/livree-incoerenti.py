#!/usr/bin/env python3
"""
Toglie dalle schede le viste che mostrano una moto di un altro colore.

IL CASO
Per qualche modello Suzuki pubblica le fotografie di colore di un model
year e il giro a 360 gradi di un altro. Sulla Hayabusa le foto colore sono
bianco-blu, grigio-arancio e nero-rosso; il giro e' nero-oro, verde salvia
e argento-blu. Non sono gli stessi colori in ordine diverso: sono sei
colori diversi, e non c'e' nessun abbinamento da trovare.

Il risultato in pagina e' la cosa peggiore delle due: sotto "Blu Rodi" si
vede un profilo bianco e blu e poi cinque viste di una moto nera e oro.

LA SCELTA
Si tiene la fotografia di colore e si buttano le altre cinque viste. La
fotografia di colore e' l'unica che porta scritto sopra il nome
commerciale, ed e' quello che il cliente legge e che ci ha chiesto di
mostrare. Una vista sola col colore giusto vale piu' di sei viste di cui
cinque sono un'altra moto.

COME DECIDE: LA MISURA PROPONE, L'OCCHIO DISPONE
Di ogni vista si misura un descrittore del colore della carrozzeria -
luminosita' e saturazione mediane, piu' la tinta media pesata sulla
saturazione - e lo si confronta con quello del profilo destro. Sono misure
che cambiano poco con la posa, quindi una differenza grande vuol dire
vernice diversa, non inquadratura diversa. Si prende la mediana sulle
viste e non il massimo, perche' la vista di retro e' sempre la piu'
ballerina - e' piccola, scura e di carrozzeria ne mostra poca - e da sola
darebbe falsi allarmi su moto che stanno benissimo.

La misura pero' non basta a decidere da sola, e si e' visto provando:
la Hayabusa Grigio Pittsburgh e' sbagliata e sta a 25, la Address 125
Bianco Ostuni e' giusta e sta a 41. Fra crema e bianco il numero e' grande
e la moto e' la stessa; fra grigio-arancio e verde salvia il numero e'
piccolo e le moto sono due. Nessuna soglia separa quei due casi, e
sceglierne una vorrebbe dire buttare viste buone o tenerne di sbagliate.

Quindi la misura serve a trovare i candidati, e la lista qui sotto e'
quella che e' stata guardata a schermo, livrea per livrea, affiancando il
profilo destro alle altre viste. Chi aggiunge modelli rifa' la stessa
cosa: lancia lo strumento senza --applica, guarda il provino dei casi che
segnala, e aggiunge alla lista solo quelli che sono davvero un'altra moto.

COME SI USA
    python strumenti/livree-incoerenti.py             elenca i candidati da guardare
    python strumenti/livree-incoerenti.py --applica   toglie le viste della lista

Dopo aver tolto le viste va riallineato il catalogo:
    python strumenti/allinea-viste.py --tutte
"""

import argparse
import colorsys
import glob
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

FOTO = os.path.join("public", "moto")

# Oltre questo scarto una livrea va guardata. Non e' un verdetto: e' la
# soglia sotto la quale non vale la pena nemmeno aprire il provino.
DA_GUARDARE = 20.0

# Le livree guardate a schermo e risultate di un'altra moto. Per queste si
# tiene solo il profilo destro, che e' la fotografia di colore ufficiale.
#
# Le tre Hayabusa ci sono tutte: li' Suzuki pubblica le foto colore di un
# model year (bianco-blu, grigio-arancio, nero-rosso) e il giro a 360 gradi
# di un altro (nero-oro, verde salvia, argento-blu). Sei colori diversi,
# niente da abbinare.
#
# Le altre sono singole: dentro la GSX-8R la Blu Miami e' giusta e le altre
# due no, quindi il difetto non e' sempre di tutto il modello.
DA_TOGLIERE = {
    "suzuki-address-125/blu-tokyo",
    "suzuki-gsx-8r/bianco-oslo",
    "suzuki-gsx-8r/nero-parigi",
    "suzuki-gsx-8s/rosso-pechino",
    "suzuki-gsx-s1000-evo/rosso-madrid",
    "suzuki-burgman-street-125-executive/livrea-1",
    "suzuki-gsx-s1000gt/blu-montreal",   # blu notte contro azzurro brillante
    "suzuki-gsx-s1000gt/grigio-seattle",
    "suzuki-gsx-s1000gt/nero-dubai",
    "suzuki-gsx-s1000gx/grigio-berlino",
    "suzuki-gsx-s1000gx/nero-dubai",
    "suzuki-hayabusa/blu-rodi",
    "suzuki-hayabusa/grigio-pittsburgh",
    "suzuki-hayabusa/nero-memphis",
}

# Guardate e risultate giuste: il numero alto non vuol dire niente.
# Restano scritte per non rifare due volte la stessa verifica.
GIA_GUARDATE_E_BUONE = {
    "suzuki-address-125/bianco-ostuni",   # crema contro bianco, stessa moto
    "suzuki-gsx-8r/blu-miami",
    "suzuki-gsx-s1000-evo/blu-miami",
    "suzuki-gsx-s1000-evo/nero-dubai",
    "voge-sfida-sr450x/unica",            # vernice cangiante, vira col taglio di luce
    "voge-xwolf-300/unica",
    "alltrhike-450/verde-jungle",
    "calibro-custom/nero",
    "suzuki-gsx-8s/nero-nairobi",
    "suzuki-v-strom-1050se/livrea-5",
}


def descrittore(percorso):
    """Luminosita', saturazione e tinta della carrozzeria. Poco sensibile alla posa."""
    im = Image.open(percorso).convert("RGBA").resize((128, 96), Image.LANCZOS)
    arr = np.array(im, dtype=float)
    rgb = arr[..., :3]
    # Via il trasparente e via le gomme: resta quello che la vernice copre.
    corpo = (arr[..., 3] > 200) & (rgb.mean(axis=2) > 60)
    if corpo.sum() < 80:
        corpo = arr[..., 3] > 200
    p = rgb[corpo]

    massimo, minimo = p.max(axis=1), p.min(axis=1)
    saturazione = np.where(massimo > 0, (massimo - minimo) / np.maximum(massimo, 1), 0)

    # La tinta come vettore e non come angolo: il rosso sta a 0 e a 360
    # insieme, e una media fatta sui gradi lo manderebbe sul verde.
    forti = saturazione > 0.20
    if forti.sum() > 20:
        gradi = np.array(
            [colorsys.rgb_to_hsv(*(q / 255))[0] for q in p[forti][::3]]
        ) * 2 * np.pi
        tinta = (np.cos(gradi).mean() * 120, np.sin(gradi).mean() * 120)
    else:
        tinta = (0.0, 0.0)

    return np.array(
        [np.median(p.mean(axis=1)), np.median(saturazione) * 255, tinta[0], tinta[1]]
    )


def scarto_livrea(cartella):
    """Quanto le altre viste si allontanano dal profilo destro."""
    profilo = os.path.join(cartella, "lato-destro.webp")
    if not os.path.exists(profilo):
        return None
    riferimento = descrittore(profilo)
    scarti = [
        float(np.abs(descrittore(f) - riferimento).mean())
        for f in sorted(glob.glob(os.path.join(cartella, "*.webp")))
        if not f.endswith("lato-destro.webp")
    ]
    return float(np.median(scarti)) if scarti else None


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--applica", action="store_true", help="toglie davvero le viste")
    a = p.parse_args()

    tolte = nuove = 0
    for modello in sorted(os.listdir(FOTO)):
        base = os.path.join(FOTO, modello)
        if not os.path.isdir(base):
            continue
        for nome in sorted(os.listdir(base)):
            cartella = os.path.join(base, nome)
            if not os.path.isdir(cartella):
                continue
            etichetta = "%s/%s" % (modello, nome)

            if etichetta in DA_TOGLIERE:
                altre = [
                    f for f in sorted(glob.glob(os.path.join(cartella, "*.webp")))
                    if not f.endswith("lato-destro.webp")
                ]
                if not altre:
                    continue
                print("  %-44s tolgo %d viste, resta la foto colore" % (etichetta, len(altre)))
                for f in altre:
                    if a.applica:
                        os.remove(f)
                tolte += len(altre)
                continue

            if etichetta in GIA_GUARDATE_E_BUONE:
                continue

            scarto = scarto_livrea(cartella)
            if scarto is not None and scarto >= DA_GUARDARE:
                print("  %-44s da guardare (scarto %.0f)" % (etichetta, scarto))
                nuove += 1

    print(
        "Viste %s: %d.  Livree nuove da guardare: %d."
        % ("tolte" if a.applica else "da togliere", tolte, nuove)
    )


if __name__ == "__main__":
    main()
