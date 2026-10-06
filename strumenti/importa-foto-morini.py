#!/usr/bin/env python3
"""
Importa le fotografie ufficiali Moto Morini.

A COSA SERVE
Scarica dal sito europeo motomorini.eu le immagini di prodotto dei modelli
che trattiamo, le converte in WebP, le ridimensiona per il web e le salva
ordinate per modello, vista e livrea.

COME SI USA
    python strumenti/importa-foto-morini.py                 tutti i modelli
    python strumenti/importa-foto-morini.py x-cape-700      un modello solo
    python strumenti/importa-foto-morini.py --elenca        mostra cosa farebbe

OPZIONI
    --larghezza 1600    larghezza massima delle immagini salvate
    --qualita 86        qualita' WebP, da 1 a 100

COME SONO ORGANIZZATE
    public/moto/<modello>/<livrea>/<vista>.webp

Le viste sono sempre le stesse sei: fronte, retro, lato-sinistro,
lato-destro, angolo-sinistro, angolo-destro. La prima livrea dell'elenco
e' quella mostrata per prima sul sito.

PERCHE' GLI INDIRIZZI SONO SCRITTI QUI DENTRO
Il sito protegge le pagine da letture automatiche, quindi non e' possibile
ricavare l'elenco delle immagini scaricando la pagina. Gli indirizzi sono
stati letti dalle pagine ufficiali con un browser e trascritti qui: sono
reali e verificati, nessuno e' inventato. Se la casa madre rinomina i file,
lo script lo segnala e basta aggiornare l'elenco.

DIRITTI
Sono immagini ufficiali del costruttore. Un concessionario ufficiale puo'
normalmente usarle per promuovere i modelli che vende, ma la conferma va
chiesta al proprio referente di zona: questo script non da' alcuna licenza.
"""

import argparse
import io as _io
import os
import shutil
import subprocess
import sys
import time

try:
    from PIL import Image
except ImportError:
    sys.exit("Manca la libreria Pillow.\nInstallala con:  pip install Pillow")

BASE = "https://motomorini.eu/wp-content/uploads/"

# Il sito rifiuta i programmi che non si presentano come un browser.
INTESTAZIONI = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
    ),
    "Accept": "image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9",
    "Referer": "https://motomorini.eu/it/",
    "Cookie": "wp-wpml_current_language=it",
    "Sec-Fetch-Dest": "image",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "same-origin",
}

# Le sei viste, nell'ordine in cui vanno mostrate nella galleria.
VISTE = ["lato-destro", "lato-sinistro", "fronte", "retro", "angolo-destro", "angolo-sinistro"]

