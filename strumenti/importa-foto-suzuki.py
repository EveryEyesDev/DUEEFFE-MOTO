#!/usr/bin/env python3
"""
Importa la gamma Suzuki dal sito ufficiale italiano.

A COSA SERVE
Legge moto.suzuki.it, ricava l'elenco completo dei modelli e per ognuno
scarica, di ogni livrea, le sei viste che usiamo in scheda (fronte, retro,
i due profili e le due tre quarti) piu' la fotografia ambientata che
mostriamo nel catalogo. Converte tutto in WebP e scrive un file pronto da
incollare nel catalogo del sito.

COME SI USA
    python strumenti/importa-foto-suzuki.py             tutta la gamma
    python strumenti/importa-foto-suzuki.py --elenca    mostra cosa troverebbe
    python strumenti/importa-foto-suzuki.py --solo gsx-8s   un modello solo

OPZIONI
    --larghezza 1600    larghezza massima delle immagini
    --qualita 86        qualita' WebP

DOVE FINISCE TUTTO
    public/moto/suzuki-<modello>/<livrea>/<vista>.webp
    public/moto/suzuki-<modello>/in-strada.webp          la foto ambientata
    public/moto/suzuki-<modello>/in-strada-sfondo.webp   la sua miniatura
    strumenti/suzuki-generato.ts.txt                     il blocco di dati

DA DOVE ARRIVANO LE FOTOGRAFIE
Suzuki pubblica per quasi tutti i modelli un giro a 360 gradi: diciotto
scatti dello stesso soggetto, uno ogni venti gradi, ripetuti per ogni
livrea. E' la sorgente migliore che abbiamo, perche' inquadratura e luce
sono identiche per tutti i modelli: le moto risultano tutte della stessa
dimensione e tutte rivolte nello stesso verso.

Di quel giro ci servono sei scatti soltanto, quelli che corrispondono alle
viste che mostriamo in scheda (vedi VISTE). I modelli senza giro a 360
gradi hanno almeno la fotografia di ciascuna livrea, e di quelli prendiamo
quella.

LO SFONDO BIANCO
Gli scatti del giro sono su fondo bianco. Qui lo rendiamo trasparente
partendo dai bordi dell'immagine e allargandoci finche' il colore resta
chiaro: cosi' il bianco che sta dentro la moto (un parafango, una grafica)
non viene toccato, perche' non e' collegato al bordo.

DIRITTI
Sono immagini ufficiali del costruttore. Un concessionario ufficiale puo'
normalmente usarle per i modelli che vende, ma la conferma va chiesta al
proprio referente di zona.
"""

import argparse
import io as _io
import os
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from urllib.parse import quote

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    sys.exit("Mancano Pillow o numpy.\nInstallali con:  pip install Pillow numpy")

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

DESTINAZIONE = os.path.join("public", "moto")

# Il giro a 360 gradi parte dal fronte e procede di venti gradi per scatto.
# Questi sei fotogrammi corrispondono alle nostre viste, e valgono per ogni
# modello perche' il giro e' sempre costruito allo stesso modo.
VISTE = {
    "fronte": "04",
    "angolo-destro": "01",
    "lato-destro": "18",
    "retro": "13",
    "angolo-sinistro": "07",
    "lato-sinistro": "09",
}

# Famiglie Suzuki ricondotte alle categorie del nostro catalogo.
CATEGORIE = [
    (r"burgman|address", ("naked", "Scooter")),
    (r"dr-z4sm", ("naked", "Supermotard")),
    (r"v-strom|dr-z4s", ("adventure", "Adventure")),
    (r"rm-z", ("adventure", "Cross")),
    (r"gsx-r|hayabusa", ("naked", "Sportiva")),
    (r"gsx-s\d+g[tx]|sv-7gx", ("adventure", "Sport touring")),
    (r"gsx-8t", ("naked", "Modern classic")),
    (r"katana|gsx-8|gsx-s", ("naked", "Naked")),
]


def scarica(url, tentativi=3):
    """Scarica un indirizzo presentandosi come il browser, cosi' il sito risponde."""
    if CURL is None:
        raise RuntimeError("curl non e' installato")
    comando = [CURL, "-sLg", "--max-time", "45", "--fail", "--compressed"]
    for chiave, valore in INTESTAZIONI.items():
        comando += ["-H", "%s: %s" % (chiave, valore)]
    comando.append(url)

    ultimo = "nessun tentativo"
    for n in range(tentativi):
        esito = subprocess.run(comando, capture_output=True)
        if esito.returncode == 0 and esito.stdout:
            return esito.stdout
        ultimo = "curl uscito con %d" % esito.returncode
        time.sleep(0.6 * (n + 1))
    raise RuntimeError(ultimo)


