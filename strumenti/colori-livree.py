#!/usr/bin/env python3
"""
Ricava il colore di ogni livrea dalla fotografia e sistema il catalogo.

IL PROBLEMA
Due cose stonavano nelle schede. Primo: per i modelli di cui Suzuki non
pubblica i nomi dei colori in forma leggibile, le livree si chiamavano
"Livrea 1", "Livrea 2". Secondo: il pallino colorato accanto al nome era
sempre dello stesso grigio, perche' nessuno ci aveva messo il colore vero.

LA SOLUZIONE
Il colore ce l'abbiamo gia': e' nella fotografia. Qui lo misuriamo e lo
scriviamo nel catalogo, cosi' il pallino diventa quello giusto, e dove
manca il nome commerciale mettiamo almeno il colore in italiano ("Nero",
"Blu", "Rosso") invece di un numero.

COME SI MISURA
Guardiamo i pixel della moto (quelli non trasparenti) e togliamo il buio
sotto una certa soglia: gomme, motore e ombre. Di quel che resta cerchiamo
il colore che occupa piu' superficie, raggruppando le tinte simili.

Il punto delicato e' questo: la prima versione cercava il colore piu'
acceso, e sbagliava sistematicamente. Su una moto bianca con le grafiche
rosse il rosso e' acceso e il bianco no, quindi la dava per rossa. La
carrozzeria non e' il colore piu' vivo: e' quello che copre piu'
superficie. Contando l'area, una moto bianca risulta bianca anche se ha
gli adesivi rossi.

NON INVENTIAMO I NOMI COMMERCIALI
"Blu" non e' "Metallic Triton Blue". Dove Suzuki pubblica il nome vero,
quello resta e non lo tocchiamo: qui riempiamo solo i buchi, e il nome
commerciale va chiesto al cliente quando lo avra'.

COME SI USA
    python strumenti/colori-livree.py            scrive nel catalogo
    python strumenti/colori-livree.py --prova    mostra soltanto cosa farebbe
"""

import argparse
import glob
import io
import os
import re
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

CATALOGO = os.path.join("src", "data", "motorcycles.ts")

# I nomi dei colori, in italiano e in inglese, come li scrivono i
# costruttori. E' la via piu' affidabile: "BLU MIAMI" e' blu, punto. Provare
# a dedurlo dalla fotografia non funziona, perche' queste moto sono per
# meta' meccanica grigia e le grafiche accese ingannano la misura.
VOCABOLARIO = [
    (("nero", "black", "ebony", "viper", "midnight"), "Nero", "#141418"),
    (("bianco", "white", "artic", "arctic", "carrara", "pearl"), "Bianco", "#eef0f2"),
    (("argento", "silver", "metallic silver"), "Argento", "#b7bcc2"),
    (("grigio", "grey", "gray", "anthracite", "antracite", "smoky", "titanium"), "Grigio", "#4a4e55"),
    (("rosso", "red", "passion", "energy"), "Rosso", "#c01727"),
    (("azzurro", "celeste", "cyan", "light blue"), "Azzurro", "#2f7fd1"),
    (("blu", "blue"), "Blu", "#1d3f8f"),
    (("verde", "green", "jungle"), "Verde", "#2f6b3a"),
    (("giallo", "yellow"), "Giallo", "#e3c222"),
    (("arancione", "arancio", "orange"), "Arancione", "#e07a1f"),
    (("oro", "gold", "champagne"), "Oro", "#c9a227"),
    (("bronzo", "bronze", "rame", "copper"), "Bronzo", "#8c6239"),
    (("marrone", "brown", "sabbia", "sand", "beige", "desert"), "Sabbia", "#9b8363"),
    (("viola", "purple", "violet"), "Viola", "#5b3a8c"),
    (("rosa", "pink"), "Rosa", "#d46a8c"),
]


def dal_nome(nome):
    """
    Il colore ricavato dal nome commerciale, se il nome lo dice.

    Torna il codice esadecimale, oppure None se nel nome non c'e' nessuna
    parola di colore riconoscibile.
    """
    piatto = " " + re.sub(r"[^a-z]+", " ", nome.lower()) + " "
    for parole, _, codice in VOCABOLARIO:
        for parola in parole:
            if " %s " % parola in piatto or piatto.strip().startswith(parola):
                return codice
    return None


# Sotto questa luminosita' e' ombra, gomma o motore: non e' carrozzeria.
BUIO = 55
# Sotto questa vivacita' e' metallo o plastica scura, non una tinta.
SPENTO = 42

# Le tinte, in gradi sulla ruota dei colori.
TINTE = [
    (0, 14, "Rosso"),
    (14, 38, "Arancione"),
    (38, 68, "Giallo"),
    (68, 160, "Verde"),
    (160, 200, "Azzurro"),
    (200, 255, "Blu"),
    (255, 290, "Viola"),
    (290, 335, "Magenta"),
    (335, 361, "Rosso"),
]


def nome_tinta(gradi):
    for inizio, fine, nome in TINTE:
        if inizio <= gradi < fine:
            return nome
    return "Rosso"


