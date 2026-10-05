import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { haFattoAccesso } from '../../../../src/lib/accesso';
import { supabaseScrittura } from '../../../../src/lib/supabase';
import { Motorcycle } from '../../../../src/types';

/**
 * Salvataggio e cancellazione di una moto dall'area riservata.
 *
 * OGNI RICHIESTA CONTROLLA L'ACCESSO
 * Non basta che la pagina dell'area riservata sia protetta: queste rotte
 * rispondono a chiunque le chiami, anche a chi non ha mai aperto il sito.
 * Percio' il controllo sta qui dentro, prima di toccare qualsiasi cosa.
 *
 * DOPO IL SALVATAGGIO
 * Le pagine pubbliche tengono una copia del catalogo per un minuto, per
 * essere veloci. Dopo una modifica diciamo a Next di buttarla: cosi' il
 * responsabile salva e vede subito il risultato sul sito, senza aspettare.
 */

function campiMinimi(moto: Partial<Motorcycle>): string | null {
  if (!moto.id || !/^[a-z0-9-]+$/.test(moto.id)) {
    return "Serve un codice fatto di lettere minuscole, numeri e trattini (per esempio 'honda-cb500-usata').";
  }
  if (!moto.brand?.trim()) return 'Manca la marca.';
  if (!moto.name?.trim()) return 'Manca il nome del modello.';
  return null;
}

export async function POST(richiesta: NextRequest) {
  if (!(await haFattoAccesso())) {
    return NextResponse.json({ errore: 'Devi fare l’accesso.' }, { status: 401 });
  }

  const db = supabaseScrittura();
  if (!db) {
    return NextResponse.json(
      { errore: 'Il database non e’ configurato: controlla le chiavi Supabase.' },
      { status: 503 },
    );
  }

  const corpo = await richiesta.json().catch(() => null);
  if (!corpo?.moto) {
    return NextResponse.json({ errore: 'Richiesta vuota.' }, { status: 400 });
  }

  const moto = corpo.moto as Motorcycle;
  const problema = campiMinimi(moto);
  if (problema) return NextResponse.json({ errore: problema }, { status: 400 });

  const { error } = await db.from('moto').upsert(
    {
      id: moto.id,
      dati: moto,
      nascosta: Boolean(corpo.nascosta),
      aggiornata: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    return NextResponse.json({ errore: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/moto');
  return NextResponse.json({ ok: true });
}

/**
 * Toglie una moto.
 *
 * Quelle che arrivano dal catalogo scritto nel codice non si possono
 * cancellare davvero: si segnano come nascoste, cosi' spariscono dal sito
 * ma si possono rimettere. Quelle aggiunte dal salone invece si tolgono
 * per davvero.
 */
export async function DELETE(richiesta: NextRequest) {
  if (!(await haFattoAccesso())) {
    return NextResponse.json({ errore: 'Devi fare l’accesso.' }, { status: 401 });
  }
  const db = supabaseScrittura();
  if (!db) {
    return NextResponse.json({ errore: 'Database non configurato.' }, { status: 503 });
  }

  const id = new URL(richiesta.url).searchParams.get('id');
  if (!id) return NextResponse.json({ errore: 'Manca il codice.' }, { status: 400 });

  const { error } = await db.from('moto').delete().eq('id', id);
  if (error) return NextResponse.json({ errore: error.message }, { status: 500 });

  revalidatePath('/');
  revalidatePath('/moto');
  return NextResponse.json({ ok: true });
}
