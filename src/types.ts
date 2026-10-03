export type BikeCategory = 'all' | 'adventure' | 'naked' | 'cruiser' | 'bagger';

export interface BikeColorOption {
  name: string;
  hex: string;
  metallic?: boolean;
}

/**
 * Scheda tecnica. Tutti i campi sono opzionali:
 * i dati non ancora confermati dalla casa madre non vengono mostrati,
 * al loro posto compare un segnaposto.
 */
export interface BikeSpec {
  powerHp?: number;
  torqueNm?: number;
  displacementCc?: number;
  weightKg?: number;
  topSpeedKmH?: number;
  /** Secondi nello 0-100 km/h. */
  accel0100?: number;
  fuelCapacityL?: number;
  seatHeightMm?: number;
  engineType?: string;
  transmission?: string;
  frontBrakes?: string;
  suspension?: string;
}

/** Reparto del catalogo: moto nuove a listino oppure usato in pronta consegna. */
export type BikeCondition = 'nuovo' | 'usato';

/**
 * Dati che riguardano solo l'usato.
 *
 * A differenza di un modello nuovo, ogni moto usata e' un mezzo singolo:
 * ha i suoi chilometri, il suo anno e il suo prezzo.
 */
export interface UsedDetails {
  /** Anno di immatricolazione. */
  year: number;
  /** Chilometri percorsi. */
  km: number;
  /** Codice interno o targa, per ritrovare il mezzo in salone. */
  stockCode?: string;
  /** Mesi di garanzia inclusi. */
  warrantyMonths?: number;
  /** Numero di proprietari precedenti. */
  previousOwners?: number;
  /** Metti true quando e' venduta: resta visibile ma segnata. */
  sold?: boolean;
}

export interface Motorcycle {
  id: string;
  /** Marchio: Moto Morini, Voge, Suzuki e gli altri trattati. */
  brand: string;
  name: string;
  /** Frase evocativa per la striscia a tutto schermo. */
  claim?: string;
  subtitle: string;
  /** In quale reparto del catalogo compare. */
  condition: BikeCondition;
  /** Compilato solo per l'usato. */
  used?: UsedDetails;
  category: Exclude<BikeCategory, 'all'>;
  categoryLabel: string;
  tagline: string;
  description: string;
  badge?: string;
  /** In vetrina in home. Se nessuna moto lo ha, la home mostra le prime disponibili. */
  featured?: boolean;
  /** Prezzo in euro. Per il nuovo e' il listino, per l'usato il prezzo di vendita. */
  price?: number;
  /**
   * Come va letto il prezzo: allestimenti, promozioni, cosa e' incluso.
   * Compare sotto la cifra, in piccolo.
   */
  priceNote?: string;
  /** Rata mensile indicativa in euro. Assente finche' non e' confermata. */
  monthlyEstimate?: number;
  /** Percorso della fotografia in /public. Assente finche' non arrivano le foto. */
  image?: string;
  /** Galleria fotografica del modello, percorsi dentro /public. */
  gallery?: string[];
  colors: BikeColorOption[];
  specs: BikeSpec;
  features: string[];
}

export interface ContactRequest {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  bikeId?: string;
  bikeName?: string;
}
