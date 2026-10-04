#!/usr/bin/env python3
"""
Trova il colore vero di ogni livrea e lo scrive nel catalogo.

IL PROBLEMA
Accanto al nome di ogni livrea, nella scheda della moto, c'e' un pallino
colorato. Se quel pallino non corrisponde alla moto che si vede, il
dettaglio sembra sbagliato anche quando tutto il resto e' giusto.

PERCHE' I TENTATIVI PRECEDENTI NON FUNZIONAVANO
Il primo prendeva il colore piu' acceso dell'immagine: su una moto bianca
con le grafiche rosse vinceva il rosso, e la dava per rossa. Il secondo
prendeva il colore piu' diffuso: vinceva il grigio del motore, perche' di
meccanica se ne vede tanta. Il terzo lo deduceva dal nome ("BLU MIAMI" e'
blu), che azzecca la tinta ma non la sfumatura: Blu Miami, Blu Zante e Blu
Atene finivano tutti sullo stesso identico blu.

COME LO TROVIAMO ADESSO
Confrontando le livree fra loro. Le fotografie di uno stesso modello sono
lo stesso scatto: identica inquadratura, identica luce. Fra una livrea e
l'altra cambia una cosa sola, la vernice. Quindi i punti in cui le
immagini *differiscono* sono esattamente la carrozzeria, e nient'altro:
motore, gomme, dischi e forcelle sono identici in tutte e si annullano da
soli. Il colore della livrea e' il colore medio di quei punti.

QUANDO NON SI PUO'
Se il modello ha una livrea sola non c'e' niente con cui confrontarla, e
restiamo sul nome commerciale con una tavolozza di riferimento. Lo
strumento dice quante sono.

COME SI USA
    python strumenti/colori-livree.py             scrive nel catalogo
    python strumenti/colori-livree.py --prova     non scrive niente
    python strumenti/colori-livree.py --provino   salva un'immagine di controllo
"""

import argparse
import io
import os
import re
import sys

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

CATALOGO = os.path.join("src", "data", "motorcycles.ts")

# Quanto devono differire due livree in un punto perche' sia vernice e non
# rumore di compressione.
DIFFERENZA = 26
# Sotto questa luminosita' siamo nelle ombre: non e' vernice che si vede.
BUIO = 45

# Tavolozza di riferimento: serve solo quando la livrea e' unica e il
# colore si puo' soltanto dedurre dal nome.
VOCABOLARIO = [
    (("nero", "black", "ebony", "viper", "midnight", "basalt"), "#141418"),
    (("bianco", "white", "artic", "arctic", "carrara", "pearl", "glacier"), "#eef0f2"),
    (("argento", "silver"), "#b7bcc2"),
    (("grigio", "grey", "gray", "anthracite", "antracite", "smoky", "titanium"), "#4a4e55"),
    (("rosso", "red", "passion", "energy"), "#c01727"),
    (("azzurro", "celeste", "cyan"), "#2f7fd1"),
    (("blu", "blue"), "#1d3f8f"),
    (("verde", "green", "jungle", "lime"), "#2f6b3a"),
    (("giallo", "yellow"), "#e3c222"),
    (("arancione", "arancio", "orange"), "#e07a1f"),
    (("oro", "gold", "champagne"), "#c9a227"),
    (("bronzo", "bronze", "rame", "copper"), "#8c6239"),
    (("marrone", "brown", "sabbia", "sand", "beige", "desert"), "#9b8363"),
    (("viola", "purple", "violet"), "#5b3a8c"),
    (("rosa", "pink"), "#d46a8c"),
]


def dal_nome(nome):
    piatto = " " + re.sub(r"[^a-z]+", " ", nome.lower()) + " "
    for parole, codice in VOCABOLARIO:
        for parola in parole:
            if " %s " % parola in piatto:
                return codice
    return None


