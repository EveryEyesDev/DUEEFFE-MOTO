import { NextRequest, NextResponse } from 'next/server';
import {
  creaBiglietto,
  passwordGiusta,
  NOME_BIGLIETTO,
  DURATA_GIORNI,
  accessoConfigurato,
} from '../../../../src/lib/accesso';

/**
 * Entrata e uscita dall'area riservata.
 *
 * L'ATTESA DOPO UN ERRORE
 * A ogni password sbagliata rispondiamo con mezzo secondo di ritardo. Non
 * da' fastidio a una persona che ha solo sbagliato a digitare, ma rende
 * lentissimo il lavoro di un programma che prova migliaia di password una
 * dopo l'altra.
 */

export async function POST(richiesta: NextRequest) {
  if (!accessoConfigurato) {
    return NextResponse.json(
      { errore: "L'area riservata non e' ancora configurata su questo sito." },
      { status: 503 },
    );
  }

  const corpo = await richiesta.json().catch(() => ({}));
  const password = typeof corpo.password === 'string' ? corpo.password : '';

  if (!passwordGiusta(password)) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ errore: 'Password non corretta.' }, { status: 401 });
  }

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

/** Uscita: si butta via il biglietto. */
export async function DELETE() {
  const risposta = NextResponse.json({ ok: true });
  risposta.cookies.set(NOME_BIGLIETTO, '', { path: '/', maxAge: 0 });
  return risposta;
}
