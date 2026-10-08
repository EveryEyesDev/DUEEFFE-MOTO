#!/usr/bin/env python3
"""
Riscrive sottotitolo e descrizione delle moto usando i dati che gia' ci sono.

IL PROBLEMA
Quando le moto sono state importate, i dati tecnici non c'erano ancora:
l'importatore ha messo "Scheda tecnica da completare" come sottotitolo e,
come descrizione, "Dati tecnici e prezzo te li diamo in concessionaria".
Erano frasi oneste, allora.

Poi le schede sono state riempite e i prezzi sono arrivati, ma quelle due
frasi sono rimaste: quarantacinque moto su cinquantadue dichiarano di non
avere la scheda tecnica mentre ce l'hanno piena, e invitano a telefonare
per sapere il prezzo che e' scritto due centimetri piu' in alto.

Sono scritte false, ed e' la prima riga che si legge sotto il nome. In
piu' sono identiche su quarantacinque pagine: adesso che ogni moto ha il
suo indirizzo, Google si trova quarantacinque pagine che dicono la stessa
cosa, e le tratta per quello che sembrano.

COSA CI METTE AL POSTO
Niente di inventato: solo quello che c'e' nei dati. Il sottotitolo diventa
la carta d'identita' della moto - categoria, cilindrata, potenza - e la
descrizione una frase costruita sulle stesse misure. Cambiando i numeri
cambia la frase, quindi quarantacinque pagine diventano quarantacinque
pagine diverse senza che nessuno abbia scritto una parola.

Non e' il testo che scriverebbe chi la moto la vende: quello sa a chi e'
adatta e cosa ha di suo, e vale di piu'. Questo e' il minimo che si puo'
dire restando veri, e serve a non lasciare in pagina una frase sbagliata
mentre si aspetta quella giusta.

NON TOCCA CHI HA GIA' UN TESTO SUO
Le sette moto con descrizione scritta a mano restano come sono. La regola
e' meccanica: si interviene solo dove c'e' ancora la frase
dell'importatore, riconoscibile parola per parola.

COME SI USA
    python strumenti/testi-da-dati.py --prova    mostra cosa scriverebbe
    python strumenti/testi-da-dati.py
"""

import argparse
import re

CATALOGO = "src/data/motorcycles.ts"

# Le frasi messe dall'importatore. Si tocca solo chi ha ancora queste.
SOTTOTITOLO_VECCHIO = "Scheda tecnica da completare"
DESCRIZIONE_VECCHIA = "Modello della gamma"

APERTURA = "\n  {\n    id: '"


def valore(blocco, campo):
    """
    Il valore di un campo della scheda tecnica.

    Le stringhe si leggono fino all'apice di chiusura e non fino alla
    prima virgola: i tipi di motore le virgole ce le hanno dentro
    ("Bicilindrico a V, 4 tempi, raffreddamento a liquido"), e tagliando
    li' veniva fuori mezza frase.
    """
    m = re.search(r"\n      %s: '((?:[^'\\]|\\.)*)'" % campo, blocco)
    if m:
        return m.group(1)
    m = re.search(r"\n      %s: ([0-9.]+)," % campo, blocco)
    if not m:
        return None
    grezzo = m.group(1)
    try:
        return float(grezzo) if "." in grezzo else int(grezzo)
    except ValueError:
        return None


def decimale(x):
    """I decimali in italiano vogliono la virgola: 8.7 CV si scrive 8,7."""
    return ("%g" % x).replace(".", ",")


def campo(blocco, nome):
    m = re.search(r"\n    %s: '((?:[^'\\]|\\.)*)'" % nome, blocco)
    return m.group(1) if m else ""


def numero(x):
    """Il separatore delle migliaia come si scrive in italiano."""
    return format(int(x), ",d").replace(",", ".")


