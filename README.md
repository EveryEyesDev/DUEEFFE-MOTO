# Dueffe Moto — Concessionaria Ufficiale & Showroom 3D

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg?style=flat&logo=three.js)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)

Landing page moderna per la concessionaria di moto **Dueffe Moto**, realizzata con **Next.js (App Router) & React 19**, con visualizzatore 3D interattivo a 360°, configuratore di livree in tempo reale, simulatore sonoro del motore tramite Web Audio API, calcolatore di rate di finanziamento e sistema di prenotazione test ride.

---

## 🚀 Caratteristiche Principali

- **Next.js App Router (`/app`) & React 19**: Architettura a componenti modulari, direttive `'use client'` per i moduli interattivi e metadata SEO nativi in `app/layout.tsx`.
- **Brand & Logo Ufficiale**: Riproduzione fedele in SVG vettoriale del logo con pilota aerodinamico e schema colori *Racing Red* (`#E10600`) e *Obsidian Black*.
- **Visualizzatore 3D Realtime (Three.js)**:
  - Rotazione 360° interattiva (mouse / touch) e controlli zoom.
  - Modifica della livrea/colore serbatoio e carene in tempo reale con riflessi realistici (PBR materials).
  - Accensione e spegnimento fari anteriori a LED con fascio di luce volumetrico.
  - Simulatore acustico del motore (Web Audio API) con pulsante "Sgasata!" e acceleratore dinamico.
  - Modalità ingegneristica *Wireframe* per ispezione del telaio e della ciclistica.
  - Hotspot 3D interattivi per approfondimenti tecnici (motore desmodromico, freni Brembo Stylema, scarico Akrapovič, sospensioni Öhlins).
- **Gamma Moto Completa**:
  - *Dueffe Corse V4R* (SuperSport)
  - *Dueffe Diablo 1200* (HyperNaked)
  - *Dueffe Overland 950 Rally* (Adventure)
  - *Dueffe Nero 1260* (Power Cruiser)
  - *Dueffe Heritage 800* (Café Racer)
- **Calcolatore Finanziamento**:
  - Cursori interattivi per anticipo (0% - 50%), durata in mesi (24, 36, 48, 60) e maxi rata finale con valore futuro garantito.
- **Prenotazione Test Ride**:
  - Modal interattivo con selezione modello, patente (A, A2), data/ora e generazione del pass digitale con QR Code.

---

## 🛠️ Installazione e Avvio

```bash
# 1. Clona il repository GitHub
git clone https://github.com/<tuo-utente>/dueffe-moto.git
cd dueffe-moto

# 2. Installa le dipendenze
npm install

# 3. Avvia lo sviluppo
npm run dev
```

L'applicazione sarà accessibile all'indirizzo `http://localhost:3000`.

---

## 📂 Struttura del Progetto (Next.js & React)

```
├── app/
│   ├── layout.tsx                # Next.js App Router Root Layout & Metadati SEO
│   ├── page.tsx                  # Next.js App Router Landing Page
│   └── globals.css               # Stili globali TailwindCSS
├── src/
│   ├── components/
│   │   ├── DueffeLogo.tsx        # Logo vettoriale ufficiale Dueffe Moto
│   │   ├── Motorcycle3DViewer.tsx # Visualizzatore 3D Three.js
│   │   ├── MotorcycleShowcase.tsx # Showcase e selettore modelli con toggle 3D/Scheda
│   │   ├── FinancingCalculator.tsx# Calcolatore preventivo finanziamento
│   │   ├── HeroSection.tsx       # Sezione hero con animazioni e statistiche
│   │   ├── Navbar.tsx            # Navigazione principale
│   │   ├── ServicesSection.tsx   # Officina, reparto corse e contatti
│   │   ├── TestRideModal.tsx     # Prenotazione test ride con pass QR
│   │   └── Footer.tsx            # Footer con info aziendali
│   ├── data/
│   │   └── motorcycles.ts        # Dati e specifiche tecniche gamma moto
│   ├── services/
│   │   └── api.ts                # Client API per endpoint backend
│   ├── utils/
│   │   └── audioEngine.ts        # Sintetizzatore audio procedurale motore
│   ├── types.ts                  # Definizioni TypeScript
│   └── index.css                 # Importazione stili base
├── next.config.mjs               # Configurazione Next.js
├── index.html                    # Entry point HTML sincronizzato
└── package.json
```


---

## 📄 Licenza

Proprietà riservata © Dueffe Moto S.r.l.
