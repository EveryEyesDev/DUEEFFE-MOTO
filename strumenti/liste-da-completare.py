#!/usr/bin/env python3
"""
Scrive le due liste da mandare al cliente: dati mancanti e foto mancanti.

A COSA SERVE
Il controllo finale dice com'e' messo il catalogo. Queste due liste
servono invece a farlo completare: una la compila il cliente con i dati
che mancano, l'altra gli dice quali fotografie servono e come vanno
fatte.

COME SI USA
    python strumenti/liste-da-completare.py

SCRIVE
    DA-COMPLETARE-DATI.md   una riga per moto, con le caselle da riempire
    DA-COMPLETARE-FOTO.md   quali scatti mancano, modello per modello
"""

import io
import os
import re
import sys

try:
    from PIL import Image  # noqa: F401
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

CATALOGO = os.path.join("src", "data", "motorcycles.ts")

VISTE = [
    ("lato-destro", "profilo destro"),
    ("lato-sinistro", "profilo sinistro"),
    ("fronte", "fronte"),
    ("retro", "retro"),
    ("angolo-destro", "tre quarti destro"),
    ("angolo-sinistro", "tre quarti sinistro"),
]

CAMPI = [
    ("price", "prezzo"),
    ("displacementCc", "cilindrata"),
    ("powerHp", "potenza"),
    ("torqueNm", "coppia"),
    ("weightKg", "peso"),
    ("seatHeightMm", "altezza sella"),
    ("fuelCapacityL", "serbatoio"),
    ("engineType", "tipo motore"),
    ("transmission", "cambio"),
    ("frontBrakes", "freno anteriore"),
]


def cartella_di(ident):
    for nome in (ident.replace("moto-morini-", ""), ident):
        percorso = os.path.join("public", "moto", nome)
        if os.path.isdir(percorso):
            return percorso
    return None


