/**
 * Dati ufficiali DUE EFFE MOTO SRL.
 *
 * Unico punto di verita' per contatti e dati societari:
 * ogni componente legge da qui, cosi' un aggiornamento si fa in un posto solo.
 *
 * I campi lasciati vuoti NON vengono mostrati nell'interfaccia:
 * valorizzali quando avrai il dato definitivo.
 */

export const SITE = {
  /** Ragione sociale completa, usata nei dati legali e nel footer. */
  legalName: 'DUE EFFE MOTO SRL',

  /** Nome commerciale, usato nei titoli e nei testi. */
  brandName: 'DUEFFE MOTO',

  /** Claim breve mostrato sotto il logo. */
  tagline: 'Concessionaria e officina moto a Cavallino, Lecce.',

  /** Sito ufficiale, come indicato sulla scheda Google dell'attivita'. */
  website: 'https://www.dueeffemoto.it',

  /**
   * Fotografia di sfondo dell'apertura.
   * Lascia vuoto per usare solo il disegno vettoriale.
   * Per usare una vostra foto: salvala in /public/foto/ e scrivi qui
   * il percorso, ad esempio '/foto/showroom.jpg'.
   * Usa una foto vostra: quelle su Google Maps sono di chi le ha caricate.
   */
  heroImage: '',

  address: {
    street: 'Via di Leuca Tempi Nuovi N.148',
    postalCode: '73020',
    city: 'Cavallino',
    province: 'LE',
    provinceName: 'Lecce',
    country: 'IT',
    /** Riga unica pronta da stampare. */
    full: 'Via di Leuca Tempi Nuovi N.148, 73020 Cavallino (Lecce)',
  },

  /** Coordinate della sede, usate per la mappa e per i dati strutturati. */
  geo: {
    latitude: 40.328663,
    longitude: 18.181386,
  },

  phone: {
    /** Come viene mostrato a schermo. */
    display: '+39 0832 098110',
    /** Formato E.164 per l'attributo href="tel:". */
    href: 'tel:+390832098110',
  },

  /** DA COMPILARE: indirizzo email ufficiale. Finche' e' vuoto non viene mostrato. */
  email: '',

  /** DA COMPILARE: numero WhatsApp in formato internazionale senza simboli, es. '393331234567'. */
  whatsapp: '',

  legal: {
    vatNumber: '04783900758',
    sdiCode: '2HE9UNC',
  },

  /**
   * Orari di apertura.
   * Presi dalla scheda Google dell'attivita' il 2 ottobre 2026.
   * Se cambiano, aggiornali qui e anche su Google.
   */
  openingHours: [
    { days: 'Lunedì – Venerdì', hours: '09:15 – 13:00 / 16:00 – 19:30' },
    { days: 'Sabato', hours: '09:00 – 13:00' },
    { days: 'Domenica', hours: 'Chiuso' },
  ] as { days: string; hours: string }[],

  /**
   * Valutazione pubblica su Google.
   *
   * Mostriamo SOLO il voto medio e il numero di recensioni, mai i testi
   * ne' i nomi di chi li ha scritti: quelli sono dati personali di persone
   * che non hanno acconsentito a comparire su questo sito, e sceglierne
   * alcune farebbe scattare l'obbligo di dichiarare come sono state
   * selezionate. Chi vuole leggerle le trova su Google in un clic.
   *
   * E' una fotografia a una data precisa, perche' il numero cresce:
   * aggiorna `rating`, `count` e `asOf` ogni tanto.
   * Metti `enabled: false` per non mostrare la sezione.
   */
  googleReviews: {
    enabled: true,
    rating: 4.6,
    count: 249,
    asOf: 'ottobre 2026',
    /** Link diretto alla scheda, per leggere tutte le recensioni. */
    url: 'https://maps.app.goo.gl/TSX4yev59Ei9LzGe7',
  },


  /**
   * Voci della striscia scorrevole sotto l'apertura.
   * Tienile corte: sono promesse, non descrizioni.
   */
  marquee: [
    'Nuovo e usato',
    'Permuta',
    'Finanziamenti',
    'Officina',
    'Pratiche e immatricolazioni',
    'Assistenza multimarca',
  ] as string[],

  /** Profili social. Le voci senza indirizzo non vengono mostrate. */
  social: {
    instagram: 'https://www.instagram.com/due_effe_moto',
    facebook: 'https://www.facebook.com/share/1BGBZjUWAf/',
    youtube: '',
  },

  /**
   * Tutti i marchi trattati, nell'ordine in cui compaiono
   * sulla scheda Google dell'attivita'.
   */
  brands: [
    'Moto Morini',
    'Voge',
    'KTM',
    'Husqvarna',
    'Suzuki',
    'Moto Guzzi',
    'Aprilia',
    'Piaggio',
  ],

  /**
   * I marchi su cui il sito punta i riflettori, citati nei testi
   * di apertura e nei metadati. Gli altri restano nella striscia marchi.
   */
  primaryBrands: ['Moto Morini', 'Voge', 'Suzuki'],
} as const;

/** Indicazioni stradali verso la sede: apre la navigazione sul telefono. */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${SITE.geo.latitude},${SITE.geo.longitude}`;

/** Link alla scheda Google Maps della sede. */
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city} ${SITE.address.province}`,
)}`;

/**
 * Mappa incorporabile centrata sulla sede.
 *
 * Usiamo l'incorporamento classico di Google Maps, che disegna le mattonelle
 * come normali immagini: funziona anche sui browser con l'accelerazione
 * grafica disattivata. L'incorporamento di OpenStreetMap, invece, oggi
 * richiede WebGL e su quelle macchine mostrerebbe un riquadro di errore.
 */
export const MAP_EMBED_URL = (() => {
  const { latitude, longitude } = SITE.geo;
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&hl=it&output=embed`;
})();
