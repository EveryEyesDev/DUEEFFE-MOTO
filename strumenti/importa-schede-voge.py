#!/usr/bin/env python3
"""
Riempie le schede tecniche Voge e ne scrive i prezzi di listino.

A COSA SERVE
Come per Suzuki, l'importatore delle fotografie lascia le schede vuote.
Voge pubblica i dati tecnici nella pagina di ogni modello e i prezzi nel
listino pubblico in PDF: li prendiamo da li', senza trascrivere niente a
mano.

COME SI USA
    python strumenti/importa-schede-voge.py            scrive nel catalogo
    python strumenti/importa-schede-voge.py --prova    mostra e basta

I PREZZI
Vengono dal listino pubblico ufficiale di Voge Italy, quello scaricabile
dal sito. Sono prezzi franco concessionario, IVA inclusa, escluse le spese
di immatricolazione: la pagina lo dice accanto alla cifra, perche' un
prezzo senza quella precisazione in concessionaria diventa una discussione.

LA POTENZA
Voge la scrive come "35 kW (47,6 CV)": i kilowatt davanti e i cavalli fra
parentesi. Noi mostriamo i cavalli, percio' cerchiamo il numero che
precede "CV" e non il primo numero della riga, che sarebbe sbagliato.

COSA RESTA FUORI
Il peso e l'altezza sella non sono pubblicati per tutti i modelli: dove
mancano la pagina scrive "In arrivo", che e' meglio di un numero inventato.
"""

import argparse
import io
import os
import re
import shutil
import subprocess
import sys
import time

CATALOGO = os.path.join("src", "data", "motorcycles.ts")
BASE = "https://vogeitaly.it"
CURL = shutil.which("curl")

INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "it-IT,it;q=0.9",
    "Referer": BASE + "/",
}

CORRISPONDENZE = [
    (r"^cilindrata", "displacementCc", "numero"),
    (r"^potenza", "powerHp", "cavalli"),
    (r"^coppia", "torqueNm", "numero"),
    (r"^peso", "weightKg", "numero"),
    (r"^altezza sella", "seatHeightMm", "numero"),
    (r"^(capacita' )?serbatoio", "fuelCapacityL", "numero"),
    (r"^tipo motore$", "engineType", "testo"),
    (r"^cambio$", "transmission", "testo"),
    (r"^freno anteriore", "frontBrakes", "testo"),
    (r"^(sospensione|forcella) anteriore", "suspension", "testo"),
]

# I prezzi del listino pubblico Voge Italy, cosi' come li pubblica.
# Chiave: il nome della cartella del modello sotto public/moto.
PREZZI = {
    "voge-brivido-125r": 2790,
    "voge-brivido-125s": 3290,
    "voge-brivido-625r": 5990,
    "voge-trofeo-300ac": 3890,
    "voge-trofeo-300acx-scrambler": 3990,
    "voge-trofeo-350ac": 4590,
    "voge-trofeo-500ac": 6490,
    "voge-trofeo-525acx": 6790,
    "voge-valico-300-rally": 4290,
    "voge-valico525dsx": 5690,
    "voge-valico-625dsx": 5990,
    "voge-valico-800rally": 7990,
    "voge-valico-900dsx": 8990,
    "voge-sfida-sr1": 2690,
    "voge-sfida-sr1-adv": 3190,
    "voge-sfida-sr2-adv": 3190,
    "voge-sfida-sr3-2": 3990,
    "voge-sfida-sr4-max": 5490,
    "voge-sfida-sr450x": 6490,
    "voge-sfida-sr16-125-air": 2390,
    "voge-sfida-sr16": 2790,
    "voge-sfida-sr16-200": 2890,
}

NOTA_PREZZO = "Franco concessionario, IVA inclusa. Escluse spese di immatricolazione."


