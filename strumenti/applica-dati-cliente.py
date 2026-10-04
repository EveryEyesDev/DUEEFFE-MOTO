#!/usr/bin/env python3
"""
Scrive nel catalogo i dati arrivati dal cliente.

A COSA SERVE
Il cliente ha compilato le caselle che mancavano: coppie di Moto Morini,
prezzi e cambio di Suzuki, dati tecnici di Voge. Qui li mettiamo nel
catalogo, uno per uno, senza toccare quello che c'era gia'.

COME SI USA
    python strumenti/applica-dati-cliente.py          scrive
    python strumenti/applica-dati-cliente.py --prova  mostra e basta

IL CONTROLLO DI PLAUSIBILITA'
Prima di scrivere, ogni numero passa un controllo grossolano: una sella
alta 202 millimetri o una moto da 20 chili non esistono, e un refuso di
battitura e' facile. Quello che non passa non viene scritto e compare
nell'elenco in fondo, da ricontrollare. Meglio lasciare "In arrivo" che
pubblicare un dato sbagliato.

I PREZZI
Li scriviamo come arrivano, indicando in pagina che sono franco
concessionario: e' la nota che evita discussioni in salone. Non ho modo di
verificarli contro un listino ufficiale Suzuki, perche' il loro sito non
pubblica i prezzi.
"""

import argparse
import io
import os
import re
import sys

CATALOGO = os.path.join("src", "data", "motorcycles.ts")

NOTA_PREZZO = "Franco concessionario, IVA inclusa. Escluse spese di immatricolazione."

# Limiti oltre i quali il dato e' certamente un refuso.
PLAUSIBILE = {
    "price": (500, 60000),
    "torqueNm": (5, 200),
    "weightKg": (60, 400),
    "seatHeightMm": (600, 1000),
    "powerHp": (3, 320),
}

# ---------------------------------------------------------------- Moto Morini
COPPIE_MORINI = {
    "moto-morini-x-cape-700": 68,
    "moto-morini-x-cape-1200": 106,
    "moto-morini-alltrhike-450": 42,
    "moto-morini-seiemmezzo-str": 54,
    "moto-morini-calibro-custom": 68,
    "moto-morini-calibro-bagger": 68,
}

# ------------------------------------------------------------------- Suzuki
SUZUKI = {
    "suzuki-v-strom-1050de": (13590, "6 marce"),
    "suzuki-v-strom-1050se": (12990, "6 marce"),
    "suzuki-address-125": (2590, "CVT automatico"),
    "suzuki-burgman-street-125-executive": (2690, "CVT automatico"),
    "suzuki-gsx-8s": (7590, None),
    "suzuki-v-strom-800se": (8890, None),
    "suzuki-gsx-8r": (8590, None),
    "suzuki-gsx-s1000gx": (14990, None),
    "suzuki-dr-z4s": (7990, None),
    "suzuki-dr-z4sm": (7990, None),
    "suzuki-gsx-s1000-evo": (12990, None),
    "suzuki-gsx-8t": (9690, None),
    "suzuki-gsx-8tt": (9990, None),
    "suzuki-rm-z450": (8890, None),
    "suzuki-gsx-r1000r": (20490, None),
    "suzuki-sv-7gx": (8290, None),
    "suzuki-gsx-r125": (4390, None),
    "suzuki-gsx-s125": (4190, "6 marce"),
    "suzuki-katana": (14390, "6 marce"),
    "suzuki-hayabusa": (19990, "6 marce"),
    "suzuki-gsx-s1000gt": (13990, "6 marce"),
    "suzuki-burgman-400": (6990, "CVT automatico"),
    "suzuki-v-strom-800de": (9790, None),
}

# La RM-Z450 ha la scheda a parte, dalle note del cliente.
RMZ450 = {
    "powerHp": 54,
    "torqueNm": 49,
    "seatHeightMm": 955,
    "engineType": "Monocilindrico 4T 449 cc",
}

