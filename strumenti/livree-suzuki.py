#!/usr/bin/env python3
"""
Rimette a ogni livrea Suzuki le viste del colore giusto.

IL DIFETTO
Suzuki pubblica due cose separate: la fotografia di colore, che porta
scritto il nome commerciale ("01 NERO MEMPHIS"), e il giro a 360 gradi,
indicizzato color1, color2, color3. L'importatore dava per scontato che i
due elenchi fossero nello stesso ordine. Non lo sono.

Il risultato si vede in pagina: apri la Hayabusa Nero Memphis e il profilo
destro e' nero - quello viene dalla fotografia di colore, ed e' giusto -
mentre le altre cinque viste sono una moto argento. Sotto lo stesso
pallino di colore convivono due moto diverse.

COME LO RISOLVE
Smette di fidarsi dell'ordine e guarda il colore. Di ogni colorN scarica
un fotogramma e ne ricava un'impronta; la stessa impronta la ricava dalla
fotografia di colore gia' sul disco, che e' quella con il nome giusto
sopra. Poi accoppia ogni livrea al colorN che le somiglia di piu' e
riscarica le cinque viste da li'.

PERCHE' UN ISTOGRAMMA E NON IL COLORE MEDIO
Il colore medio non distingue le tre Hayabusa: fra una bianca e blu, una
grigia e una nera le medie finiscono tutte sul grigio e si assomigliano
tutte. L'istogramma tiene invece conto di come i colori sono distribuiti,
e li' una carrozzeria bianca con le fasce blu non somiglia piu' a una
grigia uniforme.

QUANDO UNA LIVREA RESTA COM'E'
Se le viste che ha gia' sono del colore giusto. La maggior parte lo sono:
l'ordine sbagliato combaciava per caso su quasi tutti i modelli, e
riscaricare settanta livree per correggerne otto sarebbe stato tempo
buttato e trecento scaricamenti inutili addosso al sito di Suzuki.

Oppure se il giro a 360 gradi non ha nessun colore che le somigli
abbastanza: in quel caso non si tocca: meglio tenere le viste che ci sono, segnalandolo, che metterne
altre sbagliate con piu' convinzione. Capita quando Suzuki pubblica il
giro solo per alcuni colori.

COME SI USA
    python strumenti/livree-suzuki.py --prova      dice solo cosa farebbe
    python strumenti/livree-suzuki.py              riscarica dove serve
    python strumenti/livree-suzuki.py --solo hayabusa

Dopo aver riscaricato vanno rifatte le due passate di sempre:
    python strumenti/ripulisci-ombre.py suzuki-
    python strumenti/uniforma-foto.py suzuki-
"""

import argparse
import io
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

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


S = importa("importa-foto-suzuki")

FOTO = os.path.join("public", "moto")
# Il fotogramma su cui si confronta: e' quello piu' vicino al profilo della
# fotografia di colore, quindi le due immagini mostrano la stessa superficie
# di carrozzeria e l'istogramma e' confrontabile.
CONFRONTO = "18"
# Quanto devono somigliarsi per accettare l'abbinamento, da 0 a 1.
SOMIGLIANZA = 0.30
# Di quanto puo' discostarsi il colore medio delle viste gia' sul disco da
# quello del colore scelto prima di considerarle da rifare. Il colore medio
# qui va bene, e l'istogramma no, perche' il confronto e' fra pose diverse:
# la media non se ne accorge, la distribuzione si'.
GIA_GIUSTE = 16.0


