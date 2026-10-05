import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Il collegamento a Supabase, dove vivono il catalogo e le fotografie
 * caricate dal salone.
 *
 * DUE CHIAVI, DUE PERMESSI DIVERSI
 * Quella pubblica puo' solo leggere, e sta nel browser di chiunque visiti
 * il sito: va benissimo, perche' il catalogo e' pubblico per definizione.
 * Quella di servizio puo' anche scrivere, e non deve mai uscire dal
 * server: la usiamo solo dentro l'area riservata, dopo che il responsabile
 * ha fatto l'accesso.
 *
 * SE LE CHIAVI NON CI SONO
 * Il sito non si rompe: torna None e chi lo chiama ricade sul catalogo
 * scritto nel codice. Serve a due cose. In sviluppo si lavora senza dover
 * configurare niente; e il giorno in cui Supabase avesse un disservizio, il
 * sito resta in piedi con l'ultimo catalogo pubblicato invece di mostrare
 * una pagina vuota a chi cerca una moto.
 */

const INDIRIZZO = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHIAVE_PUBBLICA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CHIAVE_DI_SERVIZIO = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Vero quando il database e' configurato e si puo' usare. */
export const supabaseConfigurato = Boolean(INDIRIZZO && CHIAVE_PUBBLICA);

/** Collegamento in sola lettura, buono anche nel browser. */
export function supabaseLettura(): SupabaseClient | null {
  if (!INDIRIZZO || !CHIAVE_PUBBLICA) return null;
  return createClient(INDIRIZZO, CHIAVE_PUBBLICA, {
    auth: { persistSession: false },
  });
}

/**
 * Collegamento con permesso di scrittura. Solo lato server.
 *
 * Se qualcuno lo chiamasse da un componente del browser la chiave non
 * sarebbe nemmeno definita, perche' non ha il prefisso NEXT_PUBLIC_ e
 * Next non la manda al client: tornerebbe None invece di esporla.
 */
export function supabaseScrittura(): SupabaseClient | null {
  if (!INDIRIZZO || !CHIAVE_DI_SERVIZIO) return null;
  return createClient(INDIRIZZO, CHIAVE_DI_SERVIZIO, {
    auth: { persistSession: false },
  });
}

/** Il contenitore delle fotografie caricate dal salone. */
export const SECCHIO_FOTO = 'foto-moto';