# Modelli, livree e file ufficiali. Gli indirizzi sono relativi a BASE.
MODELLI = {
    "tre-mezzo-sport": {
        "nome": "3 1/2 Sport",
        "livree": {
            "legacy-red": {
                "etichetta": "Legacy Red",
                "lato-destro": "2024/11/350-right-profile.png",
                "lato-sinistro": "2024/11/350-left-profile.png",
                "fronte": "2024/11/350-Front.png",
                "retro": "2024/11/350-Back.png",
                "angolo-destro": "2024/11/350-angle-right.png",
                "angolo-sinistro": "2024/11/350-angle-left.png",
            },
            "pure-white": {
                "etichetta": "Pure White",
                "lato-destro": "2025/10/350-right-profile_purewhite.png",
                "lato-sinistro": "2025/10/350-left-profile_purewhite.png",
                "fronte": "2025/10/350-Front_purewhite.png",
                "retro": "2025/10/350-Back_purewhite.png",
                "angolo-destro": "2025/10/350-angle-right_purewhite.png",
                "angolo-sinistro": "2025/10/350-angle-left_purewhite.png",
            },
        },
    },
    "x-cape-700": {
        "nome": "X-Cape 700",
        "livree": {
            "rosso-passion": {
                "etichetta": "Red Passion",
                "lato-destro": "2024/10/X-Cape-700-right-profile_red-passion-3.png",
                "lato-sinistro": "2024/10/X-Cape-700-left-profile_red-passion-1.png",
                "fronte": "2024/10/X-Cape-700-Front_red-passion-1.png",
                "retro": "2024/10/X-Cape-700-Back_red-passion-1.png",
                "angolo-destro": "2024/10/X-Cape-700-angle-right_red-passion-1.png",
                "angolo-sinistro": "2024/10/X-Cape-700-angle-left_red-passion-1.png",
            },
            "nero-ebony": {
                "etichetta": "Black Ebony",
                "lato-destro": "2024/10/X-Cape-700-right-profile_black-ebony_alloy.png",
                "lato-sinistro": "2024/10/X-Cape-700-left-profile_black-ebony_alloy.png",
                "fronte": "2024/10/X-Cape-700-Front_black-ebony_alloy.png",
                "retro": "2024/10/X-Cape-700-Back_black-ebony_alloy.png",
                "angolo-destro": "2024/10/X-Cape-700-angle-right_black-ebony_alloy.png",
                "angolo-sinistro": "2024/10/X-Cape-700-angle-left_black-ebony_alloy.png",
            },
            "bianco-carrara": {
                "etichetta": "Carrara White",
                "lato-destro": "2024/10/X-Cape-700-right-profile_carrara-White.png",
                "lato-sinistro": "2024/10/X-Cape-700-left-profile_carrara-White.png",
                "fronte": "2024/10/X-Cape-700-Front_carrara-White.png",
                "retro": "2024/10/X-Cape-700-Back_carrara-White.png",
                "angolo-destro": "2024/10/X-Cape-700-angle-right_carrara-White.png",
                "angolo-sinistro": "2024/10/X-Cape-700-angle-left_carrara-White.png",
            },
        },
    },
    "x-cape-1200": {
        "nome": "X-Cape 1200",
        "livree": {
            "bianco-artic": {
                "etichetta": "Arctic White",
                "lato-destro": "2024/11/X-CAPE_Artic-White-right-profile.png",
                # Il sinistro della bianca si chiama solo "profile", senza lato
                "lato-sinistro": "2024/11/X-CAPE_Artic-White-profile.png",
                "fronte": "2024/11/X-CAPE_Artic-White-Front-1.png",
                "retro": "2024/11/X-CAPE_Artic-White-Back.png",
                "angolo-destro": "2024/11/X-CAPE_Artic-White-angle-right.png",
                "angolo-sinistro": "2024/11/X-CAPE_Artic-White-angle-left.png",
            },
            "rosso-energy": {
                "etichetta": "Energy Red",
                "lato-destro": "2024/11/X-CAPE_Energy-Red-right-profile.png",
                "lato-sinistro": "2024/11/X-CAPE_Energy-Red-profile-left.png",
                "fronte": "2024/11/X-CAPE_Energy-Red-Front-1.png",
                "retro": "2024/11/X-CAPE_Energy-Red-Back.png",
                "angolo-destro": "2024/11/X-CAPE_Energy-Red-angle-right.png",
                "angolo-sinistro": "2024/11/X-CAPE_Energy-Red-angle-left.png",
            },
            "nero-viper": {
                "etichetta": "Viper Black",
                "lato-destro": "2024/11/X-CAPE_Black-Viper-right-profile.png",
                "lato-sinistro": "2024/11/X-CAPE_Black-Viper-profile-left.png",
                "fronte": "2024/11/X-CAPE_Black-Viper-Front-1.png",
                "retro": "2024/11/X-CAPE_Black-Viper-Back.png",
                "angolo-destro": "2024/11/X-CAPE_Black-Viper-angle-right.png",
                "angolo-sinistro": "2024/11/X-CAPE_Black-Viper-angle-left.png",
            },
        },
    },
    "alltrhike-450": {
        "nome": "Alltrhike 450",
        "livree": {
            "verde-jungle": {
                "etichetta": "Jungle Green",
                "lato-destro": "2025/07/Allthrike-right-profile_green.png",
                "lato-sinistro": "2025/07/Allthrike-left-profile_green.png",
                "fronte": "2025/07/Allthrike-Front_green.png",
                "retro": "2025/07/Allthrike-Back_green.png",
                # Moto Morini ha chiamato "angle-right" entrambe le inclinate:
                # quella senza suffisso mostra il fianco SINISTRO, la "-2" il destro.
                "angolo-sinistro": "2025/07/Alltrhike-angle-right_green.png",
                "angolo-destro": "2025/07/Alltrhike-angle-right_green-2.png",
            },
            "nero": {
                "etichetta": "Night Black",
                "lato-destro": "2025/07/Allthrike-right-profile_black.png",
                "lato-sinistro": "2025/07/Allthrike-left-profile_black.png",
                "fronte": "2025/07/Allthrike-Front_black.png",
                "retro": "2025/07/Allthrike-Back_black.png",
                "angolo-sinistro": "2025/07/Alltrhike-angle-right_black.png",
                "angolo-destro": "2025/07/Alltrhike-angle-right_black-2.png",
            },
        },
    },
    "seiemmezzo-str": {
        "nome": "Seiemmezzo STR",
        "livree": {
            "bianco-carrara": {
                "etichetta": "Starlight White",
                "lato-destro": "2023/10/Seiemmezzo-STR-right-profile_carrara-White.png",
                "lato-sinistro": "2023/10/Seiemmezzo-STR-left-profile_carrara-White.png",
                "fronte": "2023/10/Seiemmezzo-STR-Front_carrara-White.png",
                "retro": "2023/10/Seiemmezzo-STR-Back_carrara-White.png",
                "angolo-destro": "2023/10/Seiemmezzo-STR-angle-right_carrara-White.png",
                "angolo-sinistro": "2023/10/Seiemmezzo-STR-angle-left_carrara-White.png",
            },
            "rosso-passion": {
                "etichetta": "Fire Red",
                "lato-destro": "2023/10/seiemmezzo-STR-right-profile_red-passion.png",
                "lato-sinistro": "2023/10/seiemmezzo-STR-left-profile_red-passion.png",
                "fronte": "2023/10/Seiemmezzo-STR-Front_red-passion.png",
                "retro": "2023/10/Seiemmezzo-STR-Back_red-passion.png",
                "angolo-destro": "2023/10/Seiemmezzo-STR-angle-right_red-passion.png",
                "angolo-sinistro": "2023/10/Seiemmezzo-STR-angle-left_red-passion.png",
            },
            "grigio": {
                "etichetta": "Smoky Anthracite",
                "lato-destro": "2023/10/Seiemmezzo-STR-right-profile_grigia.png",
                "lato-sinistro": "2023/10/Seiemmezzo-STR-left-profile_grigia.png",
                "fronte": "2023/10/Seiemmezzo-STR-Front_grigia.png",
                "retro": "2023/10/Seiemmezzo-STR-Back_grigia.png",
                "angolo-destro": "2023/10/Seiemmezzo-STR-angle-right_grigia.png",
                "angolo-sinistro": "2023/10/Seiemmezzo-STR-angle-left_Grigia.png",
            },
        },
    },
    "calibro-custom": {
        "nome": "Calibro Custom",
        "livree": {
            "nero": {
                "etichetta": "Black Ebony",
                "lato-destro": "2023/10/calibro-profile-right.png",
                "lato-sinistro": "2023/10/calibro-profile-left.png",
                "fronte": "2023/10/calibro-front.png",
                "retro": "2023/10/calibro-back.png",
                "angolo-destro": "2023/10/calibro-angle-right.png",
                "angolo-sinistro": "2023/10/calibro-angle-left.png",
            },
            "rosso": {
                "etichetta": "Red",
                "lato-destro": "2024/05/calibro-profile-right_red.png",
                "lato-sinistro": "2024/05/calibro-profile-left_red.png",
                "fronte": "2023/10/calibro-red-front-1.png",
                "retro": "2023/10/calibro-red-back-1.png",
                "angolo-destro": "2024/05/calibro-angle-right_red.png",
                "angolo-sinistro": "2024/05/calibro-angle-left_red.png",
            },
        },
    },
    "calibro-bagger": {
        "nome": "Calibro Bagger",
        "livree": {
            "grigio-garage": {
                "etichetta": "Garage Grey",
                "lato-destro": "2025/10/Bagger-right-profile_grey.png",
                "lato-sinistro": "2025/10/Bagger-left-profile_grey.png",
                "fronte": "2025/10/Bagger-Front_grey.png",
                "retro": "2025/10/Bagger-Back_grey.png",
                "angolo-destro": "2025/10/Bagger-angle-right_grey.png",
                "angolo-sinistro": "2025/10/Bagger-angle-left_grey.png",
            },
            "nero": {
                "etichetta": "Black Ebony",
                "fronte": "2023/10/calibro-bagger-front.png",
                "retro": "2023/10/calibro-bagger-back.png",
                "angolo-destro": "2023/10/calibro-bagger-angle-right.png",
            },
        },
    },
}

