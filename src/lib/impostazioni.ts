import { supabaseScrittura, supabaseLettura } from './supabase';

/**
 * Le impostazioni dell'area riservata, custodite nel database.
 *
 * Per ora ce n'e' una sola: la password scelta dal responsabile. Sta qui e
 * non fra le variabili di Vercel perche' deve poterla cambiare lui, e le
 * variabili di Vercel le tocca solo chi gestisce il sito.
 */

export interface PasswordImpostata {
  impronta: string;
  sale: string;
}

const CHIAVE_PASSWORD = 'password-admin';

/** La password scelta dal responsabile, se ne ha scelta una. */
export async function passwordImpostata(): Promise<PasswordImpostata | null> {
  const db = supabaseLettura();
  if (!db) return null;
  const { data, error } = await db
    .from('impostazioni')
    .select('valore')
    .eq('chiave', CHIAVE_PASSWORD)
    .maybeSingle();
  if (error || !data?.valore) return null;
  const valore = data.valore as Partial<PasswordImpostata>;
  if (!valore.impronta || !valore.sale) return null;
  return { impronta: valore.impronta, sale: valore.sale };
}

/** Scrive la password nuova. Torna il messaggio di errore, o null se e' andata. */
export async function salvaPassword(valore: PasswordImpostata): Promise<string | null> {
  const db = supabaseScrittura();
  if (!db) return "Il database non e\u2019 collegato: la password non si puo\u2019 cambiare.";
  const { error } = await db
    .from('impostazioni')
    .upsert({ chiave: CHIAVE_PASSWORD, valore }, { onConflict: 'chiave' });
  return error ? error.message : null;
}
