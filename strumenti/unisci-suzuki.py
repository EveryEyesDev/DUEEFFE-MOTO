#!/usr/bin/env python3
"""
Innesta nel catalogo le voci Suzuki generate dall'importatore.

A COSA SERVE
strumenti/importa-foto-suzuki.py scarica le fotografie e scrive il blocco
di dati in strumenti/suzuki-generato.ts.txt. Questo script lo infila in
src/data/motorcycles.ts, dentro MOTO_NUOVE, dopo i modelli Moto Morini.

COME SI USA
    python strumenti/unisci-suzuki.py

E' ripetibile: se le voci Suzuki ci sono gia' le sostituisce, cosi' si puo'
rilanciare l'importatore quando Suzuki aggiorna la gamma senza ritrovarsi
i modelli doppi.
"""

import io
import os
import sys

INIZIO = "  // ---- SUZUKI (generato, vedi strumenti/importa-foto-suzuki.py) ----"
FINE = "  // ---- fine SUZUKI ----"

ORIGINE = os.path.join("strumenti", "suzuki-generato.ts.txt")
CATALOGO = os.path.join("src", "data", "motorcycles.ts")


def main():
    if not os.path.isfile(ORIGINE):
        sys.exit("Manca %s: lancia prima strumenti/importa-foto-suzuki.py" % ORIGINE)

    generato = io.open(ORIGINE, encoding="utf-8").read()
    # Via l'intestazione di commento: nel catalogo ne mettiamo una nostra.
    voci = "\n".join(r for r in generato.splitlines() if not r.startswith("//")).strip("\n")

    blocco = "%s\n%s\n%s" % (INIZIO, voci, FINE)

    s = io.open(CATALOGO, encoding="utf-8").read()

    if INIZIO in s:
        testa, resto = s.split(INIZIO, 1)
        _, coda = resto.split(FINE, 1)
        s = testa + blocco + coda
        dove = "sostituito il blocco precedente"
    else:
        # In fondo a MOTO_NUOVE, cioe' prima della parentesi che lo chiude.
        apertura = s.index("export const MOTO_NUOVE: Motorcycle[] = [")
        chiusura = s.index("\n];", apertura)
        s = s[:chiusura] + "\n" + blocco + s[chiusura:]
        dove = "aggiunto in fondo a MOTO_NUOVE"

    io.open(CATALOGO, "w", encoding="utf-8").write(s)
    quanti = voci.count("\n    brand: 'Suzuki',")
    print("%d modelli Suzuki nel catalogo (%s)." % (quanti, dove))


if __name__ == "__main__":
    main()
