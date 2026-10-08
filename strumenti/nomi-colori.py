#!/usr/bin/env python3
"""
Da' un nome alle livree che non ce l'hanno.

IL CASO
Ventisette livree su centoventiquattro si chiamano "Livrea 1", "Livrea 2"
o "Livrea ufficiale". Non e' pigrizia dell'importatore: per quei modelli
il costruttore il nome commerciale del colore non lo pubblica. Verificato
sulle pagine di Burgman 400 e V-Strom 800DE, dove Suzuki carica la
sezione dei colori a parte e non la espone.

"Livrea 2" pero' non dice niente a chi guarda. Se il nome vero non si
puo' avere, tanto vale scrivere quello che si vede: il cliente cerca "la
gialla" o "quella nera coi cerchi arancioni", non la livrea numero sei.

PERCHE' NON SI NUMERANO I DOPPIONI
Dentro lo stesso modello capita che due livree siano dello stesso colore:
la V-Strom 800DE ne ha due gialle e due bianche e blu, la Burgman 400 due
nere. "Giallo 1" e "Giallo 2" riportano al punto di partenza.

Si distingue invece per quello che le distingue davvero, e che si vede
nella fotografia: su queste moto sono i cerchi. Oro contro blu sulla
V-Strom, blu contro arancione sulla Burgman. Chi entra in salone dice
"quella coi cerchi dorati", e trova la sua.

COME SONO STATI SCELTI
A occhio, uno per uno, su un provino con le ventisette livree affiancate.
La misura automatica era stata provata e non regge: sulla Burgman la
saturazione della carrozzeria e' 0,06 - il colore e' tutto nei pannelli
piccoli e nei cerchi - e sulla SR450X dava "azzurro" per una vernice
cangiante che vira col taglio di luce. La stessa lezione delle livree
Suzuki mescolate: la misura propone, l'occhio decide.

Per rifare il provino:
    python strumenti/nomi-colori.py --provino

COME SI USA
    python strumenti/nomi-colori.py --prova    mostra cosa scriverebbe
    python strumenti/nomi-colori.py
"""

import argparse
import os
import re

CATALOGO = os.path.join("src", "data", "motorcycles.ts")
FOTO = os.path.join("public", "moto")
APERTURA = "\n  {\n    id: '"

# La tinta del pallino accanto al nome. Una tavolozza sola per tutto il
# catalogo: due moto che chiamiamo "Nero" devono avere lo stesso pallino,
# altrimenti il colore sembra un dato preciso quando e' una descrizione.
TAVOLOZZA = {
    "Nero": "#141418",
    "Grigio": "#5e6168",
    "Argento": "#b8bcc2",
    "Bianco": "#eef0f2",
    "Blu": "#1d3f8f",
    "Blu petrolio": "#1f4a52",
    "Verde": "#2e4a39",
    "Verde salvia": "#7d9183",
    "Giallo": "#e8c21a",
}

# Le ventisette livree, guardate una per una sul provino.
# La chiave e' "<cartella delle foto>/<livrea>".
# Il valore e' (nome da mostrare, colore di base per il pallino).
NOMI = {
    # Burgman 400: carrozzeria scura su tutte, cambiano i pannelli e i
    # cerchi. Le due nere si distinguono solo per quelli.
    "suzuki-burgman-400/livrea-1": ("Argento", "Argento"),
    "suzuki-burgman-400/livrea-2": ("Grigio", "Grigio"),
    "suzuki-burgman-400/livrea-3": ("Nero cerchi blu", "Nero"),
    "suzuki-burgman-400/livrea-4": ("Verde", "Verde"),
    "suzuki-burgman-400/livrea-5": ("Blu", "Blu"),
    "suzuki-burgman-400/livrea-6": ("Nero cerchi arancio", "Nero"),
    # V-Strom 800DE: due gialle e due bianche e blu, separate dai cerchi.
    "suzuki-v-strom-800de/livrea-1": ("Giallo cerchi oro", "Giallo"),
    "suzuki-v-strom-800de/livrea-2": ("Verde salvia", "Verde salvia"),
    "suzuki-v-strom-800de/livrea-3": ("Bianco e blu cerchi oro", "Bianco"),
    "suzuki-v-strom-800de/livrea-4": ("Giallo cerchi blu", "Giallo"),
    "suzuki-v-strom-800de/livrea-5": ("Bianco e blu cerchi blu", "Bianco"),
    "suzuki-v-strom-800de/livrea-6": ("Nero", "Nero"),
    # Voge: una livrea per modello, quindi nessun doppione da separare.
    "voge-sfida-sr1-adv/unica": ("Grigio", "Grigio"),
    "voge-sfida-sr1/unica": ("Argento", "Argento"),
    "voge-sfida-sr16-125-air/unica": ("Nero", "Nero"),
    "voge-sfida-sr16-200/unica": ("Nero", "Nero"),
    "voge-sfida-sr16/unica": ("Bianco", "Bianco"),
    "voge-sfida-sr2-adv/unica": ("Nero e bianco", "Nero"),
    "voge-sfida-sr3-2/unica": ("Grigio", "Grigio"),
    "voge-sfida-sr4-max/unica": ("Nero", "Nero"),
    "voge-sfida-sr450x/unica": ("Blu petrolio", "Blu petrolio"),
    "voge-trofeo-300ac/unica": ("Verde", "Verde"),
    "voge-trofeo-300acx-scrambler/unica": ("Argento", "Argento"),
    "voge-trofeo-350ac/unica": ("Giallo", "Giallo"),
    "voge-trofeo-500ac/unica": ("Argento", "Argento"),
    "voge-trofeo-525acx/unica": ("Argento", "Argento"),
    "voge-valico-800rally/unica": ("Giallo", "Giallo"),
}