def famiglia(codice):
    """
    A quale famiglia appartiene un colore: nero, bianco, grigio o una tinta.

    Serve per confrontare quello che abbiamo misurato con quello che dice
    il nome commerciale. Le tinte sono distinte per posizione sulla ruota
    dei colori.
    """
    r, g, b = (int(codice[i:i + 2], 16) for i in (1, 3, 5))
    massimo, minimo = max(r, g, b), min(r, g, b)
    vivacita = massimo - minimo
    if vivacita <= 34:
        luce = (r + g + b) / 3
        if luce > 170:
            return "bianco"
        if luce > 95:
            return "grigio"
        return "nero"
    if massimo == r:
        gradi = (60 * ((g - b) / vivacita)) % 360
    elif massimo == g:
        gradi = 60 * ((b - r) / vivacita) + 120
    else:
        gradi = 60 * ((r - g) / vivacita) + 240
    for inizio, fine, nome in [
        (0, 16, "rosso"), (16, 42, "arancione"), (42, 70, "giallo"),
        (70, 165, "verde"), (165, 200, "azzurro"), (200, 258, "blu"),
        (258, 300, "viola"), (300, 340, "rosa"), (340, 361, "rosso"),
    ]:
        if inizio <= gradi < fine:
            return nome
    return "rosso"


def carica(percorso, lato=360):
    im = Image.open(percorso).convert("RGBA")
    if im.width != lato:
        im = im.resize((lato, max(1, round(im.height * lato / im.width))), Image.BILINEAR)
    return np.array(im).astype(int)


def colori_per_confronto(percorsi):
    """
    Il colore di ogni livrea, dai punti in cui le livree differiscono.

    Riceve una fotografia per livrea, tutte della stessa vista. Torna un
    codice esadecimale per ognuna, nello stesso ordine, oppure None se il
    confronto non si puo' fare.
    """
    if len(percorsi) < 2:
        return None

    immagini = []
    for percorso in percorsi:
        try:
            immagini.append(carica(percorso))
        except Exception:
            return None

    altezza = min(i.shape[0] for i in immagini)
    larghezza = min(i.shape[1] for i in immagini)
    immagini = [i[:altezza, :larghezza] for i in immagini]

    visibile = immagini[0][:, :, 3] > 128
    for i in immagini[1:]:
        visibile &= i[:, :, 3] > 128
    if visibile.sum() < 200:
        return None

    scarto_massimo = np.zeros((altezza, larghezza))
    for n, a in enumerate(immagini):
        for b in immagini[n + 1:]:
            scarto = np.abs(a[:, :, :3] - b[:, :, :3]).max(axis=2)
            scarto_massimo = np.maximum(scarto_massimo, scarto)

    carrozzeria = visibile & (scarto_massimo > DIFFERENZA)
    for a in immagini:
        carrozzeria &= a[:, :, :3].max(axis=2) > BUIO

    if carrozzeria.sum() < 150:
        return None

    codici = []
    for a in immagini:
        pixel = a[:, :, :3][carrozzeria]
        # Non la media: dentro la carrozzeria ci sono anche le grafiche e le
        # parti in ombra, e mediando bianco e rosso viene fuori rosa. Prendiamo
        # invece la tinta che occupa piu' superficie, raggruppando le simili.
        grossolano = pixel // 24
        chiavi = grossolano[:, 0] * 144 + grossolano[:, 1] * 12 + grossolano[:, 2]
        conteggio = np.bincount(chiavi)

        # Fra i gruppi grandi preferiamo quello con una tinta vera. Su una
        # moto rossa il nero dei pannelli copre piu' superficie del rosso,
        # ma la livrea si chiama rossa per il rosso: se c'e' una tinta con
        # una superficie confrontabile, vince lei. Se non ce n'e' nessuna,
        # la moto e' davvero bianca, grigia o nera, e vince il piu' grande.
        soglia = conteggio.max() * 0.25
        candidati = np.where(conteggio >= soglia)[0]

        migliore = int(conteggio.argmax())
        vivacita_migliore = -1
        for gruppo in candidati:
            scelti = pixel[chiavi == gruppo]
            media = scelti.mean(axis=0)
            vivacita = float(media.max() - media.min())
            if vivacita > 38 and vivacita > vivacita_migliore:
                vivacita_migliore = vivacita
                migliore = int(gruppo)

        media = pixel[chiavi == migliore].mean(axis=0)
        codici.append("#%02x%02x%02x" % tuple(int(round(c)) for c in media))
    return codici


