#!/usr/bin/env python3
"""
Rifa' la fotografia di catalogo dei modelli Voge che ne hanno una brutta.

PERCHE' SERVE
L'importatore prende come fotografia di catalogo quella che la pagina
dichiara come anteprima (og:image). Per la maggior parte dei modelli e'
la scelta giusta, perche' la decide la redazione Voge. Per alcuni no:
l'anteprima e' il primo piano di un faro, uno scatto in studio con i
faretti in vista, o addirittura il ritaglio di una pagina del catalogo
stampato, con il fondo colorato e la moto tagliata a meta'. Nel nostro
elenco quelle schede si riconoscono subito: non si capisce che moto sia.

COSA FA
Per i modelli che gli indichi rilegge la pagina ufficiale, raccoglie
tutte le fotografie grandi che stanno solo li' (non quelle del menu
delle moto sorelle, che si ripetono ovunque), le scarica e le mette in
un provino numerato. Scegli tu il numero e lo strumento la installa.

Non sceglie da solo: le misure automatiche sanno dire se una fotografia
e' sgranata o se e' uno scatto in studio, non se la moto si riconosce.
Quella e' una cosa da occhio.

COME SI USA
    python strumenti/ambientate-voge.py --provino xwolf-300 valico-625dsx
    python strumenti/ambientate-voge.py --metti xwolf-300=3

Il provino finisce in strumenti/_scarico/provini/<slug>.png insieme alle
fotografie a piena misura, cosi' si puo' anche guardarle una per una.
"""

import argparse
import os
import re
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

def importa(nome):
    """
    Carica uno strumento vicino, che ha il trattino nel nome.

    I nostri file si chiamano importa-foto-voge.py, col trattino, perche'
    si lanciano da riga di comando e li' il trattino si legge meglio. Ma
    "import importa-foto-voge" in Python non si puo' scrivere: il trattino
    e' il meno. Da qui il giro con importlib, che carica un file per
    percorso invece che per nome.

    L'alternativa - tenerne una copia col trattino basso - era peggio: due
    file uguali che prima o poi divergono, e un giorno si corregge quello
    che nessuno usa.
    """
    import importlib.util
    percorso = os.path.join(os.path.dirname(os.path.abspath(__file__)), nome + ".py")
    specifica = importlib.util.spec_from_file_location(nome.replace("-", "_"), percorso)
    modulo = importlib.util.module_from_spec(specifica)
    specifica.loader.exec_module(modulo)
    return modulo


_voge = importa("importa-foto-voge")
SCARTI = _voge.SCARTI
elenco_modelli = _voge.elenco_modelli
scarica = _voge.scarica

PROVINI = os.path.join("strumenti", "_scarico", "provini")

# Memoria di quante pagine Voge mostrano ciascuna fotografia. Si riempie
# alla prima richiesta e serve a scartare le sorelle: vedi solo_sue.
_quante_pagine = {}
DESTINAZIONE = os.path.join("public", "moto")

# Sotto questa misura non e' una fotografia di scena: e' una miniatura.
LATO_MINIMO = 700


def scatti_di(html):
    """Le fotografie grandi della pagina, senza miniature ne' doppioni."""
    trovati = []
    for url in re.findall(r"https://vogeitaly\.it/wp-content/uploads/[^\"'\s)]+\.jpe?g", html, re.I):
        pulito = re.sub(r"-scaled(\.jpe?g)$", r"\1", url, flags=re.I)
        pulito = re.sub(r"-\d+x\d+(\.jpe?g)$", r"\1", pulito, flags=re.I)
        if re.search(SCARTI, pulito.rsplit("/", 1)[-1], re.I):
            continue
        if pulito not in trovati:
            trovati.append(pulito)
    return trovati


def solo_sue(indirizzi):
    """
    Tiene le fotografie che compaiono su una pagina sola.

    Ogni pagina Voge porta in fondo il menu delle moto sorelle con le loro
    fotografie: sulla pagina della SFIDA SR16 compaiono anche la SR16 200
    e la SR1, in tutte le livree. Prese cosi', la galleria di un modello
    finirebbe piena di un altro - ed e' un errore peggiore di una vista
    mancante, perche' non si vede che e' sbagliato.

    Il criterio e' quello dell'importatore: si leggono tutte le pagine, si
    conta su quante compare ciascuna fotografia, e si tengono solo quelle
    che stanno su una pagina sola. Le immagini del menu, per definizione,
    si ripetono; quella del modello sta solo a casa sua.
    """
    if not _quante_pagine:
        for url, _ in elenco_modelli():
            try:
                html = scarica(url).decode("utf-8", "replace")
            except RuntimeError:
                continue
            for immagine in scatti_di(html):
                _quante_pagine[immagine] = _quante_pagine.get(immagine, 0) + 1
    return [u for u in indirizzi if _quante_pagine.get(u, 0) == 1]