SENZA_NOME = re.compile(r"^(Livrea \d+|Livrea ufficiale)$")


def cartella_di(ident):
    for nome in (ident.replace("moto-morini-", ""), ident):
        if os.path.isdir(os.path.join(FOTO, nome)):
            return nome
    return ident


def provino():
    """Rifa' il foglio con le livree senza nome, da guardare a schermo."""
    from PIL import Image, ImageDraw

    testo = open(CATALOGO, encoding="utf-8").read()
    voci = []
    for blocco in testo.split(APERTURA)[1:]:
        ident = blocco.split("'")[0]
        nome = re.search(r"\n    name: '([^']*)'", blocco).group(1)
        cartella = cartella_di(ident)
        for slug, etichetta in re.findall(
            r"slug: '([^']+)',\n\s*name: '([^']*)'", blocco
        ):
            if not SENZA_NOME.match(etichetta):
                continue
            dove = os.path.join(FOTO, cartella, slug)
            scatto = None
            for vista in ("lato-destro", "angolo-destro", "fronte"):
                percorso = os.path.join(dove, vista + ".webp")
                if os.path.exists(percorso):
                    scatto = percorso
                    break
            voci.append((nome, "%s/%s" % (cartella, slug), scatto))

    colonne, larghezza, altezza = 5, 300, 215
    righe = (len(voci) + colonne - 1) // colonne
    foglio = Image.new("RGB", (colonne * larghezza, righe * (altezza + 30)), (255, 255, 255))
    penna = ImageDraw.Draw(foglio)
    for i, (nome, chiave, scatto) in enumerate(voci):
        x, y = (i % colonne) * larghezza, (i // colonne) * (altezza + 30)
        if scatto:
            im = Image.open(scatto).convert("RGBA")
            tela = Image.new("RGBA", im.size, (255, 255, 255, 255))
            tela.alpha_composite(im)
            im = tela.convert("RGB")
            im.thumbnail((larghezza - 10, altezza - 10), Image.LANCZOS)
            foglio.paste(im, (x + (larghezza - im.width) // 2, y + 5))
        penna.text((x + 6, y + altezza + 4), "%d. %s" % (i + 1, nome[:30]), fill=(0, 0, 0))
        penna.text((x + 6, y + altezza + 16), "    " + chiave, fill=(90, 90, 90))
    uscita = os.path.join("strumenti", "_scarico", "livree-senza-nome.png")
    os.makedirs(os.path.dirname(uscita), exist_ok=True)
    foglio.save(uscita)
    print("Provino in %s — %d livree" % (uscita, len(voci)))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--prova", action="store_true", help="mostra senza scrivere")
    p.add_argument("--provino", action="store_true", help="rifa' il foglio da guardare")
    a = p.parse_args()

    if a.provino:
        provino()
        return

    testo = open(CATALOGO, encoding="utf-8").read()
    pezzi = testo.split(APERTURA)
    fatte = 0
    saltate = []

    for i in range(1, len(pezzi)):
        blocco = pezzi[i]
        ident = blocco.split("'")[0]
        cartella = cartella_di(ident)

        for slug, etichetta in re.findall(r"slug: '([^']+)',\n\s*name: '([^']*)'", blocco):
            if not SENZA_NOME.match(etichetta):
                continue
            chiave = "%s/%s" % (cartella, slug)
            if chiave not in NOMI:
                saltate.append(chiave)
                continue
            nuovo, base = NOMI[chiave]
            tinta = TAVOLOZZA[base]

            if a.prova:
                print("  %-40s %-24s %s" % (chiave, nuovo, tinta))
                fatte += 1
                continue

            # Si riscrive il nome e, subito sotto, il pallino: devono
            # cambiare insieme, altrimenti si legge "Giallo" accanto a un
            # quadratino grigio.
            vecchio = "slug: '%s',\n        name: '%s',\n        hex: '" % (slug, etichetta)
            posizione = blocco.find(vecchio)
            if posizione < 0:
                saltate.append(chiave + " (non combacia)")
                continue
            fine_tinta = blocco.index("'", posizione + len(vecchio))
            blocco = (
                blocco[:posizione]
                + "slug: '%s',\n        name: '%s',\n        hex: '%s" % (slug, nuovo, tinta)
                + blocco[fine_tinta:]
            )
            fatte += 1
        pezzi[i] = blocco

    if not a.prova:
        open(CATALOGO, "w", encoding="utf-8").write(APERTURA.join(pezzi))
    print("Livree con un nome vero: %d" % fatte)
    for s in saltate:
        print("  SALTATA  %s" % s)


if __name__ == "__main__":
    main()