def impronta(im):
    """Istogramma dei colori della carrozzeria, normalizzato."""
    im = im.convert("RGB").resize((128, 96), Image.LANCZOS)
    arr = np.array(im, dtype=float)
    luce = arr.mean(axis=2)
    # Via il fondo bianco e via le gomme: resta quello che la vernice copre.
    moto = (luce < 236) & (luce > 55)
    if moto.sum() < 80:
        moto = luce < 240
    pixel = (arr[moto] // 32).astype(int)
    conta = np.zeros((8, 8, 8))
    np.add.at(conta, (pixel[:, 0], pixel[:, 1], pixel[:, 2]), 1)
    return conta / max(conta.sum(), 1)


def somiglianza(a, b):
    """Intersezione dei due istogrammi: 1 identici, 0 niente in comune."""
    return float(np.minimum(a, b).sum())


def colore(im):
    """Il colore medio della carrozzeria, che non dipende dalla posa."""
    im = im.convert("RGB").resize((128, 96), Image.LANCZOS)
    arr = np.array(im, dtype=float)
    luce = arr.mean(axis=2)
    moto = (luce < 236) & (luce > 55)
    if moto.sum() < 80:
        moto = luce < 240
    return arr[moto].mean(axis=0)


def colore_file(percorso):
    im = Image.open(percorso).convert("RGBA")
    tela = Image.new("RGBA", im.size, (255, 255, 255, 255))
    tela.alpha_composite(im)
    return colore(tela)


def gia_giuste(cartella, livrea, atteso):
    """Vero se le viste gia' presenti sono del colore scelto."""
    base = os.path.join(FOTO, cartella, livrea)
    viste = [
        os.path.join(base, v + ".webp")
        for v in S.VISTE
        if v != "lato-destro" and os.path.exists(os.path.join(base, v + ".webp"))
    ]
    if not viste:
        return False
    misurato = np.mean([colore_file(v) for v in viste], axis=0)
    return float(np.abs(misurato - atteso).mean()) <= GIA_GIUSTE


def impronta_file(percorso):
    im = Image.open(percorso).convert("RGBA")
    tela = Image.new("RGBA", im.size, (255, 255, 255, 255))
    tela.alpha_composite(im)
    return impronta(tela)


def livree_del_modello(cartella):
    """Le livree che hanno la fotografia di colore, cioe' il riferimento."""
    base = os.path.join(FOTO, cartella)
    esito = []
    for nome in sorted(os.listdir(base)):
        profilo = os.path.join(base, nome, "lato-destro.webp")
        if os.path.isdir(os.path.join(base, nome)) and os.path.exists(profilo):
            esito.append((nome, profilo))
    return esito


def accoppia(livree, giri):
    """
    A ogni livrea il colorN che le somiglia di piu', uno per uno.

    Si procede dalla coppia piu' sicura: si prende la somiglianza piu' alta
    di tutte, si fissa quella, e si ricomincia sulle rimanenti. Cosi' una
    livrea facile da riconoscere non si fa portare via il suo colore da una
    dubbia che gli somiglia un po'.
    """
    coppie = []
    for nome, _ in livree:
        for n in giri:
            coppie.append((somiglianza(livree_imp[nome], giri[n]), nome, n))
    coppie.sort(reverse=True)

    presi_nome, presi_n, esito = set(), set(), {}
    for punteggio, nome, n in coppie:
        if nome in presi_nome or n in presi_n:
            continue
        if punteggio < SOMIGLIANZA:
            continue
        presi_nome.add(nome)
        presi_n.add(n)
        esito[nome] = (n, punteggio)
    return esito


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--prova", action="store_true", help="dice cosa farebbe, senza scrivere")
    p.add_argument("--solo", help="un modello solo, per nome di cartella")
    p.add_argument("--larghezza", type=int, default=1400)
    p.add_argument("--qualita", type=int, default=82)
    a = p.parse_args()

    cartelle = sorted(
        n for n in os.listdir(FOTO)
        if n.startswith("suzuki-") and os.path.isdir(os.path.join(FOTO, n))
    )
    if a.solo:
        cartelle = [n for n in cartelle if a.solo in n]

    global livree_imp
    cambiate = saltate = giuste = 0

    for cartella in cartelle:
        slug = cartella[len("suzuki-"):]
        livree = livree_del_modello(cartella)
        if len(livree) < 1:
            continue

        forma, quante = S.giro360(slug)
        if not quante:
            continue

        giri, tinte = {}, {}
        for n in range(1, quante + 1):
            try:
                dati = S.scarica(S.indirizzo360(forma, n, CONFRONTO), tentativi=1)
            except RuntimeError:
                continue
            im = Image.open(io.BytesIO(dati))
            giri[n] = impronta(im)
            tinte[n] = colore(im)
        if not giri:
            continue

        livree_imp = {nome: impronta_file(prof) for nome, prof in livree}
        scelte = accoppia(livree, giri)

        for nome, _ in livree:
            if nome not in scelte:
                print("  %-26s %-20s nessun colore somigliante: lasciata com'e'" % (cartella, nome))
                saltate += 1
                continue
            n, punteggio = scelte[nome]
            if gia_giuste(cartella, nome, tinte[n]):
                giuste += 1
                continue
            print(
                "  %-26s %-20s da rifare con color%d  (somiglianza %.2f)"
                % (cartella, nome, n, punteggio)
            )
            if a.prova:
                continue
            for vista, fotogramma in S.VISTE.items():
                # Il profilo destro non si tocca: e' la fotografia di colore,
                # ed e' l'unica di cui sappiamo con certezza il nome.
                if vista == "lato-destro":
                    continue
                try:
                    dati = S.scarica(S.indirizzo360(forma, n, fotogramma), tentativi=2)
                except RuntimeError:
                    continue
                fuori = os.path.join(FOTO, cartella, nome, vista + ".webp")
                S.salva(dati, fuori, a.larghezza, a.qualita, True)
            cambiate += 1

    print(
        "Da rifare: %d.  Gia' giuste: %d.  Senza un colore somigliante: %d."
        % (cambiate if not a.prova else 0, giuste, saltate)
    )


if __name__ == "__main__":
    main()