def colore_di(percorso):
    """
    Torna (nome in italiano, codice esadecimale) della livrea.

    Due stadi, perche' un solo criterio sbaglia sempre da una parte.

    Primo: cerchiamo una tinta vera (rosso, blu, verde...) e guardiamo
    quanta superficie copre. Se supera una fetta significativa della moto,
    quella e' la livrea. La soglia serve a non farsi ingannare dagli
    adesivi e dalle pinze dei freni, che sono accesi ma piccoli.

    Secondo: se di tinta non ce n'e' abbastanza, la moto e' bianca, grigia
    o nera, e allora decide la luminosita' media della carrozzeria.
    """
    im = Image.open(percorso).convert("RGBA")
    if max(im.size) > 500:
        im = im.resize((500, round(im.height * 500 / im.width)), Image.BILINEAR)

    a = np.array(im).astype(int)
    visibile = a[:, :, 3] > 128
    if not visibile.any():
        return ("Nero", "#141418")

    rgb = a[:, :, :3][visibile]
    corpo = rgb[rgb.max(axis=1) > BUIO]   # via gomme, motore e ombre
    if len(corpo) < 40:
        return ("Nero", "#141418")

    massimo = corpo.max(axis=1)
    minimo = corpo.min(axis=1)
    vivaci = (massimo - minimo) > SPENTO
    quota = vivaci.sum() / len(corpo)

    if quota >= 0.10:
        tinte = corpo[vivaci]
        grossolano = tinte // 32
        chiavi = grossolano[:, 0] * 64 + grossolano[:, 1] * 8 + grossolano[:, 2]
        gruppo = int(np.bincount(chiavi).argmax())
        media = tinte[chiavi == gruppo].mean(axis=0)
        r, g, b = media
        vivacita = max(float(max(media) - min(media)), 1.0)
        if max(media) == r:
            gradi = (60 * ((g - b) / vivacita)) % 360
        elif max(media) == g:
            gradi = 60 * ((b - r) / vivacita) + 120
        else:
            gradi = 60 * ((r - g) / vivacita) + 240
        codice = "#%02x%02x%02x" % tuple(int(round(c)) for c in media)
        return (nome_tinta(gradi), codice)

    # Nessuna tinta: comanda la luminosita'.
    media = corpo.mean(axis=0)
    codice = "#%02x%02x%02x" % tuple(int(round(c)) for c in media)
    luce = float(media.mean())
    if luce > 170:
        return ("Bianco", codice)
    if luce > 120:
        return ("Argento", codice)
    if luce > 75:
        return ("Grigio", codice)
    return ("Nero", codice)


def main():
    p = argparse.ArgumentParser(description="Colori delle livree dal vero.")
    p.add_argument("--prova", action="store_true", help="mostra senza scrivere")
    a = p.parse_args()

    s = io.open(CATALOGO, encoding="utf-8").read()

    # Ogni livrea nel catalogo: slug, nome, codice colore, e la prima vista.
    schema = re.compile(
        r"(\{\s*\n\s*slug: '(?P<slug>[^']+)',\s*\n"
        r"\s*name: '(?P<nome>[^']*)',\s*\n"
        r"\s*hex: ')(?P<hex>[^']*)('[\s\S]*?src: '(?P<src>[^']+)')"
    )

    cambi = []

    def sostituisci(m):
        vecchio_nome = m.group("nome")
        segnaposto = bool(re.fullmatch(r"Livrea \d+", vecchio_nome))

        # Prima strada, quella buona: il colore sta scritto nel nome.
        codice = None if segnaposto else dal_nome(vecchio_nome)
        nome_colore = vecchio_nome

        # Seconda strada, solo se il nome non c'e' o non dice il colore:
        # lo misuriamo dalla fotografia. E' un'approssimazione, va
        # ricontrollata col listino del costruttore.
        if codice is None:
            percorso = os.path.join("public", m.group("src").lstrip("/").replace("/", os.sep))
            if not os.path.isfile(percorso):
                return m.group(0)
            misurato, codice = colore_di(percorso)
            if segnaposto:
                nome_colore = misurato

        testo = m.group(0)
        if nome_colore != vecchio_nome:
            testo = testo.replace("name: '%s'," % vecchio_nome, "name: '%s'," % nome_colore, 1)
        testo = testo.replace("hex: '%s'," % m.group("hex"), "hex: '%s'," % codice, 1)
        cambi.append((m.group("slug"), vecchio_nome, nome_colore, codice, segnaposto))
        return testo

    nuovo = schema.sub(sostituisci, s)

    for slug, prima, dopo, codice, misurato in cambi:
        segno = "  DA CONFERMARE" if misurato else ""
        print("  %-28s %-26s %s%s" % (slug[:28], dopo[:26], codice, segno))

    if a.prova:
        print("\n%d livree esaminate. Prova soltanto: non ho scritto niente." % len(cambi))
        return

    io.open(CATALOGO, "w", encoding="utf-8").write(nuovo)
    rinominate = sum(1 for c in cambi if c[4])
    print("\n%d livree aggiornate col colore vero, %d rinominate." % (len(cambi), rinominate))


if __name__ == "__main__":
    main()
