#!/usr/bin/env python3
"""
Riallinea l'elenco delle viste nel catalogo a quello che c'e' su disco.

PERCHE' SERVE
Il catalogo scritto in src/data/motorcycles.ts dice, per ogni livrea,
quali viste mostrare nella scheda. Quando se ne aggiungono di nuove alla
cartella delle fotografie, quel blocco resta indietro: i file ci sono ma
la scheda continua a mostrarne una sola.

Questo strumento legge la cartella e riscrive il blocco views, cosi' le
due cose non possono piu' divergere.

L'ORDINE DELLE VISTE
Sempre lo stesso per tutte le moto del sito: fronte, inclinata a destra,
lato destro, retro, inclinata a sinistra, lato sinistro. E' il giro che
si fa attorno a una moto in salone, e tenerlo uguale ovunque fa si' che
passando da una scheda all'altra le fotografie non saltino.

Le viste che su disco non ci sono vengono semplicemente saltate: nessun
buco e nessun collegamento rotto.

CONTROLLA ANCHE I DOPPIONI DI LIVREA
Due livree con lo stesso slug dentro la stessa moto fanno comparire il
colore due volte nel selettore della scheda, e React se ne lamenta in
console perche' due figli finiscono con la stessa chiave. E' successo
davvero: la GSX-8R aveva BLU MIAMI elencata due volte, uguale identica, e
nessuno se n'era accorto fino a quando non si e' guardata la console per
un altro motivo. Qui viene segnalato.

COME SI USA
    python strumenti/allinea-viste.py voge-xwolf-300 voge-brivido-625r
    python strumenti/allinea-viste.py --tutte
"""

import os
import re
import sys

CATALOGO = os.path.join("src", "data", "motorcycles.ts")
FOTO = os.path.join("public", "moto")

# Il giro attorno alla moto, nell'ordine in cui lo mostriamo sempre.
GIRO = [
    ("fronte", "Fronte"),
    ("angolo-destro", "Inclinata a destra"),
    ("lato-destro", "Lato destro"),
    ("retro", "Retro"),
    ("angolo-sinistro", "Inclinata a sinistra"),
    ("lato-sinistro", "Lato sinistro"),
]


def viste_su_disco(modello, livrea):
    cartella = os.path.join(FOTO, modello, livrea)
    if not os.path.isdir(cartella):
        return []
    presenti = set(os.listdir(cartella))
    return [(i, e) for i, e in GIRO if i + ".webp" in presenti]


def riscrivi(testo, modello):
    """Sostituisce i blocchi views di un modello. Torna (testo, quante)."""
    inizio = testo.find("id: '%s'," % modello)
    if inizio < 0:
        print("  %-24s non e' nel catalogo" % modello)
        return testo, 0

    # La scheda finisce dove comincia quella dopo.
    dopo = testo.find("\n    id: '", inizio + 1)
    fine = dopo if dopo > 0 else len(testo)
    scheda = testo[inizio:fine]

    cambiate = 0
    pezzi = []
    resto = scheda
    while True:
        m = re.search(r"slug: '([^']+)',", resto)
        if not m:
            pezzi.append(resto)
            break
        livrea = m.group(1)
        v = re.search(r"views: \[\n(?:.*\n)*?(\s*)\],", resto[m.end():])
        if not v:
            pezzi.append(resto[: m.end()])
            resto = resto[m.end():]
            continue

        viste = viste_su_disco(modello, livrea)
        if not viste:
            pezzi.append(resto[: m.end() + v.end()])
            resto = resto[m.end() + v.end():]
            continue

        rientro = v.group(1)
        righe = [
            "%s  { id: '%s', label: '%s', src: '/moto/%s/%s/%s.webp' },"
            % (rientro, i, e, modello, livrea, i)
            for i, e in viste
        ]
        nuovo = "views: [\n" + "\n".join(righe) + "\n" + rientro + "],"
        pezzi.append(resto[: m.end()] + resto[m.end():m.end() + v.start()] + nuovo)
        resto = resto[m.end() + v.end():]
        cambiate += 1
        print("  %-24s %-10s %d viste" % (modello, livrea, len(viste)))

    return testo[:inizio] + "".join(pezzi) + testo[fine:], cambiate


def doppioni_di_livrea(testo):
    """Le moto che elencano due volte la stessa livrea."""
    apertura = chr(10) + "  {" + chr(10) + "    id: '"
    esito = []
    for blocco in testo.split(apertura)[1:]:
        slug = re.findall(r"slug: '([^']+)'", blocco)
        ripetuti = sorted({s for s in slug if slug.count(s) > 1})
        if ripetuti:
            esito.append((blocco.split("'")[0], ripetuti))
    return esito


def main():
    testo = open(CATALOGO, encoding="utf-8").read()
    if sys.argv[1:] == ["--tutte"]:
        modelli = re.findall(r"^    id: '([^']+)',$", testo, re.M)
    else:
        modelli = sys.argv[1:]
    if not modelli:
        sys.exit(__doc__)

    totale = 0
    for modello in modelli:
        testo, n = riscrivi(testo, modello)
        totale += n
    open(CATALOGO, "w", encoding="utf-8").write(testo)
    print("Livree aggiornate: %d" % totale)

    for modello, ripetuti in doppioni_di_livrea(testo):
        print("  ATTENZIONE  %s elenca due volte: %s" % (modello, ", ".join(ripetuti)))


if __name__ == "__main__":
    main()