def ripulisci(testo):
    """Toglie accenti e caratteri strani per farne un nome di cartella."""
    testo = unicodedata.normalize("NFKD", testo).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", testo).strip("-").lower()


def categoria_di(slug):
    for schema, esito in CATEGORIE:
        if re.search(schema, slug):
            return esito
    return ("naked", "Moto")


def elenco_modelli():
    """Legge la gamma dalla pagina iniziale. Torna (percorso, nome breve)."""
    html = scarica(BASE + "/").decode("utf-8", "replace")
    percorsi = sorted(set(re.findall(r'href="(/modelli/\d+/[^"]+\.aspx)"', html)))
    return [(p, p.rsplit("/", 1)[-1].replace(".aspx", "")) for p in percorsi]


def titolo_di(html, ripiego):
    """
    Il titolo della pagina e' del tipo "Suzuki - GSX-8S".

    Togliamo la marca davanti ma NON spezziamo sui trattini, altrimenti
    GSX-8S diventerebbe "GSX" e V-Strom diventerebbe "V".
    """
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    if not m:
        return ripiego.replace("-", " ").upper()
    titolo = m.group(1).split("|")[0].strip()
    titolo = re.sub(r"^\s*Suzuki\s*[-–]\s*", "", titolo, flags=re.I).strip()
    return titolo or ripiego.replace("-", " ").upper()


def nomi_livree(html):
    """
    I nomi commerciali delle livree, nell'ordine in cui Suzuki le elenca.

    Stanno negli indirizzi delle fotografie di colore, del tipo
        /productimg/MOTO/models/ADDRESS 125/colori/01 BLU TOKYO (MY26).jpg
    dove il numero davanti e' proprio l'ordine. Alcuni modelli caricano
    quella sezione a parte e qui non compare: in quel caso torniamo una
    lista vuota e le livree restano senza nome, da chiedere al cliente.
    """
    trovati = {}
    for grezzo in re.findall(r"/productimg/MOTO/models/[^/\"']+/colori/([^\"']+)\.jpg", html, re.I):
        m = re.match(r"\s*(\d+)\s+(.+?)\s*$", grezzo)
        if m:
            trovati[int(m.group(1))] = re.sub(r"\s*\(MY\d+\)\s*$", "", m.group(2)).strip()
    return [trovati[k] for k in sorted(trovati)]


def foto_livree(html):
    """
    Le fotografie di colore cosi' come stanno scritte nella pagina.

    Servono da ripiego per i modelli senza giro a 360 gradi: danno una sola
    vista per livrea, ma e' meglio di niente.
    """
    viste = []
    for percorso in re.findall(r"(/productimg/MOTO/models/[^/\"']+/colori/[^\"']+\.jpg)", html, re.I):
        if percorso not in viste:
            viste.append(percorso)
    return viste


def foto_ambientata(html):
    """
    La fotografia grande del modello in scena, quella che apre la pagina.

    E' l'unica ambientata che Suzuki pubblica in alta risoluzione, ed e'
    quella giusta per il catalogo: nel dettaglio mostriamo invece soltanto
    gli scatti in studio.
    """
    grandi = re.findall(r"(/upl/cache/Suzuki_[^\"']+?-\d+-2880x1755\.jpg)", html, re.I)
    if grandi:
        return grandi[0]
    gallerie = re.findall(r"(/upl/cache/Suzuki_[^\"']+?-\d+-800x470\.jpg)", html, re.I)
    return gallerie[0] if gallerie else ""


def indirizzo360(slug, livrea, fotogramma):
    return "%s/modelli/360/%s/img/data/grade1/color%d/%s.webp" % (BASE, slug, livrea, fotogramma)


def forme_del_nome(slug):
    """
    I modi in cui Suzuki puo' aver scritto il nome del modello nel giro a
    360 gradi.

    Di norma e' lo stesso della pagina ("gsx-8s"), ma non sempre: il
    Burgman 400 sta sotto "burgman400" senza trattini e la V-Strom 800DE
    sotto "v-strom800de", con il trattino solo nel nome della famiglia.
    Non c'e' una regola, quindi le proviamo nell'ordine dal piu' probabile
    al meno, e ci fermiamo alla prima che risponde.
    """
    forme = [slug, slug.replace("-", "")]
    # "v-strom-800de" -> "v-strom800de": via solo i trattini dopo il primo.
    pezzi = slug.split("-")
    if len(pezzi) > 2:
        forme.append(pezzi[0] + "-" + "".join(pezzi[1:]))
        forme.append("-".join(pezzi[:2]) + "".join(pezzi[2:]))
    fuori = []
    for f in forme:
        if f not in fuori:
            fuori.append(f)
    return fuori