# --------------------------------------------------------------------- Voge
# (coppia Nm, peso kg, tipo motore, freno anteriore, altezza sella o None)
VOGE = {
    "voge-brivido-125r": (12.1, 129, "Monocilindrico 4T 124,8 cc", "Disco 276 mm", None),
    "voge-brivido-125s": (12.1, 129, "Monocilindrico 4T 124,8 cc", "Disco 276 mm", None),
    "voge-brivido-625r": (57, 190, "Bicilindrico parallelo 4T 581 cc", "Doppio disco 298 mm", None),
    "voge-sfida-sr1-adv": (11, 134, "Monocilindrico 4T 124,9 cc", "Disco 220 mm", None),
    "voge-sfida-sr1": (11, 133, "Monocilindrico 4T 124,9 cc", "Disco 220 mm", None),
    "voge-sfida-sr16-125-air": (11, 136, "Monocilindrico 4T 124,9 cc", "Disco 220 mm", None),
    "voge-sfida-sr16-200": (15.6, 137, "Monocilindrico 4T 174 cc", "Disco 220 mm", None),
    "voge-sfida-sr16": (11, 136, "Monocilindrico 4T 124,9 cc", "Disco 220 mm", None),
    "voge-sfida-sr2-adv": (16, 140, "Monocilindrico 4T 174 cc", "Disco 220 mm", None),
    "voge-sfida-sr3-2": (23, 155, "Monocilindrico 4T 244 cc", "Disco 260 mm", 770),
    "voge-sfida-sr4-max": (35, 205, "Monocilindrico 4T 350 cc", "Doppio disco 260 mm", None),
    "voge-sfida-sr450x": (42, 220, "Bicilindrico 4T 398 cc", "Doppio disco 260 mm", None),
    "voge-trofeo-300ac": (24.5, 159, "Monocilindrico 4T 292 cc", "Doppio disco 300 mm", None),
    "voge-trofeo-300acx-scrambler": (25, 150, "Monocilindrico 4T 292 cc", "Doppio disco 300 mm", None),
    "voge-trofeo-350ac": (31, 156, "Bicilindrico 4T 322 cc", "Doppio disco 298 mm", None),
    "voge-trofeo-500ac": (44.5, 185, "Bicilindrico 4T 471 cc", "Doppio disco 298 mm", None),
    "voge-trofeo-525acx": (44.5, 185, "Bicilindrico 4T 494 cc", "Doppio disco 298 mm", None),
    "voge-valico-300-rally": (25, 190, "Monocilindrico 4T 292 cc", "Disco 265 mm", None),
    "voge-valico-625dsx": (57, 206, "Bicilindrico 4T 581 cc", "Doppio disco 298 mm", None),
    "voge-valico-800rally": (81, 234, "Bicilindrico 4T 798 cc", "Doppio disco 310 mm", None),
    "voge-valico-900dsx": (95, 218, "Bicilindrico 4T 895 cc", "Doppio disco 305 mm", None),
    "voge-valico525dsx": (44.5, 194, "Bicilindrico 4T 494 cc", "Doppio disco 298 mm", None),
    "voge-xwolf-300": (21, 245, "Monocilindrico 4T 271 cc", "4 dischi CBS", 202),
    "voge-xwolf-550": (53, 348, "Monocilindrico 4T 500 cc", "4 dischi", 900),
}

PREZZI_EXTRA = {
    "voge-xwolf-300": 4990,
    # Voge Italy non pubblica il listino per l'XWolf 550: questo e' il prezzo
    # che indicano i concessionari italiani. Va confermato col distributore
    # prima di considerarlo definitivo.
    "voge-xwolf-550": 6990,
}

# Le potenze arrivate dal cliente, in cavalli.
POTENZE_VOGE = {
    "voge-sfida-sr1": 11.6,
    "voge-sfida-sr1-adv": 11.6,
    "voge-sfida-sr16": 11.6,
    "voge-sfida-sr16-125-air": 10.9,
    "voge-sfida-sr16-200": 17.0,
    "voge-sfida-sr2-adv": 17.0,
    "voge-sfida-sr3-2": 25.9,
    "voge-sfida-sr4-max": 34.0,
    "voge-sfida-sr450x": 42.2,
    "voge-valico-300-rally": 28.6,
    "voge-valico-800rally": 95.2,
}