def sottotitolo(blocco):
    """La carta d'identita' della moto, in tre pezzi al massimo."""
    pezzi = []
    categoria = campo(blocco, "categoryLabel")
    if categoria:
        pezzi.append(categoria)
    cc = valore(blocco, "displacementCc")
    if cc:
        pezzi.append("%s cc" % numero(cc))
    cv = valore(blocco, "powerHp")
    if cv:
        pezzi.append("%s CV" % decimale(cv))
    return " · ".join(pezzi)


def descrizione(blocco, marca, nome):
    """
    Una frase costruita sulle misure vere.

    Si parte dal motore, che e' quello che distingue una moto dall'altra,
    e si arriva alla sella, che e' la prima cosa che chiede chi non e'
    altissimo. Quello che manca si salta, senza lasciare buchi nel
    discorso.
    """
    motore = valore(blocco, "engineType")
    cc = valore(blocco, "displacementCc")
    cv = valore(blocco, "powerHp")
    nm = valore(blocco, "torqueNm")
    kg = valore(blocco, "weightKg")
    sella = valore(blocco, "seatHeightMm")
    cambio = valore(blocco, "transmission")

    frasi = []

    # Del motore si tiene solo il primo pezzo. Le schede lo scrivono per
    # esteso - "Bicilindrico a V, 4 tempi, raffr. a liquido, DOHC" - e
    # infilato in una frase diventa un elenco in mezzo al discorso: il
    # resto si legge nella tabella qui sotto, dove sta meglio.
    testa = "%s %s" % (marca, nome)
    if motore:
        corto = motore.split(",")[0].strip()
        testa += ": %s%s" % (corto[0].lower(), corto[1:])
        if cc:
            testa += " da %s cc" % numero(cc)
    elif cc:
        testa += ": %s cc" % numero(cc)
    frasi.append(testa + ".")

    seconda = []
    if cv and nm:
        seconda.append("%s CV e %s Nm" % (decimale(cv), decimale(nm)))
    elif cv:
        seconda.append("%s CV" % decimale(cv))
    if kg:
        seconda.append("%s kg" % numero(kg))
    if sella:
        seconda.append("sella a %s mm" % numero(sella))
    if cambio and "automatic" in cambio.lower():
        seconda.append("cambio automatico")
    if seconda:
        # Solo la prima lettera, non capitalize(): quello abbassa anche il
        # resto e faceva diventare "107 CV e 100 Nm" un "107 cv e 100 nm".
        frase = ", ".join(seconda)
        frasi.append(frase[0].upper() + frase[1:] + ".")

    frasi.append("Passa a vederla in salone: te la facciamo provare.")
    return " ".join(frasi)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--prova", action="store_true", help="mostra senza scrivere")
    a = p.parse_args()

    testo = open(CATALOGO, encoding="utf-8").read()
    pezzi = testo.split(APERTURA)
    fatte = 0

    for i in range(1, len(pezzi)):
        blocco = pezzi[i]
        if SOTTOTITOLO_VECCHIO not in blocco and DESCRIZIONE_VECCHIA not in blocco:
            continue

        marca = campo(blocco, "brand")
        nome = campo(blocco, "name")
        nuovo_sottotitolo = sottotitolo(blocco)
        nuova_descrizione = descrizione(blocco, marca, nome)

        if not nuovo_sottotitolo:
            continue

        if a.prova:
            print("%s %s" % (marca, nome))
            print("   %s" % nuovo_sottotitolo)
            print("   %s" % nuova_descrizione)
            print()
        else:
            blocco = blocco.replace(
                "subtitle: '%s'" % SOTTOTITOLO_VECCHIO,
                "subtitle: '%s'" % nuovo_sottotitolo,
            )
            blocco = re.sub(
                r"\n    description: '(?:[^'\\]|\\.)*Modello della gamma(?:[^'\\]|\\.)*',",
                "\n    description:\n      '%s'," % nuova_descrizione.replace("'", "\\'"),
                blocco,
            )
            pezzi[i] = blocco
        fatte += 1

    if not a.prova:
        open(CATALOGO, "w", encoding="utf-8").write(APERTURA.join(pezzi))
    print("Moto con i testi rifatti dai dati: %d" % fatte)


if __name__ == "__main__":
    main()