def scarica(url, tentativi=3):
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    comando = [CURL, "-sLg", "--max-time", "45", "--fail", "--compressed"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", "%s: %s" % (chiave, valore)]
    comando.append(url)
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        time.sleep(0.6 * (n + 1))
    raise RuntimeError("non raggiunta")


def numero(testo):
    m = re.search(r"\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?", testo)
    if not m:
        return None
    grezzo = m.group(0).replace(".", "").replace(",", ".")
    try:
        valore = float(grezzo)
    except ValueError:
        return None
    return int(valore) if valore == int(valore) else round(valore, 1)


def cavalli(testo):
    """Il numero che precede 'CV'. Voge scrive prima i kW, che non ci servono."""
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*CV", testo, re.I)
    if m:
        return numero(m.group(1))
    return numero(testo)


def scheda_di(html):
    piatto = re.sub(r"\s+", " ", html)
    coppie = re.findall(
        r'<td class="name-spech"[^>]*>\s*([^<]+?)\s*</td>\s*<td class="spech"[^>]*>\s*([^<]*?)\s*</td>',
        piatto,
    )
    scheda = {}
    for etichetta, valore in coppie:
        etichetta = etichetta.strip().lower().replace("à", "a'")
        valore = re.sub(r"&#8211;", "-", valore).strip()
        if not valore:
            continue
        for schema, campo, modo in CORRISPONDENZE:
            if re.search(schema, etichetta) and campo not in scheda:
                if modo == "cavalli":
                    n = cavalli(valore)
                    if n is not None:
                        scheda[campo] = n
                elif modo == "numero":
                    n = numero(valore)
                    if n is not None:
                        scheda[campo] = n
                else:
                    pulito = valore.replace("'", "’").replace("\\", "")
                    pulito = re.sub(r"[^\x20-\x7eÀ-ſ’]", "", pulito)
                    scheda[campo] = pulito[:90]
    return scheda


def scrivi(blocco, scheda, prezzo):
    cambiato = False
    if scheda and "    specs: {}," in blocco:
        righe = []
        for campo, valore in scheda.items():
            if isinstance(valore, str):
                righe.append("      %s: '%s'," % (campo, valore))
            else:
                righe.append("      %s: %s," % (campo, valore))
        blocco = blocco.replace(
            "    specs: {},", "    specs: {\n" + "\n".join(righe) + "\n    },", 1
        )
        cambiato = True

    if prezzo is not None and "\n    price:" not in blocco:
        blocco = blocco.replace(
            "    colorways: [",
            "    price: %d,\n    priceNote: '%s',\n    colorways: [" % (prezzo, NOTA_PREZZO),
            1,
        )
        cambiato = True
    return blocco, cambiato


def main():
    p = argparse.ArgumentParser(description="Schede tecniche e prezzi Voge.")
    p.add_argument("--prova", action="store_true")
    a = p.parse_args()

    s = io.open(CATALOGO, encoding="utf-8").read()
    pezzi = s.split("\n  {\n    id: '")

    fatti = 0
    senza_prezzo = []
    senza_scheda = []
    for n in range(1, len(pezzi)):
        ident = pezzi[n].split("'")[0]
        if not ident.startswith("voge-"):
            continue
        slug = ident[len("voge-"):]
        try:
            html = scarica("%s/%s/" % (BASE, slug)).decode("utf-8", "replace")
            scheda = scheda_di(html)
        except RuntimeError:
            scheda = {}

        prezzo = PREZZI.get(ident)
        if prezzo is None:
            senza_prezzo.append(ident)
        if not scheda:
            senza_scheda.append(ident)

        pezzi[n], cambiato = scrivi(pezzi[n], scheda, prezzo)
        if cambiato:
            fatti += 1
        numeri = ", ".join(
            "%s %s" % (k, v) for k, v in scheda.items() if not isinstance(v, str)
        )
        print("  %-32s %-8s %s" % (ident, ("%d EUR" % prezzo) if prezzo else "-", numeri[:70]))

    if a.prova:
        print("\n%d modelli pronti. Prova soltanto: non ho scritto niente." % fatti)
    else:
        io.open(CATALOGO, "w", encoding="utf-8").write("\n  {\n    id: '".join(pezzi))
        print("\n%d modelli Voge aggiornati nel catalogo." % fatti)

    if senza_prezzo:
        print("\nSenza prezzo a listino (da chiedere):")
        for i in senza_prezzo:
            print("  ", i)
    if senza_scheda:
        print("\nSenza scheda tecnica pubblicata:")
        for i in senza_scheda:
            print("  ", i)


if __name__ == "__main__":
    main()