def main():
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "controllo", os.path.join("strumenti", "controlla-ambientate.py")
    )
    controllo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(controllo)

    s = io.open(CATALOGO, encoding="utf-8").read()
    pezzi = s.split("\n  {\n    id: '")

    moto = []
    for n in range(1, len(pezzi)):
        blocco = pezzi[n]
        ident = blocco.split("'")[0]
        marca = re.search(r"brand: '([^']+)'", blocco)
        nome = re.search(r"\n    name: '([^']+)'", blocco)
        marca = marca.group(1) if marca else "?"
        nome = nome.group(1) if nome else ident

        cartella = cartella_di(ident)
        livree = []
        presenti = set()
        if cartella:
            livree = [d for d in sorted(os.listdir(cartella))
                      if os.path.isdir(os.path.join(cartella, d))]
            for lv in livree:
                for vista, _ in VISTE:
                    if os.path.isfile(os.path.join(cartella, lv, vista + ".webp")):
                        presenti.add(vista)

        strada = os.path.join(cartella, "in-strada.webp") if cartella else None
        if not strada or not os.path.isfile(strada):
            stato_strada = "manca del tutto"
        else:
            motivi = controllo.esamina(strada)
            stato_strada = "ok" if not motivi else "da rifare: " + motivi[0].split(" (")[0]

        mancano_dati = []
        for campo, etichetta in CAMPI:
            if ("\n    %s:" % campo) not in blocco and ("\n      %s:" % campo) not in blocco:
                mancano_dati.append(etichetta)

        # Livree senza nome commerciale: quelle che abbiamo battezzato noi.
        nomi_livree = re.findall(r"\n        name: '([^']+)',", blocco)
        da_battezzare = [x for x in nomi_livree
                         if re.fullmatch(r"(Nero|Bianco|Grigio|Argento|Rosso|Blu|Azzurro|Verde|"
                                         r"Giallo|Arancione|Oro|Bronzo|Sabbia|Viola|Rosa|"
                                         r"Livrea ufficiale)", x)]

        moto.append({
            "marca": marca, "nome": nome, "id": ident,
            "strada": stato_strada,
            "mancano_viste": [e for v, e in VISTE if v not in presenti],
            "mancano_dati": mancano_dati,
            "livree": len(livree),
            "da_battezzare": da_battezzare,
        })

    marche = ["Moto Morini", "Suzuki", "Voge"]

    # ------------------------------------------------------------- i dati
    with io.open("DA-COMPLETARE-DATI.md", "w", encoding="utf-8") as f:
        f.write("# Dati da completare\n\n")
        f.write("Una riga per moto. Riempi solo le caselle vuote: dove c'e' scritto\n")
        f.write("qualcosa il dato ce l'ho gia' e non serve toccarlo.\n\n")
        f.write("Se di un dato non disponi, lascia vuoto: in pagina compare\n")
        f.write("«In arrivo» e l'invito a chiamare, mai un numero inventato.\n\n")

        for marca in marche:
            delle = [m for m in moto if m["marca"] == marca]
            incomplete = [m for m in delle if m["mancano_dati"]]
            f.write("## %s — %d modelli, %d da completare\n\n" % (
                marca, len(delle), len(incomplete)))
            if not incomplete:
                f.write("Nessuno: le schede sono complete.\n\n")
                continue
            f.write("| Modello | Cosa manca |\n|---|---|\n")
            for m in incomplete:
                f.write("| **%s** | %s |\n" % (m["nome"], ", ".join(m["mancano_dati"])))
            f.write("\n")

        # I nomi delle livree
        f.write("## Nomi commerciali dei colori\n\n")
        f.write("Per questi modelli il costruttore non pubblica il nome del colore in\n")
        f.write("una forma che io possa leggere, quindi l'ho chiamato col colore che\n")
        f.write("si vede («Nero», «Blu»). Se mi dai i nomi veri li metto.\n\n")
        f.write("| Modello | Livree | Come le chiamo adesso |\n|---|---|---|\n")
        for m in moto:
            if m["da_battezzare"]:
                f.write("| %s %s | %d | %s |\n" % (
                    m["marca"], m["nome"], m["livree"], ", ".join(m["da_battezzare"])))
        f.write("\n")

    # ------------------------------------------------------------ le foto
    with io.open("DA-COMPLETARE-FOTO.md", "w", encoding="utf-8") as f:
        f.write("# Fotografie che servono\n\n")
        f.write("## Come vanno fatte\n\n")
        f.write("**Le viste in studio** (quelle che si vedono aprendo una moto):\n")
        f.write("moto ferma su fondo chiaro e uniforme, luce diffusa, macchina\n")
        f.write("all'altezza del serbatoio, moto intera nell'inquadratura con un po'\n")
        f.write("di margine attorno. Servono sei scatti: profilo destro, profilo\n")
        f.write("sinistro, fronte, retro e le due tre quarti anteriori. Lo sfondo lo\n")
        f.write("tolgo io.\n\n")
        f.write("**La fotografia di scena** (quella del catalogo): la moto in strada,\n")
        f.write("in citta' o davanti al salone, orizzontale, con l'ambiente attorno.\n")
        f.write("E' quella che fa venire voglia di aprire la scheda, quindi meglio una\n")
        f.write("foto viva che una perfetta.\n\n")

        for marca in marche:
            delle = [m for m in moto if m["marca"] == marca]
            da_fare = [m for m in delle if m["strada"] != "ok" or m["mancano_viste"]]
            f.write("## %s — %d modelli, %d da sistemare\n\n" % (
                marca, len(delle), len(da_fare)))
            if not da_fare:
                f.write("Nessuno: le fotografie ci sono tutte.\n\n")
                continue
            f.write("| Modello | Foto di scena | Viste in studio che mancano |\n|---|---|---|\n")
            for m in da_fare:
                strada = "**serve**" if m["strada"] != "ok" else "c'e'"
                if m["strada"].startswith("da rifare"):
                    strada = "**serve** (ora c'e' uno scatto da studio)"
                viste = ", ".join(m["mancano_viste"]) if m["mancano_viste"] else "nessuna"
                f.write("| **%s** | %s | %s |\n" % (m["nome"], strada, viste))
            f.write("\n")

        f.write("## Una precisazione onesta\n\n")
        f.write("Per Voge le sei viste non esistono alla fonte: il distributore\n")
        f.write("pubblica una o due fotografie per modello e basta, non c'e' il giro\n")
        f.write("a 360 gradi come per Suzuki. Quindi quelle righe non sono una mia\n")
        f.write("dimenticanza: o le fate voi, o restano due.\n")

    print("Scritti DA-COMPLETARE-DATI.md e DA-COMPLETARE-FOTO.md")
    for marca in marche:
        delle = [m for m in moto if m["marca"] == marca]
        print("  %-14s %2d modelli | %2d senza dati completi | %2d con foto da sistemare" % (
            marca, len(delle),
            sum(1 for m in delle if m["mancano_dati"]),
            sum(1 for m in delle if m["strada"] != "ok" or m["mancano_viste"])))


if __name__ == "__main__":
    main()