def giro360(slug):
    """
    Il nome giusto del giro a 360 gradi e quante livree ha.

    Torna (nome, quante). Se il giro non esiste in nessuna forma del nome,
    torna (slug, 0).
    """
    for forma in forme_del_nome(slug):
        try:
            scarica(indirizzo360(forma, 1, "04"), tentativi=1)
        except RuntimeError:
            continue
        quante = 1
        for n in range(2, 13):
            try:
                scarica(indirizzo360(forma, n, "04"), tentativi=1)
            except RuntimeError:
                break
            quante = n
        return forma, quante
    return slug, 0


SEGNO = (1, 2, 3)


def _riempi(im, soglia):
    """Allaga di SEGNO il fondo chiaro, partendo dai quattro angoli."""
    angoli = [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]
    for angolo in angoli:
        if sum(im.getpixel(angolo)) > 690:  # l'angolo e' quasi bianco
            ImageDraw.floodfill(im, angolo, SEGNO, thresh=soglia)
    return im


def _maschera(im):
    a = np.array(im)
    return (a[:, :, 0] == SEGNO[0]) & (a[:, :, 1] == SEGNO[1]) & (a[:, :, 2] == SEGNO[2])


def scontorna(im):
    """
    Rende trasparente il fondo bianco degli scatti in studio.

    DUE PASSATE, E C'E' UN MOTIVO
    La prima e' prudente: toglie solo il bianco pieno. Basta per il fondo,
    ma lascia a terra l'ombra morbida dello scatto, che sulle nostre pagine
    scure si vede come un alone chiaro sotto le ruote.

    Alzare la soglia della prima passata non va bene: una moto bianca o
    color crema verrebbe mangiata insieme al fondo, perche' il
    riempimento non distingue la carrozzeria chiara dal bianco attorno.

    La seconda passata e' quindi decisa, ma ristretta alla fascia a terra,
    l'ultimo quinto dell'altezza della moto. Li' c'e' l'ombra, e quel poco
    di moto che ci arriva (gomme, scarico, piastre) e' scuro: il
    riempimento lo lascia stare. Cosi' l'ombra sparisce e le moto chiare
    restano intere.
    """
    im = im.convert("RGBA")
    sorgente = im.convert("RGB")

    fondo = _maschera(_riempi(sorgente.copy(), 42))

    righe_piene = np.where(~fondo.all(axis=1))[0]
    if len(righe_piene):
        alto, basso = righe_piene[0], righe_piene[-1]
        inizio_fascia = max(0, basso - round((basso - alto) * 0.22))
        fascia = sorgente.crop((0, inizio_fascia, sorgente.width, basso + 1))
        fondo[inizio_fascia:basso + 1] |= _maschera(_riempi(fascia, 115))

    fuori = np.array(im)
    fuori[:, :, 3] = np.where(fondo, 0, fuori[:, :, 3])
    return Image.fromarray(fuori, "RGBA")


# La tela comune a tutti gli scatti: tre di larghezza ogni due di altezza.
# Vedi strumenti/uniforma-foto.py per il perche'.
PROPORZIONE = 3 / 2
LARGHEZZA_MOTO = 0.90
ALTEZZA_MASSIMA = 0.86
ZOCCOLO = 0.04


def su_tela_comune(im, larghezza_tela):
    """
    Rimette la moto, gia' scontornata, dentro una tela sempre uguale.

    Ritagliata attorno alla sagoma, ogni moto ha una sua forma: una lunga e
    bassa, una quasi quadrata. In pagina, con un'altezza fissa, la lunga
    diventa enorme e la corta minuscola. Qui le mettiamo tutte sulla stessa
    tela, larghe nove decimi e appoggiate in basso: da quel momento hanno
    tutte la stessa forma, al sito basta fissare l'altezza e le moto
    risultano della stessa misura, con le ruote sulla stessa riga.

    Se una moto alta sforasse, la rimpiccioliamo quel tanto che basta:
    meglio un filo piu' piccola che tagliata.
    """
    riquadro = im.split()[-1].getbbox()
    if riquadro is None:
        return None
    im = im.crop(riquadro)

    altezza_tela = round(larghezza_tela / PROPORZIONE)
    fattore = larghezza_tela * LARGHEZZA_MOTO / im.width
    if im.height * fattore > altezza_tela * ALTEZZA_MASSIMA:
        fattore = altezza_tela * ALTEZZA_MASSIMA / im.height

    im = im.resize(
        (max(1, round(im.width * fattore)), max(1, round(im.height * fattore))),
        Image.LANCZOS,
    )

    tela = Image.new("RGBA", (larghezza_tela, altezza_tela), (0, 0, 0, 0))
    tela.paste(
        im,
        ((larghezza_tela - im.width) // 2,
         max(0, altezza_tela - im.height - round(altezza_tela * ZOCCOLO))),
    )
    return tela


