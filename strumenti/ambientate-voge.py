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


def pagina_di(slug):
    for url, s in elenco_modelli():
        if s == slug:
            return url
    raise SystemExit("Non trovo la pagina Voge per '%s'." % slug)


def raccogli(slug):
    """Scarica i candidati e torna l'elenco dei file su disco."""
    cartella = os.path.join(PROVINI, slug)
    os.makedirs(cartella, exist_ok=True)

    html = scarica(pagina_di(slug)).decode("utf-8", "replace")
    file = []
    for n, url in enumerate(scatti_di(html), 1):
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
