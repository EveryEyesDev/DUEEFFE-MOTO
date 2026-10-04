#!/usr/bin/env python3
"""
Riempie le schede tecniche Suzuki leggendole dal sito ufficiale.

A COSA SERVE
L'importatore delle fotografie lascia le schede vuote, e in pagina compare
"In arrivo" al posto di cilindrata, potenza e peso. Qui andiamo a prendere
quei dati: Suzuki li pubblica per intero nella pagina di ogni modello, in
una tabella leggibile, quindi non c'e' niente da trascrivere a mano e
niente da inventare.

COME SI USA
    python strumenti/importa-schede-suzuki.py            scrive nel catalogo
    python strumenti/importa-schede-suzuki.py --prova    mostra e basta

COSA PRENDE
Cilindrata, potenza, coppia, peso in ordine di marcia, altezza sella,
capacita' del serbatoio, tipo di motore, cambio, freno anteriore e
sospensioni. Sono le voci che il sito mostra in scheda.

COSA NON PRENDE
Il prezzo. Suzuki non lo scrive da nessuna parte nella pagina: accanto al
modello c'e' solo la rata del finanziamento e la nota "franco
concessionario". Il prezzo di listino va chiesto al concessionario, e
finche' manca la pagina scrive "Prezzo su richiesta", che e' la verita'.

COME TROVA I NUMERI
I valori arrivano come stanno scritti ("776 cc", "83 CV (61 kW)",
"202 kg"): ne estraiamo il numero e scartiamo il resto. I decimali in
italiano usano la virgola e le migliaia il punto, quindi prima di
convertire togliamo i punti e trasformiamo la virgola in punto.
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
BASE = "https://moto.suzuki.it"
CURL = shutil.which("curl")

INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "it-IT,it;q=0.9",
    "Referer": BASE + "/",
}

# Come si chiama da loro, come si chiama da noi, e se e' un numero.
CORRISPONDENZE = [
    (r"^cilindrata$", "displacementCc", True),
    (r"^potenza max", "powerHp", True),
    (r"^coppia max", "torqueNm", True),
    (r"^peso in ordine", "weightKg", True),
    (r"^altezza sella", "seatHeightMm", True),
    (r"^serbatoio", "fuelCapacityL", True),
    (r"^tipo$", "engineType", False),
    (r"^cambio$", "transmission", False),
    (r"^freno anteriore$", "frontBrakes", False),
    (r"^sospensione anteriore$", "suspension", False),
]


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
    """Il primo numero del testo, scritto all'italiana. None se non c'e'."""
    m = re.search(r"\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?", testo)
    if not m:
        return None
    grezzo = m.group(0).replace(".", "").replace(",", ".")
    try:
        valore = float(grezzo)
    except ValueError:
        return None
    return int(valore) if valore == int(valore) else round(valore, 1)


def scheda_di(html):
    """Legge la tabella della scheda tecnica e la traduce nei nostri campi."""
    piatto = re.sub(r"\s+", " ", html)
    coppie = re.findall(r"<td><b>([^<]+?):?</b></td>\s*<td>\s*([^<]*?)\s*</td>", piatto)

    scheda = {}
    for etichetta, valore in coppie:
        etichetta = etichetta.strip().lower()
        valore = valore.strip()
        if not valore:
            continue
        for schema, campo, numerico in CORRISPONDENZE:
            if re.search(schema, etichetta) and campo not in scheda:
                if numerico:
                    n = numero(valore)
                    if n is not None:
                        scheda[campo] = n
                else:
                    # Via i caratteri che romperebbero la stringa nel catalogo.
                    pulito = valore.replace("'", "’").replace("\\", "")
                    pulito = re.sub(r"[^\x20-\x7eÀ-ſ’]", "", pulito)
                    scheda[campo] = pulito[:90]
    return scheda


def elenco_modelli():
    html = scarica(BASE + "/").decode("utf-8", "replace")
    percorsi = sorted(set(re.findall(r'href="(/modelli/\d+/[^"]+\.aspx)"', html)))
    return {p.rsplit("/", 1)[-1].replace(".aspx", ""): p for p in percorsi}


def scrivi_scheda(blocco, scheda):
    """Sostituisce specs: {} con i dati veri, dentro il blocco di un modello."""
    if not scheda:
        return blocco, False
    righe = []
    for campo, valore in scheda.items():
        if isinstance(valore, str):
            righe.append("      %s: '%s'," % (campo, valore))
        else:
            righe.append("      %s: %s," % (campo, valore))
    nuovo = "    specs: {\n" + "\n".join(righe) + "\n    },"
    if "    specs: {}," in blocco:
        return blocco.replace("    specs: {},", nuovo, 1), True
    # Gia' compilata: non la tocchiamo.
    return blocco, False


def main():
    p = argparse.ArgumentParser(description="Schede tecniche Suzuki.")
    p.add_argument("--prova", action="store_true")
    a = p.parse_args()

    mappa = elenco_modelli()
    s = io.open(CATALOGO, encoding="utf-8").read()

    pezzi = s.split("\n  {\n    id: '")
    fatti = 0
    vuoti = []
    for n in range(1, len(pezzi)):
        ident = pezzi[n].split("'")[0]
        if not ident.startswith("suzuki-"):
            continue
        slug = ident[len("suzuki-"):]
        percorso = mappa.get(slug)
        if not percorso:
            vuoti.append((ident, "pagina non trovata in gamma"))
            continue
        try:
            html = scarica(BASE + percorso).decode("utf-8", "replace")
        except RuntimeError:
            vuoti.append((ident, "pagina non raggiunta"))
            continue

        scheda = scheda_di(html)
        if not scheda:
            vuoti.append((ident, "nessuna scheda pubblicata"))
            continue

        pezzi[n], cambiato = scrivi_scheda(pezzi[n], scheda)
        if cambiato:
            fatti += 1
        riassunto = ", ".join(
            "%s %s" % (k, v) for k, v in list(scheda.items())[:4] if not isinstance(v, str)
        )
        print("  %-36s %s" % (ident, riassunto or "solo descrizioni"))

    if a.prova:
        print("\n%d schede pronte. Prova soltanto: non ho scritto niente." % fatti)
    else:
        io.open(CATALOGO, "w", encoding="utf-8").write("\n  {\n    id: '".join(pezzi))
        print("\n%d schede tecniche scritte nel catalogo." % fatti)

    if vuoti:
        print("\nSenza scheda:")
        for ident, motivo in vuoti:
            print("  %-36s %s" % (ident, motivo))


if __name__ == "__main__":
    main()