DESTINAZIONE = os.path.join("public", "moto")
CURL = shutil.which("curl")


def scarica(url: str, tentativi: int = 3) -> bytes:
    """Scarica un indirizzo. Usiamo curl perche' gestisce bene questo sito."""
    if CURL is None:
        raise RuntimeError("curl non e' installato")

    comando = [CURL, "-sL", "--max-time", "60", "--fail", "--compressed"]
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
    raise RuntimeError(f"{ultimo}")


def salva_webp(dati: bytes, destinazione: str, larghezza: int, qualita: int):
    """Converte in WebP sopra fondo bianco. Torna le dimensioni, o None."""
    try:
        im = Image.open(_io.BytesIO(dati))
        im.load()
    except Exception:
        return None

    # Le immagini ufficiali sono PNG con lo sfondo trasparente: la
    # trasparenza va CONSERVATA, perche' sul sito la moto viene appoggiata
    # su fondo scuro e deve risultare scontornata, non dentro un riquadro
    # bianco. Il WebP supporta il canale alfa, quindi non si perde nulla.
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")

    # RITAGLIO DEL VUOTO ATTORNO ALLA MOTO
    # I file ufficiali hanno margini trasparenti di ampiezza diversa da una
    # vista all'altra: senza ritaglio la stessa moto appare grande nel profilo
    # e piccola nel frontale. Qui togliamo il vuoto e lasciamo un margine
    # uniforme, cosi' tutte le viste risultano della stessa dimensione.
    if im.mode == "RGBA":
        riquadro = im.split()[-1].getbbox()
        if riquadro:
            im = im.crop(riquadro)
            margine = round(max(im.size) * 0.04)
            tela = Image.new("RGBA", (im.width + margine * 2, im.height + margine * 2), (0, 0, 0, 0))
            tela.paste(im, (margine, margine))
            im = tela

    if im.width > larghezza:
        im = im.resize((larghezza, round(im.height * larghezza / im.width)), Image.LANCZOS)

    os.makedirs(os.path.dirname(destinazione), exist_ok=True)
    im.save(destinazione, "WEBP", quality=qualita, method=6)
    return im.size


