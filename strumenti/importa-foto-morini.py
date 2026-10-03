#!/usr/bin/env python3
"""
Importa le fotografie ufficiali Moto Morini dal sito del costruttore.

A COSA SERVE
Scarica da motomorini.com le immagini di prodotto dei modelli che trattiamo,
le converte in WebP, le ridimensiona per il web e le salva gia' ordinate
nelle cartelle del sito.

COME SI USA
    python strumenti/importa-foto-morini.py                 tutti i modelli
    python strumenti/importa-foto-morini.py x-cape-700      un modello solo
    python strumenti/importa-foto-morini.py --elenca        mostra cosa troverebbe, senza scaricare

OPZIONI
    --larghezza 1600    larghezza massima delle immagini salvate
    --qualita 85        qualita' WebP, da 1 a 100
    --min-lato 500      scarta le immagini piu' piccole di cosi' (icone, loghi)

COME DISTINGUE LE FOTO DELLE MOTO DAL RESTO
Le pagine del sito contengono anche logo, bandiere, icone e banner, uguali su
ogni pagina. Lo script scarica prima una pagina di servizio come riferimento,
raccoglie le immagini che compaiono li' e le esclude ovunque: quello che resta
e' il materiale specifico del modello. In piu' scarta tutto cio' che e' troppo
piccolo per essere una fotografia di prodotto.

I NOMI DELLE VISTE
Lo script non sa da solo se una foto e' il frontale o il profilo destro, quindi
salva come vista-01.webp, vista-02.webp e cosi' via, in ordine di comparsa
sulla pagina. I nomi definitivi (front, back, left, right, angle-left,
angle-right) si assegnano guardando le immagini, con --rinomina.

DIRITTI
Sono immagini ufficiali del costruttore. Un concessionario ufficiale puo'
normalmente usarle per promuovere i modelli che vende, ma la conferma va
chiesta al proprio referente di zona: questo script non da' alcuna licenza.
"""

import argparse
import io as _io
import os
import re
import shutil
import subprocess
import sys
import time

try:
    from PIL import Image
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

BASE = "https://www.motomorini.com"

# Pagina senza moto, usata per riconoscere il materiale comune a tutto il sito.
PAGINA_RIFERIMENTO = "/about"

INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
    "Referer": BASE + "/",
}

# Modelli trattati in concessionaria, con la pagina ufficiale corrispondente.
# I percorsi sono stati ricavati dall'elenco dei modelli pubblicato sulla home
# del sito ufficiale, non inventati.
MODELLI = {
    "x-cape-700": {"nome": "X-Cape 700", "pagina": "/xcape_700"},
    "x-cape-1200": {"nome": "X-Cape 1200", "pagina": "/xcape_1200"},
    "alltrhike-450": {"nome": "Alltrhike 450", "pagina": "/alltrhike_450"},
    "seiemmezzo-str": {"nome": "Seiemmezzo STR", "pagina": "/str_trolley"},
    "calibro-custom": {"nome": "Calibro Custom", "pagina": "/bobber_calibro"},
    "calibro-bagger": {"nome": "Calibro Bagger", "pagina": "/bobber_bagger"},
}

DESTINAZIONE = os.path.join("public", "moto")

# Le sei viste che vorremmo, nell'ordine in cui si assegnano con --rinomina.
VISTE = ["front", "back", "left", "right", "angle-left", "angle-right"]


CURL = shutil.which("curl")


