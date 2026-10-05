import { cookies } from 'next/headers';

/**
 * L'accesso all'area riservata.
 *
 * COME FUNZIONA
 * C'e' una sola password, decisa da chi gestisce il sito e tenuta fra le
 * impostazioni di Vercel. Chi la indovina riceve un biglietto firmato che
 * resta nel suo browser per una settimana.
 *
 * PERCHE' UN BIGLIETTO FIRMATO E NON LA PASSWORD NEL COOKIE
 * Se nel cookie mettessimo la password, chiunque metta le mani sul
 * computer del salone potrebbe leggerla aprendo gli strumenti del browser,
 * e poi usarla altrove. Il biglietto invece non contiene la password: e'
 * una scadenza piu' una firma fatta con un segreto che sta solo sul
 * server. Si puo' verificare ma non si puo' fabbricare, e scade da solo.
 *
 * IL CONFRONTO DELLA PASSWORD
 * Si confrontano i due testi carattere per carattere fino in fondo anche
 * quando il primo e' gia' sbagliato. Confrontarli normalmente impiega piu'
 * tempo quando l'inizio e' giusto, e da quella differenza di tempo si puo'
 * indovinare la password una lettera per volta. E' un attacco reale, e
 * costa due righe evitarlo.
 */

const NOME_BIGLIETTO = 'dueffe-accesso';
const DURATA_GIORNI = 7;

function segreto(): string {
  // Senza un segreto dedicato usiamo la password stessa: cambiarla
  // invalida tutti i biglietti in giro, che e' il comportamento giusto.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function confrontoCostante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let differenza = 0;
  for (let i = 0; i < a.length; i++) {
    differenza |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return differenza === 0;
}

async function firma(testo: string): Promise<string> {
  const chiave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segreto()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const firmato = await crypto.subtle.sign('HMAC', chiave, new TextEncoder().encode(testo));
  return Array.from(new Uint8Array(firmato))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** La password e' quella giusta? */
export function passwordGiusta(tentativo: string): boolean {
  const vera = process.env.ADMIN_PASSWORD;
  if (!vera) return false;
  return confrontoCostante(tentativo, vera);
}

/** Vero se e' stata impostata una password: senza, l'area non si apre. */
export const accessoConfigurato = Boolean(process.env.ADMIN_PASSWORD);

/** Prepara il biglietto da mettere nel cookie. */
export async function creaBiglietto(): Promise<string> {
  const scadenza = Date.now() + DURATA_GIORNI * 24 * 60 * 60 * 1000;
  return `${scadenza}.${await firma(String(scadenza))}`;
}

/** Il biglietto e' valido e non scaduto? */
export async function bigliettoValido(biglietto: string | undefined): Promise<boolean> {
  if (!biglietto || !segreto()) return false;
  const [scadenza, firmato] = biglietto.split('.');
  if (!scadenza || !firmato) return false;
  if (Number(scadenza) < Date.now()) return false;
  return confrontoCostante(firmato, await firma(scadenza));
}

/** Chi sta chiedendo la pagina ha fatto l'accesso? */
export async function haFattoAccesso(): Promise<boolean> {
  const biscotti = await cookies();
  return bigliettoValido(biscotti.get(NOME_BIGLIETTO)?.value);
}

export { NOME_BIGLIETTO, DURATA_GIORNI };
