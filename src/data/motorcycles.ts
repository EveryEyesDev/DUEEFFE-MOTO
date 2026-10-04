import { Motorcycle } from '../types';

/**
 * Catalogo DUE EFFE MOTO.
 *
 * DUE ELENCHI
 *   MOTO_NUOVE  — i modelli a listino, cambiano di rado
 *   MOTO_USATE  — il parco usato, DA AGGIORNARE UNA VOLTA AL MESE
 *
 * FOTOGRAFIE
 * Cartelle gia' pronte in public/moto/<modello>/
 * Metti li' le immagini, poi valorizza `image` con la foto principale
 * e `gallery` con l'elenco completo. Vedi public/moto/LEGGIMI.md.
 *
 * PREZZI
 * Sono franco concessionario e non comprendono la messa su strada.
 * Alcuni sono promozionali o indicativi: il dettaglio sta in `priceNote`,
 * che viene mostrato sotto la cifra.
 *
 * Dati tecnici da schede ufficiali Moto Morini e stampa di settore,
 * raccolti a ottobre 2026. Vanno confermati col listino ufficiale.
 */

export const MOTO_NUOVE: Motorcycle[] = [
  {
    id: 'moto-morini-x-cape-700',
    brand: 'Moto Morini',
    name: 'X-Cape 700',
    claim: 'Dove finisce l’asfalto, comincia il bello.',
    subtitle: 'Crossover bicilindrica da 693 cc, a suo agio dentro e fuori l’asfalto',
    featured: true,
    condition: 'nuovo',
    category: 'adventure',
    categoryLabel: 'Adventure',
    tagline: 'La compagna giusta per il viaggio lungo e per il lunedì mattina',
    description:
      'Una crossover pensata per chi non vuole scegliere tra strada e sterrato. Il bicilindrico da 693 cc spinge con regolarità, la forcella Marzocchi completamente regolabile lavora bene anche sul rotto, e con 18 litri di serbatoio i trasferimenti non diventano una caccia al distributore. La versione a raggi aggiunge cavalletto centrale e dashcam anteriore.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/x-cape-700/in-strada.webp',
    colorways: [
      {
        slug: 'bianco-carrara',
        name: 'Carrara White',
        hex: '#eef0f2',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-700/bianco-carrara/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-700/bianco-carrara/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-700/bianco-carrara/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-700/bianco-carrara/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-700/bianco-carrara/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-700/bianco-carrara/retro.webp' },
        ],
      },
      {
        slug: 'nero-ebony',
        name: 'Black Ebony',
        hex: '#141418',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-700/nero-ebony/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-700/nero-ebony/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-700/nero-ebony/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-700/nero-ebony/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-700/nero-ebony/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-700/nero-ebony/retro.webp' },
        ],
      },
      {
        slug: 'rosso-passion',
        name: 'Red Passion',
        hex: '#b11226',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-700/rosso-passion/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-700/rosso-passion/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-700/rosso-passion/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-700/rosso-passion/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-700/rosso-passion/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-700/rosso-passion/retro.webp' },
        ],
      },
    ],
    price: 7190,
    priceNote:
      'Franco concessionario, cerchi in lega. A raggi € 7.590, Gold Edition € 7.940. Messa su strada esclusa.',
    colors: [
      { name: 'Black Ebony', hex: '#141418' },
      { name: 'Red Passion', hex: '#b11226', metallic: true },
      { name: 'Carrara White', hex: '#eef0f2' },
    ],
    specs: {
      displacementCc: 693,
      powerHp: 70,
      weightKg: 213,
      fuelCapacityL: 18,
      seatHeightMm: 830,
      engineType: 'Bicilindrico in linea, 4 tempi, Euro 5+. 70 CV (51,5 kW) a 8.500 giri',
      transmission: 'Cambio a 6 rapporti, finale a catena, frizione antisaltellamento',
      frontBrakes:
        'Doppio disco da 298 mm, pinze flottanti Brembo a 2 pistoncini, ABS Bosch disinseribile',
      suspension:
        'Forcella rovesciata Marzocchi da 50 mm regolabile, 175 mm di escursione. Dietro monoammortizzatore Kayaba con precarico regolabile da remoto, 165 mm',
    },
    features: [
      'ABS Bosch disinseribile e controllo di trazione',
      'Impianto frenante Brembo e frizione antisaltellamento',
      'Cruscotto TFT a colori',
      'Serbatoio da 18 litri, 20 con la borsa posteriore',
      'Cavalletto centrale e dashcam anteriore sulla versione a raggi',
    ],
  },
  {
    id: 'moto-morini-x-cape-1200',
    brand: 'Moto Morini',
    name: 'X-Cape 1200',
    claim: 'Il mondo è più piccolo di quanto sembri.',
    subtitle: 'Maxi enduro stradale da 1.187 cc e 129 cavalli',
    condition: 'nuovo',
    category: 'adventure',
    categoryLabel: 'Adventure',
    tagline: 'Quando il viaggio si misura in giorni, non in chilometri',
    description:
      'Il passo lungo della gamma adventure. Il bicilindrico a V di 87 gradi mette in strada 129 cavalli con la calma di chi non deve dimostrare niente, e i 24,5 litri di serbatoio spostano il problema dell’autonomia molto più in là. Cruise control, quickshifter e ABS cornering rendono le tappe da autostrada meno faticose di quanto sembri.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/x-cape-1200/in-strada.webp',
    colorways: [
      {
        slug: 'bianco-artic',
        name: 'Arctic White',
        hex: '#f1f4f6',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-1200/bianco-artic/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-1200/bianco-artic/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-1200/bianco-artic/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-1200/bianco-artic/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-1200/bianco-artic/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-1200/bianco-artic/retro.webp' },
        ],
      },
      {
        slug: 'nero-viper',
        name: 'Viper Black',
        hex: '#15161a',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-1200/nero-viper/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-1200/nero-viper/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-1200/nero-viper/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-1200/nero-viper/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-1200/nero-viper/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-1200/nero-viper/retro.webp' },
        ],
      },
      {
        slug: 'rosso-energy',
        name: 'Energy Red',
        hex: '#c21f2e',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/x-cape-1200/rosso-energy/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/x-cape-1200/rosso-energy/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/x-cape-1200/rosso-energy/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/x-cape-1200/rosso-energy/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/x-cape-1200/rosso-energy/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/x-cape-1200/rosso-energy/retro.webp' },
        ],
      },
    ],
    price: 12990,
    priceNote:
      'Franco concessionario, prezzo promozionale fino a settembre 2026. Prezzo di lancio € 13.990. Messa su strada esclusa.',
    colors: [
      { name: 'Viper Black', hex: '#15161a' },
      { name: 'Arctic White', hex: '#f1f4f6' },
      { name: 'Energy Red', hex: '#c21f2e', metallic: true },
    ],
    specs: {
      displacementCc: 1187,
      powerHp: 129,
      weightKg: 259,
      fuelCapacityL: 24.5,
      seatHeightMm: 840,
      engineType: 'Bicilindrico a V di 87°, 4 tempi, Euro 5+. 129 CV (95 kW) a 8.750 giri',
      transmission: 'Cambio a 6 rapporti con quickshifter, finale a catena',
      frontBrakes:
        'Doppio disco da 320 mm, pinze Brembo monoblocco a 4 pistoncini, ABS Bosch cornering disinseribile',
      suspension:
        'Forcella rovesciata Kayaba da 48 mm completamente regolabile, 180 mm di escursione. Dietro monoammortizzatore Kayaba con leveraggio progressivo e precarico remoto, 180 mm',
    },
    features: [
      'ABS Bosch cornering disinseribile e controllo di trazione',
      'Riding mode e cruise control',
      'Quickshifter in salita e in scalata',
      'Cruscotto TFT con connettività',
      'Sospensioni Kayaba completamente regolabili',
    ],
  },
  {
    id: 'moto-morini-alltrhike-450',
    brand: 'Moto Morini',
    name: 'Alltrhike 450',
    claim: 'Leggera abbastanza da portarti ovunque.',
    subtitle: 'Enduro stradale da 449 cc, leggera e facile da guidare',
    condition: 'nuovo',
    category: 'adventure',
    categoryLabel: 'Adventure',
    badge: 'Novità',
    tagline: 'Leggera, alta e sincera: la prima adventure vera',
    description:
      'La più accessibile della famiglia. Il bicilindrico da 449 cc eroga 44,8 cavalli, ma sono i 170 chili a secco e la forcella con 208 mm di escursione a fare la differenza: in sella si sta alti, si vede lontano e lo sterrato non spaventa. La versione High Equipped aggiunge paramani, sella e manopole riscaldate, che su una moto da viaggio contano più di dieci cavalli in più.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/alltrhike-450/in-strada.webp',
    colorways: [
      {
        slug: 'nero',
        name: 'Nero',
        hex: '#141418',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/alltrhike-450/nero/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/alltrhike-450/nero/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/alltrhike-450/nero/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/alltrhike-450/nero/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/alltrhike-450/nero/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/alltrhike-450/nero/retro.webp' },
        ],
      },
      {
        slug: 'verde-jungle',
        name: 'Jungle Green',
        hex: '#3a4a35',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/alltrhike-450/verde-jungle/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/alltrhike-450/verde-jungle/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/alltrhike-450/verde-jungle/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/alltrhike-450/verde-jungle/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/alltrhike-450/verde-jungle/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/alltrhike-450/verde-jungle/retro.webp' },
        ],
      },
    ],
    price: 5890,
    priceNote:
      'Franco concessionario, versione standard. High Equipped € 6.140 con paramani, sella e manopole riscaldate. Messa su strada esclusa.',
    colors: [
      { name: 'Pure White', hex: '#f2f4f5' },
      { name: 'Jungle Green', hex: '#3a4a35' },
      { name: 'Night Black', hex: '#131317' },
    ],
    specs: {
      displacementCc: 449,
      powerHp: 44.8,
      weightKg: 170,
      fuelCapacityL: 18,
      seatHeightMm: 847,
      engineType: 'Bicilindrico in linea, 4 tempi, Euro 5+. 44,8 CV (33 kW) a 8.500 giri',
      transmission: 'Cambio a 6 rapporti, finale a catena',
      frontBrakes:
        'Disco da 320 mm, pinza radiale a 4 pistoncini, ABS a due canali con posteriore disinseribile',
      suspension:
        'Forcella Kayaba da 41 mm, 208 mm di escursione. Dietro monoammortizzatore regolabile, 190 mm',
    },
    features: [
      'ABS disinseribile al posteriore',
      'Controllo di trazione disattivabile',
      'Cruscotto TFT da 5 pollici con navigazione integrata',
      '170 kg a secco, 190 in ordine di marcia',
      'Paramani, sella e manopole riscaldate sulla High Equipped',
    ],
  },
  {
    id: 'moto-morini-seiemmezzo-str',
    brand: 'Moto Morini',
    name: 'Seiemmezzo STR',
    claim: 'Niente di superfluo. Solo la strada.',
    subtitle: 'Naked da 649 cc, linea essenziale e guida diretta',
    featured: true,
    condition: 'nuovo',
    category: 'naked',
    categoryLabel: 'Strada',
    tagline: 'Niente fronzoli, solo il piacere di guidare',
    description:
      'Una naked dal disegno pulito, con le meccaniche a vista e un manubrio largo che rende immediati i cambi di direzione. Il bicilindrico da 649 cc tira con onestà, i freni sono Brembo e le sospensioni Kayaba sono regolabili davanti e dietro, cosa non scontata in questa fascia. Facile da vivere in città, piacevole quando la strada si fa curva.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/seiemmezzo-str/in-strada.webp',
    colorways: [
      {
        slug: 'bianco-carrara',
        name: 'Carrara White',
        hex: '#eef0f2',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/seiemmezzo-str/bianco-carrara/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/seiemmezzo-str/bianco-carrara/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/seiemmezzo-str/bianco-carrara/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/seiemmezzo-str/bianco-carrara/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/seiemmezzo-str/bianco-carrara/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/seiemmezzo-str/bianco-carrara/retro.webp' },
        ],
      },
      {
        slug: 'grigio',
        name: 'Smoky Anthracite',
        hex: '#3b3f45',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/seiemmezzo-str/grigio/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/seiemmezzo-str/grigio/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/seiemmezzo-str/grigio/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/seiemmezzo-str/grigio/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/seiemmezzo-str/grigio/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/seiemmezzo-str/grigio/retro.webp' },
        ],
      },
      {
        slug: 'rosso-passion',
        name: 'Red Passion',
        hex: '#b11226',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/seiemmezzo-str/rosso-passion/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/seiemmezzo-str/rosso-passion/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/seiemmezzo-str/rosso-passion/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/seiemmezzo-str/rosso-passion/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/seiemmezzo-str/rosso-passion/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/seiemmezzo-str/rosso-passion/retro.webp' },
        ],
      },
    ],
    price: 5590,
    priceNote:
      'Franco concessionario, prezzo promozionale 2025-2026. Prezzo standard € 6.340. Messa su strada esclusa.',
    colors: [
      { name: 'Starlight White', hex: '#eef1f3' },
      { name: 'Fire Red', hex: '#c01727', metallic: true },
      { name: 'Smoky Anthracite', hex: '#3b3f45', metallic: true },
    ],
    specs: {
      displacementCc: 649,
      powerHp: 61,
      weightKg: 200,
      fuelCapacityL: 14,
      seatHeightMm: 820,
      engineType: 'Bicilindrico in linea, 4 tempi, Euro 5. 61 CV (44,5 kW) a 8.250 giri',
      transmission: 'Cambio a 6 rapporti, finale a catena',
      frontBrakes: 'Doppio disco da 298 mm, pinze flottanti Brembo a 2 pistoncini',
      suspension:
        'Forcella rovesciata Kayaba da 43 mm regolabile, 120 mm di escursione. Dietro monoammortizzatore Kayaba regolabile, 120 mm',
    },
    features: [
      'Impianto frenante Brembo',
      'Sospensioni Kayaba regolabili davanti e dietro',
      'Pneumatici Pirelli',
      'Cruscotto TFT',
      'Navigazione tramite applicazione MotoFun',
    ],
  },
  {
    id: 'moto-morini-calibro-custom',
    brand: 'Moto Morini',
    name: 'Calibro Custom',
    claim: 'Il tempo lo decidi tu.',
    subtitle: 'Custom da 693 cc con sella a 690 mm e trasmissione a cinghia',
    condition: 'nuovo',
    category: 'cruiser',
    categoryLabel: 'Cruiser',
    tagline: 'Il piacere di arrivare tardi, ma arrivarci bene',
    description:
      'Sella a 690 millimetri da terra, pedane avanzate e trasmissione finale a cinghia: silenziosa, pulita e che non chiede la manutenzione di una catena. Il bicilindrico da 693 cc è lo stesso della X-Cape 700, qui tarato per spingere basso. Una custom pensata per i viaggi senza orologio, con la comodità al primo posto.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/calibro-custom/in-strada.webp',
    colorways: [
      {
        slug: 'nero',
        name: 'Nero',
        hex: '#141418',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/calibro-custom/nero/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/calibro-custom/nero/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/calibro-custom/nero/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/calibro-custom/nero/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/calibro-custom/nero/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/calibro-custom/nero/retro.webp' },
        ],
      },
      {
        slug: 'rosso',
        name: 'Rosso',
        hex: '#c01727',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/calibro-custom/rosso/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/calibro-custom/rosso/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/calibro-custom/rosso/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/calibro-custom/rosso/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/calibro-custom/rosso/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/calibro-custom/rosso/retro.webp' },
        ],
      },
    ],
    price: 7990,
    priceNote:
      'Prezzo indicativo franco concessionario, da confermare in salone. Messa su strada esclusa.',
    colors: [
      { name: 'Black Ebony', hex: '#141418' },
      { name: 'Garage Grey', hex: '#54585e', metallic: true },
    ],
    specs: {
      displacementCc: 693,
      powerHp: 69,
      weightKg: 198,
      fuelCapacityL: 15,
      seatHeightMm: 690,
      engineType: 'Bicilindrico in linea, 4 tempi, Euro 5+. 69 CV (50,8 kW) a 8.500 giri',
      transmission: 'Cambio a 6 rapporti, finale a cinghia',
      frontBrakes: 'Disco singolo da 320 mm, pinza flottante a 2 pistoncini, ABS',
      suspension:
        'Forcella tradizionale da 41 mm. Dietro doppio ammortizzatore con precarico molla regolabile',
    },
    features: [
      'Trasmissione finale a cinghia, silenziosa e pulita',
      'Sella a soli 690 mm da terra',
      'Cruise control',
      'Cruscotto TFT con connettività per lo smartphone',
      'Impianto frenante Brembo con ABS',
    ],
  },
  {
    id: 'moto-morini-calibro-bagger',
    brand: 'Moto Morini',
    name: 'Calibro Bagger',
    claim: 'Parti. Il resto è già a bordo.',
    subtitle: 'La Calibro da viaggio, con valigie e cupolino di serie',
    featured: true,
    condition: 'nuovo',
    category: 'bagger',
    categoryLabel: 'Bagger',
    tagline: 'Tutto quello che ti serve, già a bordo',
    description:
      'La versione da grande viaggio della Calibro. Valigie laterali e cupolino arrivano di serie, quindi non c’è da ricomprare mezzo accessorio dopo l’acquisto. Stessa sella bassa a 690 millimetri e stessa trasmissione a cinghia della Cruiser, con dodici chili in più che si sentono poco e si ripagano in protezione e capacità di carico.',
    // Fotografie ufficiali Moto Morini, scaricate con strumenti/importa-foto-morini.py
    roadImage: '/moto/calibro-bagger/in-strada.webp',
    colorways: [
      {
        slug: 'grigio-garage',
        name: 'Garage Grey',
        hex: '#54585e',
        views: [
          { id: 'lato-destro', label: 'Lato destro', src: '/moto/calibro-bagger/grigio-garage/lato-destro.webp' },
          { id: 'lato-sinistro', label: 'Lato sinistro', src: '/moto/calibro-bagger/grigio-garage/lato-sinistro.webp' },
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/calibro-bagger/grigio-garage/angolo-destro.webp' },
          { id: 'angolo-sinistro', label: 'Inclinata a sinistra', src: '/moto/calibro-bagger/grigio-garage/angolo-sinistro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/calibro-bagger/grigio-garage/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/calibro-bagger/grigio-garage/retro.webp' },
        ],
      },
      {
        slug: 'nero',
        name: 'Nero',
        hex: '#141418',
        views: [
          { id: 'angolo-destro', label: 'Inclinata a destra', src: '/moto/calibro-bagger/nero/angolo-destro.webp' },
          { id: 'fronte', label: 'Fronte', src: '/moto/calibro-bagger/nero/fronte.webp' },
          { id: 'retro', label: 'Retro', src: '/moto/calibro-bagger/nero/retro.webp' },
        ],
      },
    ],
    price: 8990,
    priceNote:
      'Prezzo indicativo franco concessionario, da confermare in salone. Messa su strada esclusa.',
    colors: [
      { name: 'Black Ebony', hex: '#141418' },
      { name: 'Garage Grey', hex: '#54585e', metallic: true },
    ],
    specs: {
      displacementCc: 693,
      powerHp: 69,
      weightKg: 200,
      fuelCapacityL: 15,
      seatHeightMm: 690,
      engineType: 'Bicilindrico in linea, 4 tempi, Euro 5+. 69 CV (50,8 kW) a 8.500 giri',
      transmission: 'Cambio a 6 rapporti, finale a cinghia',
      frontBrakes: 'Disco singolo da 320 mm, pinza flottante a 2 pistoncini, ABS',
      suspension:
        'Forcella tradizionale da 41 mm, 120 mm di escursione. Dietro doppio ammortizzatore con precarico molla regolabile',
    },
    features: [
      'Valigie laterali e cupolino di serie',
      'Trasmissione finale a cinghia',
      'Sella a 690 mm, 200 kg a secco e 212 in ordine di marcia',
      'Cruise control',
      'Cruscotto TFT con connettività per lo smartphone',
    ],
  },
];