def pagina_di(slug):
    """
    L'indirizzo della pagina Voge, o None se quel nome non esiste.

    Torna None invece di fermare tutto: lanciato su venti modelli, un nome
    sbagliato faceva morire l'intera raccolta a meta' strada e i modelli
    dopo non venivano nemmeno provati. Meglio saltarlo e dirlo.
    """
    for url, s in elenco_modelli():
        if s == slug:
            return url
    return None


def raccogli(slug):
    """Scarica i candidati e torna l'elenco dei file su disco."""
    pagina = pagina_di(slug)
    if pagina is None:
        return None

    cartella = os.path.join(PROVINI, slug)
    os.makedirs(cartella, exist_ok=True)
    html = scarica(pagina).decode("utf-8", "replace")
    file = []
    for n, url in enumerate(solo_sue(scatti_di(html)), 1):
        percorso = os.path.join(cartella, "%02d.jpg" % n)
        if not os.path.exists(percorso):
            try:
                dati = scarica(url)
            except RuntimeError:
                continue
            with open(percorso, "wb") as f:
                f.write(dati)
        # Il file va chiuso prima di poterlo cancellare: su Windows
        # un'immagine ancora aperta non si tocca.
        try:
            with Image.open(percorso) as im:
                misura = im.size
        except Exception:
            misura = None
        if misura is None or min(misura) < LATO_MINIMO:
            os.remove(percorso)
            continue
        file.append(percorso)
    return file


def provino(slug):
    file = raccogli(slug)
    if file is None:
        print("  %-22s questo nome non e' fra le pagine Voge" % slug)
        return
    if not file:
        print("  %-22s nessun candidato" % slug)
        return

    colonne = min(4, len(file))
    righe = (len(file) + colonne - 1) // colonne
    larghezza, altezza = 340, 230
    foglio = Image.new("RGB", (colonne * larghezza, righe * (altezza + 24)), (16, 16, 20))
    penna = ImageDraw.Draw(foglio)
    for i, percorso in enumerate(file):
        im = Image.open(percorso).convert("RGB")
        im.thumbnail((larghezza - 8, altezza - 8), Image.LANCZOS)
        x = (i % colonne) * larghezza + (larghezza - im.width) // 2
        y = (i // colonne) * (altezza + 24) + 4
        foglio.paste(im, (x, y))
        penna.text(
            ((i % colonne) * larghezza + 6, (i // colonne) * (altezza + 24) + altezza + 6),
            "%d  %s" % (i + 1, os.path.basename(percorso)),
            fill=(255, 255, 255),
        )
    uscita = os.path.join(PROVINI, slug + ".png")
    foglio.save(uscita)
    print("  %-22s %d candidati  ->  %s" % (slug, len(file), uscita))


def metti(slug, numero):
    file = sorted(
        os.path.join(PROVINI, slug, n) for n in os.listdir(os.path.join(PROVINI, slug))
    )
    if not 1 <= numero <= len(file):
        raise SystemExit("Per %s i candidati sono da 1 a %d." % (slug, len(file)))

    im = Image.open(file[numero - 1]).convert("RGB")
    cartella = os.path.join(DESTINAZIONE, "voge-" + slug)
    if not os.path.isdir(cartella):
        raise SystemExit("Non trovo la cartella %s." % cartella)

    larghezza = 1600
    im = im.resize((larghezza, round(im.height * larghezza / im.width)), Image.LANCZOS)
    im.save(os.path.join(cartella, "in-strada.webp"), "WEBP", quality=86, method=6)
    print("  %-22s messa la numero %d" % (slug, numero))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--provino", nargs="+", metavar="SLUG", help="raccoglie i candidati")
    p.add_argument("--metti", nargs="+", metavar="SLUG=N", help="installa il candidato scelto")
    a = p.parse_args()

    if a.provino:
        for slug in a.provino:
            provino(slug)
    if a.metti:
        for voce in a.metti:
            slug, _, numero = voce.partition("=")
            metti(slug, int(numero))
    if not a.provino and not a.metti:
        p.print_help()


if __name__ == "__main__":
    main()
