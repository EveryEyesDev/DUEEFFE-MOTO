#!/usr/bin/env python3
"""
Scrive l'elenco di tutto quello che manca al catalogo, da dare al salone.

A COSA SERVE
Le liste che c'erano prima erano due, divise per tipo: una per i dati e
una per le fotografie. Chi deve procurare il materiale pero' non ragiona
per tipo, ragiona per moto: apre la pagina di un modello e vuole sapere
che cosa serve per quella moto, tutto insieme. Questo file e' fatto cosi':
una voce per modello, e dentro il prezzo, i campi vuoti della scheda, la
fotografia su strada e le viste che mancano, livrea per livrea.

PERCHE' LE VISTE SI CONTANO PER LIVREA E NON PER MODELLO
Perche' e' cosi' che vanno chieste. Dire "alla GSX-8S mancano otto viste"
non serve a nessuno: le fotografie si fanno o si chiedono per un colore
preciso, e la stessa moto in due livree sono due servizi fotografici
diversi. Quindi ogni livrea ha la sua riga con il suo nome commerciale.

COSA VUOL DIRE "LIVREA N"
Che il nome commerciale di quel colore non lo abbiamo: la casa madre non
lo pubblica sulla pagina del modello. Non e' un dato mancante come gli
altri - se non esiste da nessuna parte in modo ufficiale, la livrea resta
senza nome, perche' inventarlo sarebbe peggio. E' segnalato lo stesso,
nel caso il salone ce l'abbia dal listino cartaceo.

COME SI USA
    python strumenti/da-reperire.py

SCRIVE
    DA-REPERIRE.md
"""

import importlib.util
import os
import re

CATALOGO = os.path.join("src", "data", "motorcycles.ts")
FOTO = os.path.join("public", "moto")
USCITA = "DA-REPERIRE.md"

# Il giro attorno alla moto, nell'ordine in cui lo mostriamo nelle schede.
VISTE = [
    ("fronte", "fronte"),
    ("angolo-destro", "tre quarti destro"),
    ("lato-destro", "profilo destro"),
    ("retro", "retro"),
    ("angolo-sinistro", "tre quarti sinistro"),
    ("lato-sinistro", "profilo sinistro"),
]

# I campi della scheda tecnica, con il nome che useremmo parlando.
CAMPI = [
    ("displacementCc", "cilindrata (cc)"),
    ("powerHp", "potenza (CV)"),
    ("torqueNm", "coppia (Nm)"),
    ("weightKg", "peso (kg)"),
    ("seatHeightMm", "altezza sella (mm)"),
    ("fuelCapacityL", "serbatoio (litri)"),
    ("engineType", "tipo di motore"),
    ("transmission", "cambio"),
    ("frontBrakes", "freno anteriore"),
]


def schede():
    """Legge il catalogo e torna una voce per moto."""
    testo = open(CATALOGO, encoding="utf-8").read()
    pezzi = testo.split("\n  {\n    id: '")
    for blocco in pezzi[1:]:
        ident = blocco.split("'")[0]
        def campo(nome):
            m = re.search(r"\n    %s: '([^']*)'" % nome, blocco)
            return m.group(1) if m else ""
        yield {
            "id": ident,
            "marca": campo("brand") or "?",
            "nome": campo("name") or ident,
            "usata": "condition: 'usato'" in blocco,
            "prezzo": bool(re.search(r"\n    price: \d", blocco)),
            "su_strada": "roadImage:" in blocco,
            "specs": blocco,
            "livree": re.findall(r"slug: '([^']+)',\n\s*name: '([^']*)'", blocco),
        }


def cartella_di(ident):
    for nome in (ident.replace("moto-morini-", ""), ident):
        percorso = os.path.join(FOTO, nome)
        if os.path.isdir(percorso):
            return percorso
    return None


def livree_svuotate():
    """
    Le livree a cui le viste sono state tolte apposta.

    Non sono mancanti per distrazione: mostravano una moto di un altro
    colore, e sono state tolte guardandole una per una. Vale la pena
    scriverlo nell'elenco, altrimenti chi lo legge va a cercare fotografie
    che il costruttore non ha mai pubblicato per quel colore.
    """
    percorso = os.path.join("strumenti", "livree-incoerenti.py")
    testo = open(percorso, encoding="utf-8").read()
    dentro = re.search(r"DA_TOGLIERE = \{(.*?)\}", testo, re.S)
    return set(re.findall(r'"([^"]+)"', dentro.group(1))) if dentro else set()


def giudice_ambientate():
    """Carica il controllo che distingue uno scatto di scena da uno di studio."""
    percorso = os.path.join("strumenti", "controlla-ambientate.py")
    specifica = importlib.util.spec_from_file_location("controlla_ambientate", percorso)
    modulo = importlib.util.module_from_spec(specifica)
    specifica.loader.exec_module(modulo)
    return modulo


def mancanti(blocco):
    vuoti = []
    for chiave, etichetta in CAMPI:
        if not re.search(r"\n      %s: " % chiave, blocco):
            vuoti.append(etichetta)
    return vuoti


