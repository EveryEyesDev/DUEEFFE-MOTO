import { Motorcycle } from '../types';
import { MOTO_NUOVE, MOTO_USATE } from '../data/motorcycles';
import { supabaseLettura } from './supabase';

/**
 * Da dove arrivano le moto che il sito mostra.
 *
 * DUE SORGENTI, UNA SOLA VERITA'
 * Il catalogo di partenza e' scritto nel codice, in src/data/motorcycles.ts:
 * sono le 53 moto importate dai siti dei costruttori, con fotografie e
 * schede tecniche. Quello resta, ed e' la base.
 *
 * Sopra ci sta il database, dove finisce tutto quello che il responsabile
 * fa dall'area riservata: le moto usate che aggiunge, le modifiche a una
 * scheda, una moto nuova che vuole togliere dal catalogo.
 *
 * Qui le due cose si uniscono. Una moto presente in entrambi vince nella
 * versione del database, perche' e' quella toccata per ultima da una
 * persona. Le moto che esistono solo nel database si aggiungono in fondo.
 *
 * SE IL DATABASE NON RISPONDE
 * Il sito mostra il catalogo di partenza e nessuno se ne accorge, tranne
 * che le ultime modifiche non si vedono. E' una scelta: un cliente che
 * cerca una moto deve trovare qualcosa, non una pagina vuota.
 */

/** Com'e' fatta una riga nella tabella delle moto. */
interface RigaMoto {
  id: string;
  dati: Motorcycle;
  nascosta: boolean;
}

/** Quanto a lungo il sito tiene buona una copia del catalogo, in secondi. */
export const RINFRESCO = 60;

async function daDatabase(): Promise<RigaMoto[] | null> {
  const db = supabaseLettura();
  if (!db) return null;

  const { data, error } = await db.from('moto').select('id, dati, nascosta');
  if (error || !data) return null;
  return data as RigaMoto[];
}

/**
 * Mette insieme catalogo scritto nel codice e modifiche dal database.
 */
function unisci(
  base: Motorcycle[],
  righe: RigaMoto[] | null,
  anteprima = false,
): Motorcycle[] {
  if (!righe) return base;

  const perId = new Map(righe.map((r) => [r.id, r]));
  const uscita: Motorcycle[] = [];

  for (const moto of base) {
    const riga = perId.get(moto.id);
    if (!riga) {
      uscita.push(moto);
      continue;
    }
    perId.delete(moto.id);
    // Una moto segnata come nascosta sparisce dal sito ma resta nel
    // database: cosi' si puo' rimettere senza reinserire tutto. In
    // anteprima si vede lo stesso, che e' il motivo per cui esiste.
    if (!riga.nascosta || anteprima) uscita.push(riga.dati);
  }

  // Quello che resta nella mappa esiste solo nel database: sono le moto
  // aggiunte dal salone, soprattutto l'usato.
  for (const riga of perId.values()) {
    if (!riga.nascosta || anteprima) uscita.push(riga.dati);
  }

  return uscita;
}

/**
 * Tutte le moto, nuove e usate, come le vede chi visita il sito.
 *
 * Con l'anteprima accesa si vedono anche le moto nascoste: serve al
 * responsabile per guardare come verra' una scheda prima di pubblicarla.
 */
export async function leggiCatalogo(anteprima = false): Promise<{
  nuove: Motorcycle[];
  usate: Motorcycle[];
}> {
  const righe = await daDatabase();
  const tutte = unisci([...MOTO_NUOVE, ...MOTO_USATE], righe, anteprima);
  return {
    nuove: tutte.filter((m) => m.condition !== 'usato'),
    usate: tutte.filter((m) => m.condition === 'usato'),
  };
}

/**
 * Tutte le moto per l'area riservata, comprese quelle nascoste.
 *
 * Qui serve vedere anche quello che il sito non mostra, altrimenti una
 * moto tolta per sbaglio non si potrebbe piu' ritrovare.
 */
export async function leggiCatalogoCompleto(): Promise<
  { moto: Motorcycle; nascosta: boolean; nelDatabase: boolean }[]
> {
  const righe = await daDatabase();
  const perId = new Map((righe ?? []).map((r) => [r.id, r]));
  const uscita: { moto: Motorcycle; nascosta: boolean; nelDatabase: boolean }[] = [];

  for (const moto of [...MOTO_NUOVE, ...MOTO_USATE]) {
    const riga = perId.get(moto.id);
    if (riga) perId.delete(moto.id);
    uscita.push({
      moto: riga ? riga.dati : moto,
      nascosta: riga?.nascosta ?? false,
      nelDatabase: Boolean(riga),
    });
  }
  for (const riga of perId.values()) {
    uscita.push({ moto: riga.dati, nascosta: riga.nascosta, nelDatabase: true });
  }
  return uscita;
}

/** Una moto sola, per la pagina di modifica. */
export async function leggiMoto(id: string): Promise<Motorcycle | null> {
  const tutte = await leggiCatalogoCompleto();
  return tutte.find((v) => v.moto.id === id)?.moto ?? null;
}