def main():
    p = argparse.ArgumentParser(description="Colore vero delle livree.")
    p.add_argument("--prova", action="store_true")
    p.add_argument("--provino", action="store_true")
    a = p.parse_args()

    s = io.open(CATALOGO, encoding="utf-8").read()
    pezzi = s.split("\n  {\n    id: '")

    schema = re.compile(
        r"slug: '(?P<slug>[^']+)',\n\s*name: '(?P<nome>[^']*)',\n\s*hex: '(?P<hex>[^']*)',"
        r"[\s\S]*?src: '(?P<src>[^']+)'"
    )

    misurate = 0
    dedotte = 0
    provino = []
    senza_confronto = []
    scartate = []

    for n in range(1, len(pezzi)):
        blocco = pezzi[n]
        ident = blocco.split("'")[0]
        livree = list(schema.finditer(blocco))
        if not livree:
            continue

        percorsi = [
            os.path.join("public", m.group("src").lstrip("/").replace("/", os.sep))
            for m in livree
        ]
        if not all(os.path.isfile(x) for x in percorsi):
            continue

        codici = colori_per_confronto(percorsi) if len(livree) > 1 else None
        confrontate = codici is not None
        if not confrontate:
            senza_confronto.append(ident)

        for k, m in enumerate(livree):
            atteso = dal_nome(m.group("nome"))
            if confrontate:
                codice = codici[k]
                # Il nome commerciale e' l'unica cosa certa che abbiamo: se
                # la misura dice un'altra famiglia di colore vuol dire che
                # ha preso un adesivo o un pannello, e la scartiamo.
                if atteso is not None and famiglia(codice) != famiglia(atteso):
                    codice = atteso
                    scartate.append("%s / %s" % (ident, m.group("nome")))
            else:
                codice = atteso or m.group("hex")
            vecchio = "slug: '%s',\n        name: '%s',\n        hex: '%s'," % (
                m.group("slug"), m.group("nome"), m.group("hex"))
            nuovo = "slug: '%s',\n        name: '%s',\n        hex: '%s'," % (
                m.group("slug"), m.group("nome"), codice)
            blocco = blocco.replace(vecchio, nuovo, 1)
            if confrontate:
                misurate += 1
            else:
                dedotte += 1
            provino.append((ident, m.group("nome"), codice, percorsi[k], confrontate))

        pezzi[n] = blocco

    if not a.prova:
        io.open(CATALOGO, "w", encoding="utf-8").write("\n  {\n    id: '".join(pezzi))

    print("%d livree misurate dal confronto, %d dedotte dal nome." % (misurate, dedotte))
    if senza_confronto:
        print("\nModelli con una livrea sola (colore dal nome):")
        for i in senza_confronto:
            print("  ", i)

    if a.provino:
        alto = 54
        tela = Image.new("RGB", (580, alto * len(provino)), (16, 16, 20))
        d = ImageDraw.Draw(tela)
        for i, (ident, nome, codice, percorso, confrontata) in enumerate(provino):
            y = i * alto
            moto = Image.open(percorso).convert("RGBA")
            moto = moto.resize((84, max(1, round(moto.height * 84 / moto.width))))
            tela.paste(moto, (4, y + 2), moto)
            d.rectangle([94, y + 10, 134, y + 42], fill=codice)
            d.text((144, y + 8), "%s / %s" % (ident, nome), fill=(235, 235, 235))
            d.text((144, y + 26), "%s  %s" % (codice, "misurato" if confrontata else "dal nome"),
                   fill=(150, 150, 150))
        fuori = os.path.join(os.environ.get("TEMP", "."), "claude", "provino-colori.png")
        os.makedirs(os.path.dirname(fuori), exist_ok=True)
        tela.save(fuori)
        print("\nProvino salvato in %s" % fuori)


if __name__ == "__main__":
    main()
