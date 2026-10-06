import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { haFattoAccesso } from '../../../../src/lib/accesso';

/**
 * Accende e spegne l'anteprima del sito.
 *
 * A COSA SERVE
 * Il responsabile inserisce una moto, la lascia nascosta, e vuole vedere
 * come verra' sul sito prima di mostrarla a tutti. Con l'anteprima accesa
 * vede le pagine pubbliche come saranno, moto nascoste comprese; chi non
 * ha fatto l'accesso continua a vedere il sito pubblicato, invariato.
 *
 * PERCHE' LA MODALITA' BOZZA DI NEXT E NON UN PARAMETRO NELL'INDIRIZZO
 * Un indirizzo del tipo /moto?anteprima=1 sarebbe copiabile e
 * condivisibile: basta che finisca in una chat e chiunque vede le bozze.
 * La modalita' bozza invece lavora con un biscotto firmato dal server, che
 * resta su quel browser e non viaggia nei collegamenti.
 *
 * E soprattutto non rallenta il sito: Next continua a servire a tutti gli
 * altri la copia gia' pronta, e genera la pagina al volo solo per chi ha
 * l'anteprima accesa.
 */

export async function POST(richiesta: NextRequest) {
  if (!(await haFattoAccesso())) {
    return NextResponse.json({ errore: 'Devi fare l\u2019accesso.' }, { status: 401 });
  }
  const bozza = await draftMode();
  bozza.enable();
  const dove = new URL(richiesta.url).searchParams.get('vai') ?? '/moto';
  // Solo percorsi interni: un indirizzo esterno qui diventerebbe un modo
  // per rimbalzare le persone altrove partendo dal nostro dominio.
  const sicuro = dove.startsWith('/') && !dove.startsWith('//') ? dove : '/moto';
  return NextResponse.json({ ok: true, vai: sicuro });
}

export async function DELETE() {
  const bozza = await draftMode();
  bozza.disable();
  return NextResponse.json({ ok: true });
}