def main():
    righe = ["# Che cosa serve per completare il catalogo", ""]
    righe += [
        "Una voce per moto, con tutto quello che manca per quella moto.",
        "Le fotografie vanno chieste per livrea, non per modello: la stessa",
        "moto in due colori sono due servizi diversi.",
        "",
        "Le viste sono scatti in studio su fondo chiaro, moto intera, ruote",
        "sulla stessa linea. La **fotografia su strada** invece e' quella che",
        "si vede nell'elenco: moto in un posto vero, non in studio.",
        "",
        "Dove c'e' scritto che la fotografia su strada **e' uno scatto da",
        "studio**, una fotografia c'e' gia' e il sito non ha buchi: e' solo",
        "che nell'elenco, in mezzo a moto fotografate per strada, si vede che",
        "stona. Sono quelle da sostituire se capita, senza fretta.",
        "",
        "Dove c'e' scritto **Livrea 1, 2, 3** vuol dire che il nome",
        "commerciale di quel colore non e' pubblicato dalla casa madre: se ce",
        "l'avete sul listino, scrivetelo e lo mettiamo.",
        "",
    ]

    per_marca = {}
    for moto in schede():
        if moto["usata"]:
            continue
        per_marca.setdefault(moto["marca"], []).append(moto)

    giudice = giudice_ambientate()
    svuotate = livree_svuotate()
    totali = {"strada": 0, "studio": 0, "viste": 0, "campi": 0, "prezzi": 0, "nomi": 0}

    for marca in sorted(per_marca):
        da_fare = []
        for moto in sorted(per_marca[marca], key=lambda m: m["nome"]):
            voci = []

            if not moto["prezzo"]:
                voci.append("- **Prezzo** — manca del tutto")
                totali["prezzi"] += 1

            vuoti = mancanti(moto["specs"])
            if vuoti:
                voci.append("- **Scheda tecnica** — manca: " + ", ".join(vuoti))
                totali["campi"] += len(vuoti)

            cartella = cartella_di(moto["id"])
            ambientata = os.path.join(cartella, "in-strada.webp") if cartella else ""
            if not moto["su_strada"] or not (ambientata and os.path.exists(ambientata)):
                voci.append("- **Fotografia su strada** — manca")
                totali["strada"] += 1
            else:
                motivi = giudice.esamina(ambientata)
                if motivi:
                    voci.append(
                        "- Fotografia su strada — ce n'e' una ma e' uno scatto da studio "
                        "(%s): da sostituire se ne trovate una vera" % motivi[0]
                    )
                    totali["studio"] += 1

            for slug, nome_livrea in moto["livree"]:
                senza_nome = re.match(r"^Livrea \d+$", nome_livrea or "")
                if senza_nome:
                    totali["nomi"] += 1
                assenti = []
                if cartella:
                    dove = os.path.join(cartella, slug)
                    for vista, etichetta in VISTE:
                        if not os.path.exists(os.path.join(dove, vista + ".webp")):
                            assenti.append(etichetta)
                if not assenti and not senza_nome:
                    continue
                etichetta = nome_livrea or slug
                parti = []
                if senza_nome:
                    parti.append("**serve il nome del colore**")
                if assenti:
                    totali["viste"] += len(assenti)
                    parti.append("mancano %d viste su 6: %s" % (len(assenti), ", ".join(assenti)))
                    if "%s/%s" % (os.path.basename(cartella or ""), slug) in svuotate:
                        parti.append(
                            "**le avevamo e le abbiamo tolte**: erano di un altro colore, "
                            "il costruttore per questa livrea non le pubblica"
                        )
                voci.append("- Livrea «%s» — %s" % (etichetta, "; ".join(parti)))

            if voci:
                da_fare.append((moto["nome"], voci))

        if not da_fare:
            continue
        righe.append("## %s" % marca)
        righe.append("")
        righe.append("%d modelli da completare su %d." % (len(da_fare), len(per_marca[marca])))
        righe.append("")
        for nome, voci in da_fare:
            righe.append("### %s" % nome)
            righe += voci
            righe.append("")

    righe += [
        "---",
        "",
        "## In due parole",
        "",
        "| Che cosa | Quante |",
        "|---|---|",
        "| Fotografie su strada mancanti | %d |" % totali["strada"],
        "| Fotografie su strada che sono scatti da studio | %d |" % totali["studio"],
        "| Viste di scheda mancanti | %d |" % totali["viste"],
        "| Nomi di colore da recuperare | %d |" % totali["nomi"],
        "| Campi di scheda tecnica vuoti | %d |" % totali["campi"],
        "| Prezzi mancanti | %d |" % totali["prezzi"],
        "",
    ]

    open(USCITA, "w", encoding="utf-8").write("\n".join(righe))
    print("Scritto %s" % USCITA)
    for chiave, valore in totali.items():
        print("  %-10s %d" % (chiave, valore))


if __name__ == "__main__":
    main()