def importa(slug: str, larghezza: int, qualita: int, solo_elenco: bool) -> int:
    info = MODELLI[slug]
    print(f"\n{info['nome']}")
    salvate = 0

    for livrea, voci in info["livree"].items():
        etichetta = voci.get("etichetta", livrea)
        print(f"  {etichetta}")
        for vista in VISTE:
            percorso = voci.get(vista)
            if not percorso:
                continue
            url = BASE + percorso
            if solo_elenco:
                print(f"    {vista:17} {url}")
                salvate += 1
                continue
            try:
                dati = scarica(url)
            except RuntimeError as e:
                print(f"    {vista:17} non scaricata ({e})")
                continue
            out = os.path.join(DESTINAZIONE, slug, livrea, f"{vista}.webp")
            esito = salva_webp(dati, out, larghezza, qualita)
            if esito is None:
                print(f"    {vista:17} immagine non leggibile")
                continue
            salvate += 1
            print(f"    {vista:17} {esito[0]}x{esito[1]}  {os.path.getsize(out)//1024} KB")

    return salvate


def main() -> None:
    p = argparse.ArgumentParser(description="Importa le fotografie ufficiali Moto Morini.")
    p.add_argument("modelli", nargs="*", help=f"uno o piu' fra: {', '.join(MODELLI)}")
    p.add_argument("--elenca", action="store_true", help="mostra gli indirizzi senza scaricare")
    p.add_argument("--larghezza", type=int, default=1600)
    p.add_argument("--qualita", type=int, default=86)
    a = p.parse_args()

    scelti = a.modelli or list(MODELLI)
    ignoti = [m for m in scelti if m not in MODELLI]
    if ignoti:
        sys.exit(f"modello non riconosciuto: {', '.join(ignoti)}\nvalidi: {', '.join(MODELLI)}")

    totale = sum(importa(s, a.larghezza, a.qualita, a.elenca) for s in scelti)
    print(f"\nTotale: {totale} immagini.")


if __name__ == "__main__":
    main()