def salva(dati, destinazione, larghezza, qualita, togli_fondo):
    try:
        im = Image.open(_io.BytesIO(dati))
        im.load()
    except Exception:
        return None

    # Prima rimpiccioliamo, poi scontorniamo: il riempimento costa in
    # proporzione ai pixel, e sui 2400 di partenza ci metteva un'eternita'.
    if im.width > larghezza:
        im = im.resize((larghezza, round(im.height * larghezza / im.width)), Image.LANCZOS)

    if togli_fondo:
        im = scontorna(im)
        im = su_tela_comune(im, larghezza)
        if im is None:
            return None
    else:
        im = im.convert("RGB")

    os.makedirs(os.path.dirname(destinazione), exist_ok=True)
    im.save(destinazione, "WEBP", quality=qualita, method=4)
    return im.size


def miniatura_sfondo(origine):
    """
    La copia minuscola e gia' sfocata che lo showcase usa come sfondo.

    Sfocare l'immagine grande nel browser era la causa principale degli
    scatti durante lo scorrimento: qui la sfocatura la facciamo una volta
    sola (vedi anche strumenti/sfondi-sfocati.py).
    """
    im = Image.open(origine).convert("RGB")
    altezza = max(1, round(im.height * 64 / im.width))
    im = im.resize((64, altezza), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    im.save(origine.replace("in-strada.webp", "in-strada-sfondo.webp"), "WEBP", quality=80, method=6)


def etichetta_vista(vista):
    return {
        "fronte": "Fronte",
        "retro": "Retro",
        "lato-destro": "Lato destro",
        "lato-sinistro": "Lato sinistro",
        "angolo-destro": "Inclinata a destra",
        "angolo-sinistro": "Inclinata a sinistra",
    }[vista]


def blocco_dati(cartella, nome, cat, etichetta_cat, livree, ambientata):
    """Scrive la voce TypeScript di un modello."""
    pezzi = []
    for slug_livrea, nome_livrea, viste in livree:
        righe = "\n".join(
            "          { id: '%s', label: '%s', src: '/moto/%s/%s/%s.webp' },"
            % (vista, etichetta_vista(vista), cartella, slug_livrea, vista)
            for vista in viste
        )
        pezzi.append(
            "      {\n"
            "        slug: '%s',\n"
            "        name: '%s',\n"
            "        hex: '#1a1a1e',\n"
            "        views: [\n%s\n        ],\n"
            "      }," % (slug_livrea, nome_livrea, righe)
        )

    prima_livrea, _, prime_viste = livree[0]
    apertura = "lato-destro" if "lato-destro" in prime_viste else prime_viste[0]

    testo = (
        "  {\n"
        "    id: '%s',\n"
        "    brand: 'Suzuki',\n"
        "    name: '%s',\n"
        "    subtitle: 'Scheda tecnica da completare',\n"
        "    condition: 'nuovo',\n"
        "    category: '%s',\n"
        "    categoryLabel: '%s',\n"
        "    tagline: 'Chiedici tutto in salone',\n"
        "    description: 'Modello della gamma Suzuki. Dati tecnici e prezzo "
        "te li diamo in concessionaria: chiamaci o passa a trovarci.',\n"
        "    image: '/moto/%s/%s/%s.webp',\n"
    ) % (cartella, nome, cat, etichetta_cat, cartella, prima_livrea, apertura)

    if ambientata:
        testo += "    roadImage: '/moto/%s/in-strada.webp',\n" % cartella

    testo += (
        "    colorways: [\n%s\n    ],\n"
        "    colors: [],\n"
        "    specs: {},\n"
        "    features: [],\n"
        "  }," % "\n".join(pezzi)
    )
    return testo


def main():
    p = argparse.ArgumentParser(description="Importa la gamma Suzuki.")
    p.add_argument("--elenca", action="store_true")
    p.add_argument("--solo", default=None, help="importa un modello solo")
    p.add_argument("--larghezza", type=int, default=1600)
    p.add_argument("--qualita", type=int, default=86)
    a = p.parse_args()

    modelli = elenco_modelli()
    if a.solo:
        modelli = [m for m in modelli if a.solo in m[1]]
    print("Modelli in gamma: %d\n" % len(modelli))

    voci = []
    senza_nomi = []
    for percorso, slug in modelli:
        cartella = "suzuki-" + ripulisci(slug)
        try:
            html = scarica(BASE + percorso).decode("utf-8", "replace")
        except RuntimeError as e:
            print("  %-30s pagina non raggiunta (%s)" % (slug, e))
            continue

        nome = titolo_di(html, slug)
        nomi = nomi_livree(html)
        forma360, quante = giro360(slug)

        if a.elenca:
            fonte = "giro 360, %d livree" % quante if quante else "solo foto colore"
            print("  %-30s %-22s nomi: %s" % (nome, fonte, ", ".join(nomi) or "DA CHIEDERE"))
            continue

        livree = []
        if quante:
            for n in range(1, quante + 1):
                etichetta = nomi[n - 1] if n <= len(nomi) else "Livrea %d" % n
                slug_livrea = ripulisci(etichetta)
                fatte = []
                for vista, fotogramma in VISTE.items():
                    try:
                        dati = scarica(indirizzo360(forma360, n, fotogramma), tentativi=2)
                    except RuntimeError:
                        continue
                    out = os.path.join(DESTINAZIONE, cartella, slug_livrea, vista + ".webp")
                    if salva(dati, out, a.larghezza, a.qualita, True):
                        fatte.append(vista)
                if fatte:
                    livree.append((slug_livrea, etichetta, fatte))
        else:
            for indirizzo in foto_livree(html):
                grezzo = indirizzo.rsplit("/", 1)[-1].replace(".jpg", "")
                m = re.match(r"\s*(\d+)\s+(.+?)\s*$", grezzo)
                etichetta = re.sub(r"\s*\(MY\d+\)\s*$", "", m.group(2)).strip() if m else grezzo
                slug_livrea = ripulisci(etichetta)
                try:
                    dati = scarica(BASE + quote(indirizzo, safe="/()"), tentativi=2)
                except RuntimeError:
                    continue
                out = os.path.join(DESTINAZIONE, cartella, slug_livrea, "lato-destro.webp")
                if salva(dati, out, a.larghezza, a.qualita, True):
                    livree.append((slug_livrea, etichetta, ["lato-destro"]))

        if not livree:
            print("  %-30s nessuna fotografia trovata" % nome)
            continue

        # La fotografia ambientata: la mostriamo solo fuori dal dettaglio.
        ambientata = ""
        indirizzo = foto_ambientata(html)
        if indirizzo:
            try:
                dati = scarica(BASE + quote(indirizzo, safe="/()"), tentativi=2)
                out = os.path.join(DESTINAZIONE, cartella, "in-strada.webp")
                if salva(dati, out, 1600, a.qualita, False):
                    miniatura_sfondo(out)
                    ambientata = out
            except RuntimeError:
                pass

        cat, etichetta_cat = categoria_di(slug)
        voci.append((cartella, nome, cat, etichetta_cat, livree, ambientata))
        if not nomi:
            senza_nomi.append(nome)

        scatti = sum(len(v[2]) for v in livree)
        print(
            "  %-30s %d livree, %d scatti%s"
            % (nome, len(livree), scatti, "" if ambientata else "   SENZA foto ambientata")
        )

    if a.elenca or not voci:
        return

    testo = (
        "// Generato da strumenti/importa-foto-suzuki.py\n"
        "// Incolla queste voci dentro MOTO_NUOVE in src/data/motorcycles.ts\n"
        "// Le schede tecniche sono vuote: vanno compilate col listino ufficiale.\n\n"
        + "\n".join(blocco_dati(*v) for v in voci)
        + "\n"
    )
    percorso_out = os.path.join("strumenti", "suzuki-generato.ts.txt")
    with open(percorso_out, "w", encoding="utf-8") as f:
        f.write(testo)

    print("\n%d modelli importati." % len(voci))
    print("Blocco dati scritto in %s" % percorso_out)
    if senza_nomi:
        print("\nLivree senza nome commerciale, da chiedere al cliente:")
        for n in senza_nomi:
            print("  - %s" % n)


if __name__ == "__main__":
    main()
