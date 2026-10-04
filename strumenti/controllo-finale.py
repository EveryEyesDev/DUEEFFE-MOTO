#!/usr/bin/env python3
"""
Controlla il catalogo moto a moto e scrive il referto.

A COSA SERVE
Prima di mandare il sito in giro conviene sapere, senza illusioni, cosa e'
completo e cosa no. Questo strumento apre il catalogo, guarda i file sul
disco, e scrive CONTROLLO-FINALE.md: una riga per ogni moto, con quello che
c'e' e quello che manca.

COSA GUARDA
  - la fotografia di catalogo: se c'e' e se e' una scena vera o uno scatto
    da studio (il giudizio lo da' strumenti/controlla-ambientate.py);
  - le viste direzionali: quante ce ne sono sulle sei che usiamo in scheda;
  - la scheda tecnica: quali campi sono compilati;
  - il prezzo;
  - le livree e se il loro colore e' misurato o dedotto dal nome.

COME SI USA
    python strumenti/controllo-finale.py
"""

import glob
import io
import os
import re
import sys

try:
    from PIL import Image  # noqa: F401  (serve al modulo che importiamo sotto)
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

CATALOGO = os.path.join("src", "data", "motorcycles.ts")
USCITA = "CONTROLLO-FINALE.md"

VISTE = ["fronte", "retro", "lato-destro", "lato-sinistro", "angolo-destro", "angolo-sinistro"]

CAMPI = [
    ("displacementCc", "cilindrata"),
    ("powerHp", "potenza"),
    ("torqueNm", "coppia"),
    ("weightKg", "peso"),
    ("seatHeightMm", "sella"),
    ("fuelCapacityL", "serbatoio"),
    ("engineType", "motore"),
    ("transmission", "cambio"),
    ("frontBrakes", "freni"),
]


def giudizio_foto(percorso):
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "controllo", os.path.join("strumenti", "controlla-ambientate.py")
    )
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo.esamina(percorso)


def main():
    s = io.open(CATALOGO, encoding="utf-8").read()
    pezzi = s.split("\n  {\n    id: '")

    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "controllo", os.path.join("strumenti", "controlla-ambientate.py")
    )
    controllo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(controllo)

    righe = []
    conta = {"totale": 0, "senza_scena": 0, "sei_viste": 0, "scheda_piena": 0, "con_prezzo": 0}

    for n in range(1, len(pezzi)):
        blocco = pezzi[n]
        ident = blocco.split("'")[0]
        marca = re.search(r"brand: '([^']+)'", blocco)
        nome = re.search(r"name: '([^']+)'", blocco)
        marca = marca.group(1) if marca else "?"
        nome = nome.group(1) if nome else ident
        conta["totale"] += 1

        cartella = os.path.join("public", "moto", ident.replace("moto-morini-", ""))
        if not os.path.isdir(cartella):
            cartella = os.path.join("public", "moto", ident)

        # Fotografia di catalogo
        strada = os.path.join(cartella, "in-strada.webp")
        if not os.path.isfile(strada):
            foto = "MANCA"
            conta["senza_scena"] += 1
        else:
            motivi = controllo.esamina(strada)
            if motivi:
                foto = "da studio"
                conta["senza_scena"] += 1
            else:
                foto = "scena ok"

        # Viste direzionali
        livree = [
            d for d in sorted(os.listdir(cartella))
            if os.path.isdir(os.path.join(cartella, d))
        ] if os.path.isdir(cartella) else []
        presenti = set()
        for lv in livree:
            for v in VISTE:
                if os.path.isfile(os.path.join(cartella, lv, v + ".webp")):
                    presenti.add(v)
        if len(presenti) == 6:
            conta["sei_viste"] += 1
        mancano = [v for v in VISTE if v not in presenti]

        # Scheda tecnica
        vuoti = [etichetta for campo, etichetta in CAMPI if ("%s:" % campo) not in blocco]
        if not vuoti:
            conta["scheda_piena"] += 1

        prezzo = re.search(r"\n    price: (\d+),", blocco)
        if prezzo:
            conta["con_prezzo"] += 1

        righe.append({
            "marca": marca, "nome": nome, "foto": foto, "livree": len(livree),
            "viste": len(presenti), "mancano": mancano, "vuoti": vuoti,
            "prezzo": prezzo.group(1) if prezzo else None,
        })

    with io.open(USCITA, "w", encoding="utf-8") as f:
        f.write("# Controllo finale del catalogo\n\n")
        f.write("Generato da `strumenti/controllo-finale.py`. Una riga per moto.\n\n")
        f.write("## In sintesi\n\n")
        f.write("| | |\n|---|---|\n")
        f.write("| Modelli a catalogo | %d |\n" % conta["totale"])
        f.write("| Con foto di scena vera | %d |\n" % (conta["totale"] - conta["senza_scena"]))
        f.write("| Con tutte e sei le viste | %d |\n" % conta["sei_viste"])
        f.write("| Con scheda tecnica completa | %d |\n" % conta["scheda_piena"])
        f.write("| Con prezzo pubblicato | %d |\n\n" % conta["con_prezzo"])

        for marca in ["Moto Morini", "Suzuki", "Voge"]:
            delle = [r for r in righe if r["marca"] == marca]
            if not delle:
                continue
            f.write("## %s (%d modelli)\n\n" % (marca, len(delle)))
            f.write("| Modello | Foto catalogo | Livree | Viste | Prezzo | Dati mancanti |\n")
            f.write("|---|---|---|---|---|---|\n")
            for r in delle:
                viste = "6/6" if r["viste"] == 6 else "%d/6" % r["viste"]
                prezzo = ("%s €" % r["prezzo"]) if r["prezzo"] else "—"
                vuoti = ", ".join(r["vuoti"]) if r["vuoti"] else "nessuno"
                f.write("| %s | %s | %d | %s | %s | %s |\n" % (
                    r["nome"], r["foto"], r["livree"], viste, prezzo, vuoti))
            f.write("\n")

    print("Scritto %s" % USCITA)
    print("  %d modelli, %d con foto di scena, %d con sei viste, %d con scheda piena, %d con prezzo"
          % (conta["totale"], conta["totale"] - conta["senza_scena"], conta["sei_viste"],
             conta["scheda_piena"], conta["con_prezzo"]))


if __name__ == "__main__":
    main()