/**
 * MOTO USATE — PRONTA CONSEGNA
 *
 * COME SI AGGIORNA, UNA VOLTA AL MESE
 * Questo e' l'unico elenco da toccare per il parco usato.
 * Aggiungi un blocco per ogni moto che entra, togli quelle vendute
 * oppure segnale con `sold: true` se vuoi lasciarle visibili.
 *
 * A differenza del nuovo, ogni voce qui e' un mezzo singolo: ha i suoi
 * chilometri, il suo anno e il suo prezzo.
 *
 * ESEMPIO COMPLETO, da copiare e compilare:
 *
 * {
 *   id: 'usato-xcape-650-2022',
 *   brand: 'Moto Morini',
 *   name: 'X-Cape 650',
 *   subtitle: 'Unico proprietario, tagliandi regolari',
 *   condition: 'usato',
 *   used: {
 *     year: 2022,
 *     km: 12400,
 *     stockCode: 'U-014',
 *     warrantyMonths: 12,
 *     previousOwners: 1,
 *   },
 *   category: 'adventure',
 *   categoryLabel: 'Adventure',
 *   tagline: 'Pronta da portare via',
 *   description: 'Moto controllata nella nostra officina prima della vendita.',
 *   price: 6900,
 *   image: '/moto/usato-xcape-650-2022/scheda-principale.jpg',
 *   colors: [],
 *   specs: { displacementCc: 649, powerHp: 60 },
 *   features: ['Valigie laterali', 'Paramotore', 'Gomme nuove'],
 * },
 */
export const MOTO_USATE: Motorcycle[] = [
  // Nessuna moto usata inserita al momento.
  // Copia l'esempio qui sopra, incollalo dentro queste parentesi e compilalo.
];

/** Tutto il catalogo, nuovo e usato insieme. */
export const MOTORCYCLES: Motorcycle[] = [...MOTO_NUOVE, ...MOTO_USATE];

/** Le moto in vetrina sulla home. Se non ne hai segnata nessuna, prende le prime. */
export function getVetrina(quante = 3): Motorcycle[] {
  const scelte = MOTORCYCLES.filter((m) => m.featured && !m.used?.sold);
  return (scelte.length > 0 ? scelte : MOTORCYCLES).slice(0, quante);
}
