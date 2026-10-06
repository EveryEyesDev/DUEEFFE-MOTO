import { NextRequest, NextResponse } from 'next/server';
import {
  haFattoAccesso,
  passwordGiusta,
  improntaDi,
  saleNuovo,
  creaBiglietto,
  NOME_BIGLIETTO,
  DURATA_GIORNI,
} from '../../../../src/lib/accesso';
import { passwordImpostata, salvaPassword } from '../../../../src/lib/impostazioni';

/**
 * Cambio della password dell'area riservata.
 *
 * SI CHIEDE ANCHE QUELLA VECCHIA
 * Chi ha fatto l'accesso potrebbe aver trovato il computer del salone
 * aperto e incustodito. Chiedere la password in corso rende quel caso
 * innocuo: si puo' guardare il catalogo, non ci si puo' impadronire
 * dell'accesso cambiando la serratura.
 *
 * DOPO IL CAMBIO
 * Rilasciamo un biglietto nuovo, perche' quello vecchio era firmato con la
 * password precedente e da quel momento non vale piu'. Senza, il
 * responsabile si ritroverebbe buttato fuori subito dopo aver cambiato la
 * password, e penserebbe di aver sbagliato qualcosa.
 */

const LUNGHEZZA_MINIMA = 10;

export async function POST(richiesta: NextRequest) {
  if (!(await haFattoAccesso())) {
    return NextResponse.json({ errore: 'Devi fare l’accesso.' }, { status: 401 });
  }

  const corpo = await richiesta.json().catch(() => ({}));
  const vecchia = typeof corpo.vecchia === 'string' ? corpo.vecchia : '';
  const nuova = typeof corpo.nuova === 'string' ? corpo.nuova : '';

  if (!(await passwordGiusta(vecchia, await passwordImpostata()))) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ errore: 'La password attuale non e’ corretta.' }, { status: 401 });
  }

  if (nuova.length < LUNGHEZZA_MINIMA) {
    return NextResponse.json(
      { errore: `La password nuova deve avere almeno ${LUNGHEZZA_MINIMA} caratteri.` },
      { status: 400 },
    );
  }
  if (nuova === vecchia) {
    return NextResponse.json(
      { errore: 'La password nuova e’ uguale a quella di adesso.' },
      { status: 400 },
    );
  }

  const sale = saleNuovo();
  const problema = await salvaPassword({ impronta: await improntaDi(nuova, sale), sale });
  if (problema) return NextResponse.json({ errore: problema }, { status: 500 });

  const risposta = NextResponse.json({ ok: true });
  risposta.cookies.set(NOME_BIGLIETTO, await creaBiglietto(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURATA_GIORNI * 24 * 60 * 60,
  });
  return risposta;
}