# L'altezza sella dell'XWolf 300: la prima indicazione, 202 mm, era un
# refuso. Questa viene dal manuale del costruttore.
SELLE_EXTRA = {"voge-xwolf-300": 990}

sospetti = []


def accettabile(campo, valore):
    if campo not in PLAUSIBILE or not isinstance(valore, (int, float)):
        return True
    basso, alto = PLAUSIBILE[campo]
    return basso <= valore <= alto


def scrivi_spec(blocco, campo, valore, ident):
    """Mette un campo dentro specs, se non c'e' gia' e se e' plausibile."""
    if valore is None:
        return blocco, False
    if not accettabile(campo, valore):
        sospetti.append((ident, campo, valore))
        return blocco, False
    if re.search(r"\n      %s:" % campo, blocco):
        return blocco, False

    testo = "'%s'" % valore if isinstance(valore, str) else repr(valore)
    if "    specs: {}," in blocco:
        return blocco.replace("    specs: {},",
                              "    specs: {\n      %s: %s,\n    }," % (campo, testo), 1), True
    if "    specs: {\n" in blocco:
        return blocco.replace("    specs: {\n",
                              "    specs: {\n      %s: %s,\n" % (campo, testo), 1), True
    return blocco, False


def scrivi_prezzo(blocco, prezzo, ident):
    if prezzo is None or "\n    price:" in blocco:
        return blocco, False
    if not accettabile("price", prezzo):
        sospetti.append((ident, "price", prezzo))
        return blocco, False
    return blocco.replace("    colorways: [",
                          "    price: %d,\n    priceNote: '%s',\n    colorways: ["
                          % (prezzo, NOTA_PREZZO), 1), True


def main():
    p = argparse.ArgumentParser(description="Applica i dati del cliente.")
    p.add_argument("--prova", action="store_true")
    a = p.parse_args()

    s = io.open(CATALOGO, encoding="utf-8").read()
    pezzi = s.split("\n  {\n    id: '")
    toccati = 0

    for n in range(1, len(pezzi)):
        blocco = pezzi[n]
        ident = blocco.split("'")[0]
        cambiato = False

        if ident in COPPIE_MORINI:
            blocco, fatto = scrivi_spec(blocco, "torqueNm", COPPIE_MORINI[ident], ident)
            cambiato |= fatto

        if ident in SUZUKI:
            prezzo, cambio = SUZUKI[ident]
            blocco, fatto = scrivi_prezzo(blocco, prezzo, ident)
            cambiato |= fatto
            blocco, fatto = scrivi_spec(blocco, "transmission", cambio, ident)
            cambiato |= fatto

        if ident == "suzuki-rm-z450":
            for campo, valore in RMZ450.items():
                blocco, fatto = scrivi_spec(blocco, campo, valore, ident)
                cambiato |= fatto

        if ident in VOGE:
            coppia, peso, motore, freno, sella = VOGE[ident]
            for campo, valore in [("torqueNm", coppia), ("weightKg", peso),
                                  ("engineType", motore), ("frontBrakes", freno),
                                  ("seatHeightMm", sella)]:
                blocco, fatto = scrivi_spec(blocco, campo, valore, ident)
                cambiato |= fatto

        if ident in POTENZE_VOGE:
            blocco, fatto = scrivi_spec(blocco, "powerHp", POTENZE_VOGE[ident], ident)
            cambiato |= fatto

        if ident in SELLE_EXTRA:
            blocco, fatto = scrivi_spec(blocco, "seatHeightMm", SELLE_EXTRA[ident], ident)
            cambiato |= fatto

        if ident in PREZZI_EXTRA:
            blocco, fatto = scrivi_prezzo(blocco, PREZZI_EXTRA[ident], ident)
            cambiato |= fatto

        pezzi[n] = blocco
        if cambiato:
            toccati += 1

    if not a.prova:
        io.open(CATALOGO, "w", encoding="utf-8").write("\n  {\n    id: '".join(pezzi))

    print("%d modelli aggiornati." % toccati)
    if sospetti:
        print("\nNON scritti, perche' il numero non e' plausibile:")
        for ident, campo, valore in sospetti:
            print("  %-26s %-14s %s" % (ident, campo, valore))


if __name__ == "__main__":
    main()
