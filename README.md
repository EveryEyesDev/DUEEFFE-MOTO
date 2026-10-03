# DUEFFE MOTO — Landing page

Sito vetrina di **DUE EFFE MOTO SRL**, concessionaria e officina moto a Cavallino (Lecce).
Realizzato con **Next.js (App Router)**, **React 19**, **TypeScript** e **Tailwind CSS v4**.

Il catalogo mostra le moto con una galleria fotografica sfogliabile. Niente 3D e
niente WebGL: sono normali immagini, quindi funziona su qualunque browser.

---

## Avvio

```bash
npm install
npm run dev
```

Il sito risponde su `http://localhost:3000`.

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Compila la versione di produzione |
| `npm start` | Avvia la versione compilata |
| `npm run lint` | Controlla i tipi TypeScript |

---

## Dove si modificano le cose

### Contatti e dati societari

Tutti in un unico file: **`src/config/site.ts`**.
Indirizzo, telefono, partita IVA, codice SDI, orari, marchi trattati, coordinate della sede.
Modifichi lì e cambia ovunque nel sito.

I campi lasciati vuoti **non vengono mostrati**. Da compilare quando avrai il dato:

- `email` — indirizzo di posta ufficiale
- `whatsapp` — numero in formato internazionale senza simboli, es. `393331234567`
- `social` — profili Instagram, Facebook, YouTube
- `heroImage` — fotografia di sfondo dell'apertura, es. `/foto/showroom.jpg`

Gli **orari** e la **valutazione Google** sono presi dalla scheda dell'attività a ottobre 2026.
Se cambiano vanno aggiornati qui, e la valutazione mostra sempre la data accanto al voto.

### Logo

Il logo sta in **`public/brand/dueffe-logo.png`**, con lo sfondo trasparente.
È stato ricavato dall'originale su fondo nero, conservato accanto come
`dueffe-logo-originale.jpeg`.

Se un giorno sostituirai il file con uno su fondo nero pieno, rimetti `FONDO_NERO`
a `true` in `src/components/DueffeLogo.tsx` e il nero verrà fuso con lo sfondo.
Se il file sparisce, il sito mostra un marchio testuale di ripiego invece di
un'immagine rotta.

Il rosso del marchio è **`#D00020`**, campionato dal logo stesso, ed è l'accento
usato in tutto il sito.

### Recensioni Google

Il voto complessivo sta in `SITE.googleReviews` dentro `src/config/site.ts`.

**Mostriamo solo il voto e il numero di recensioni, mai i testi e mai i nomi.**
Quelli sono dati personali di persone che non hanno acconsentito a comparire
qui, e sceglierne alcune farebbe scattare l'obbligo di dichiarare come sono
state selezionate. Chi vuole leggerle raggiunge la scheda Google in un clic.

Il voto va aggiornato ogni tanto: accanto compare sempre la data del dato,
cosi' non invecchia di nascosto.

Testimonianze raccolte da voi, con il consenso di chi le scrive, si potrebbero
invece pubblicare per esteso. In quel caso si aggiunge un elenco in `site.ts`.

### Catalogo: moto nuove e usate

Tutto sta in **`src/data/motorcycles.ts`**, diviso in due elenchi.

- **`MOTO_NUOVE`** — i modelli a listino. Cambiano di rado.
- **`MOTO_USATE`** — il parco usato. **Da aggiornare una volta al mese.**

Per aggiungere una moto usata, copia l'esempio completo che trovi commentato
sopra l'elenco `MOTO_USATE` e compilalo. Ogni voce e' un mezzo singolo, con
anno, chilometri, garanzia e prezzo suoi. Quando una moto e' venduta puoi
toglierla, oppure lasciarla visibile mettendo `sold: true`: compare barrata
con la scritta Venduta.

Per mettere una moto in vetrina sulla home, aggiungi `featured: true`.
Se non ne segni nessuna, la home mostra le prime del catalogo.

Il catalogo vive su una pagina propria, **`/moto`**, cosi' la home resta
breve e l'elenco puo' crescere quanto serve.

Specifiche tecniche, prezzi e livree sono **volutamente vuoti**: dove manca il dato
l'interfaccia mostra "In arrivo", non un valore inventato.

**Per una fotografia singola**: salvala come
`public/moto/<modello>/scheda-principale.jpg` e valorizza `image`.

**Per la galleria**: metti le immagini in `public/moto/<modello>/` e valorizza
`gallery` con l'elenco dei percorsi. Da quattro a sei foto per moto bastano.
Il dettaglio sta in `public/moto/LEGGIMI.md`.

---

## Struttura

```
├── app/
│   ├── layout.tsx                  # Layout, metadati SEO, dati strutturati
│   ├── page.tsx                    # Home: apertura, vetrina, rata, officina
│   ├── moto/
│   │   ├── page.tsx                # Catalogo completo, nuovo e usato
│   │   └── layout.tsx              # Metadati della pagina catalogo
│   └── globals.css                 # Stili globali Tailwind
├── public/
│   └── brand/                      # Logo ufficiale
├── src/
│   ├── components/
│   │   ├── DueffeLogo.tsx          # Logo, con ripiego testuale
│   │   ├── Navbar.tsx              # Barra di navigazione
│   │   ├── HeroSection.tsx         # Apertura
│   │   ├── HeroBackground.tsx      # Sfondo disegnato a codice
│   │   ├── BikeHighlights.tsx      # Vetrina in home, con Vedi tutte le moto
│   │   ├── BikeCard.tsx            # Scheda moto, nuovo e usato
│   │   ├── MotorcycleShowcase.tsx  # Catalogo con i due reparti
│   │   ├── BikeGallery.tsx         # Galleria fotografica sfogliabile
│   │   ├── FinancingCalculator.tsx # Simulatore di rata
│   │   ├── ServicesSection.tsx     # Servizi, sede, orari, mappa
│   │   └── Footer.tsx              # Chiusura e dati legali
│   ├── config/site.ts              # DATI AZIENDALI — unico punto di verità
│   ├── data/motorcycles.ts         # Catalogo modelli
│   ├── services/api.ts             # Client API, oggi senza backend
│   └── types.ts                    # Tipi TypeScript
└── next.config.mjs
```

---

## Cose ancora da fare

- **Fotografie delle moto**: da quattro a sei per modello, meglio dai kit stampa ufficiali.
- **Schede tecniche**: da compilare con i dati ufficiali delle case madri.
- **Fotografia del negozio** per lo sfondo dell'apertura. Usate immagini vostre:
  quelle sulla scheda Google appartengono a chi le ha caricate.
- **Email e social** da inserire in `site.ts`.
- **Modulo contatti**: non esiste un backend, quindi oggi i contatti passano dal
  telefono. `src/services/api.ts` è già predisposto per quando ci sarà.
- **Privacy e cookie policy**: i link nel footer sono segnaposto.

---

© DUE EFFE MOTO SRL — P.IVA 04783900758