def scarica(url: str, tentativi: int = 3) -> bytes:
    """
    Scarica un indirizzo, riprovando se la rete fa i capricci.

    Usiamo curl invece delle librerie di Python perche' il certificato del
    sito Moto Morini ha una catena che Python rifiuta ("Basic Constraints of
    CA cert not marked critical"), mentre curl, che si appoggia al deposito
    certificati del sistema, lo accetta senza problemi.
    """
    if CURL is None:
        raise RuntimeError("curl non e' installato: serve per scaricare da questo sito")

    comando = [CURL, "-sL", "--max-time", "45", "--fail"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", f"{chiave}: {valore}"]
    comando.append(url)

    ultimo = None
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        ultimo = f"curl uscito con {esito.returncode}"
        time.sleep(1.5 * (n + 1))
    raise RuntimeError(f"non scaricato dopo {tentativi} tentativi: {url} ({ultimo})")


def immagini_nella_pagina(html: str) -> list[str]:
    """Tutti i percorsi /data/image/... citati nella pagina, nell'ordine."""
    trovati = re.findall(r"/data/image/[0-9]{4}/[0-9]{2}/[0-9]{2}/[A-Za-z0-9_.-]+", html)
    # JSON incorporato: le barre arrivano con la barra rovescia davanti
    trovati += [
        p.replace("\\/", "/")
        for p in re.findall(r"\\/data\\/image\\/[0-9]{4}\\/[0-9]{2}\\/[0-9]{2}\\/[A-Za-z0-9_.-]+", html)
    ]
    ordinati = []
    for p in trovati:
        p = p.split("?")[0]
        if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")) and p not in ordinati:
            ordinati.append(p)
    return ordinati


def materiale_comune() -> set[str]:
    """Immagini presenti anche su una pagina senza moto: logo, icone, banner."""
    try:
        html = scarica(BASE + PAGINA_RIFERIMENTO).decode("utf-8", "replace")
        return set(immagini_nella_pagina(html))
    except RuntimeError as e:
        print(f"  avviso: pagina di riferimento non raggiunta ({e}); filtro solo per dimensione")
        return set()


def salva_webp(dati: bytes, destinazione: str, larghezza: int, qualita: int, min_lato: int):
    """Converte in WebP e ridimensiona. Torna (larghezza, altezza) oppure None se scartata."""
    try:
        im = Image.open(_io.BytesIO(dati))
        im.load()
    except Exception:
        return None

    if min(im.size) < min_lato:
        return None

    # Le PNG del sito hanno spesso la trasparenza: la teniamo.
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")

    w, h = im.size
    if w > larghezza:
        im = im.resize((larghezza, round(h * larghezza / w)), Image.LANCZOS)

    im.save(destinazione, "WEBP", quality=qualita, method=6)
    return im.size


def importa(slug: str, larghezza: int, qualita: int, min_lato: int, comuni: set[str], solo_elenco: bool):
    info = MODELLI[slug]
    print(f"\n{info['nome']}  ({BASE}{info['pagina']})")

    try:
        html = scarica(BASE + info["pagina"]).decode("utf-8", "replace")
    except RuntimeError as e:
        print(f"  pagina non raggiunta: {e}")
        return 0

    candidate = [p for p in immagini_nella_pagina(html) if p not in comuni]
    if not candidate:
        print("  nessuna immagine specifica trovata")
        return 0

    if solo_elenco:
        for p in candidate:
            print(f"  {BASE}{p}")
        return len(candidate)

    cartella = os.path.join(DESTINAZIONE, slug)
    os.makedirs(cartella, exist_ok=True)
    for vecchio in os.listdir(cartella):
        if vecchio.lower().endswith(".webp"):
            os.remove(os.path.join(cartella, vecchio))

    salvate = 0
    for percorso in candidate:
        try:
            dati = scarica(BASE + percorso)
        except RuntimeError as e:
            print(f"  salto {percorso}: {e}")
            continue

        nome = f"vista-{salvate + 1:02d}.webp"
        esito = salva_webp(dati, os.path.join(cartella, nome), larghezza, qualita, min_lato)
        if esito is None:
            continue

        salvate += 1
        peso = os.path.getsize(os.path.join(cartella, nome)) // 1024
        print(f"  {nome}  {esito[0]}x{esito[1]}  {peso} KB   <- {percorso}")

    if salvate == 0:
        try:
            os.rmdir(cartella)
        except OSError:
            pass
        print("  nessuna immagine abbastanza grande da tenere")

    return salvate


def rinomina(slug: str, viste: list[str]):
    """Assegna i nomi definitivi delle viste alle immagini gia' scaricate."""
    cartella = os.path.join(DESTINAZIONE, slug)
    presenti = sorted(f for f in os.listdir(cartella) if re.fullmatch(r"vista-\d+\.webp", f))
    if len(viste) > len(presenti):
        sys.exit(f"{slug}: hai indicato {len(viste)} viste ma ci sono {len(presenti)} immagini")
    for file, vista in zip(presenti, viste):
        if vista in ("-", "scarta"):
            os.remove(os.path.join(cartella, file))
            print(f"  tolta  {file}")
            continue
        os.replace(os.path.join(cartella, file), os.path.join(cartella, f"{vista}.webp"))
        print(f"  {file} -> {vista}.webp")


def main():
    p = argparse.ArgumentParser(
        description="Importa le fotografie ufficiali Moto Morini.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("modelli", nargs="*", help=f"uno o piu' fra: {', '.join(MODELLI)}")
    p.add_argument("--elenca", action="store_true", help="mostra gli indirizzi senza scaricare")
    p.add_argument("--rinomina", nargs="+", metavar="VISTA",
                   help="assegna i nomi delle viste a un modello gia' scaricato, nell'ordine; "
                        "usa - per scartare un'immagine")
    p.add_argument("--larghezza", type=int, default=1600)
    p.add_argument("--qualita", type=int, default=85)
    p.add_argument("--min-lato", type=int, default=500)
    a = p.parse_args()

    scelti = a.modelli or list(MODELLI)
    sconosciuti = [m for m in scelti if m not in MODELLI]
    if sconosciuti:
        sys.exit(f"modello non riconosciuto: {', '.join(sconosciuti)}\nvalidi: {', '.join(MODELLI)}")

    if a.rinomina:
        if len(scelti) != 1:
            sys.exit("--rinomina vuole un modello solo")
        rinomina(scelti[0], a.rinomina)
        return

    print(f"Viste desiderate: {', '.join(VISTE)}")
    comuni = set() if a.elenca else materiale_comune()
    if comuni:
        print(f"Materiale comune a tutto il sito da ignorare: {len(comuni)} immagini")

    totale = 0
    for slug in scelti:
        totale += importa(slug, a.larghezza, a.qualita, a.min_lato, comuni, a.elenca)

    print(f"\nTotale: {totale} immagini.")
    if not a.elenca and totale:
        print("Ora guarda le immagini e assegna le viste, per esempio:")
        print("  python strumenti/importa-foto-morini.py x-cape-700 --rinomina "
              "angle-right left front - back right")


if __name__ == "__main__":
    main()
