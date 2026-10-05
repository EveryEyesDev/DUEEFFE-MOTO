import { NextRequest, NextResponse } from 'next/server';
import { haFattoAccesso } from '../../../../src/lib/accesso';
import { supabaseScrittura, SECCHIO_FOTO } from '../../../../src/lib/supabase';

/**
 * Caricamento delle fotografie dall'area riservata.
 *
 * DOVE FINISCONO
 * Non in public/, perche' su Vercel i file del sito sono in sola lettura:
 * una fotografia scritta li' sparirebbe alla pubblicazione successiva.
 * Vanno nell'archivio di Supabase, che torna un indirizzo pubblico da
 * mettere nella scheda della moto come qualunque altra immagine.
 *
 * COSA ACCETTIAMO
 * Solo immagini, e non piu' di otto megabyte l'una. Il controllo sul tipo
 * non si fida del nome del file ne' di quello che dichiara il browser:
 * guarda i primi byte del contenuto, che sono diversi per ogni formato e
 * non si possono camuffare rinominando il file.
 */

const PESO_MASSIMO = 8 * 1024 * 1024;

/** I formati che accettiamo, riconosciuti dai primi byte del file. */
const FORMATI: { firma: number[]; tipo: string; estensione: string }[] = [
  { firma: [0xff, 0xd8, 0xff], tipo: 'image/jpeg', estensione: 'jpg' },
  { firma: [0x89, 0x50, 0x4e, 0x47], tipo: 'image/png', estensione: 'png' },
  { firma: [0x52, 0x49, 0x46, 0x46], tipo: 'image/webp', estensione: 'webp' },
];

function riconosci(byte: Uint8Array): { tipo: string; estensione: string } | null {
  for (const formato of FORMATI) {
    if (formato.firma.every((b, i) => byte[i] === b)) {
      // Il WEBP comincia come un RIFF qualunque: la conferma sta piu' avanti.
      if (formato.estensione === 'webp') {
        const marchio = String.fromCharCode(...byte.slice(8, 12));
        if (marchio !== 'WEBP') continue;
      }
      return { tipo: formato.tipo, estensione: formato.estensione };
    }
  }
  return null;
}

export async function POST(richiesta: NextRequest) {
  if (!(await haFattoAccesso())) {
    return NextResponse.json({ errore: 'Devi fare l’accesso.' }, { status: 401 });
  }

  const db = supabaseScrittura();
  if (!db) {
    return NextResponse.json(
      { errore: "L'archivio delle fotografie non e’ configurato." },
      { status: 503 },
    );
  }

  const modulo = await richiesta.formData().catch(() => null);
  const file = modulo?.get('file');
  const cartella = String(modulo?.get('cartella') ?? 'varie').replace(/[^a-z0-9-]/gi, '-');

  if (!(file instanceof File)) {
    return NextResponse.json({ errore: 'Nessun file ricevuto.' }, { status: 400 });
  }
  if (file.size > PESO_MASSIMO) {
    return NextResponse.json(
      { errore: 'La fotografia e’ troppo pesante: il limite e’ 8 MB.' },
      { status: 400 },
    );
  }

  const contenuto = new Uint8Array(await file.arrayBuffer());
  const formato = riconosci(contenuto);
  if (!formato) {
    return NextResponse.json(
      { errore: 'Il file non e’ una fotografia. Accettiamo JPG, PNG e WEBP.' },
      { status: 400 },
    );
  }

  const nome = `${cartella}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${formato.estensione}`;

  const { error } = await db.storage.from(SECCHIO_FOTO).upload(nome, contenuto, {
    contentType: formato.tipo,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ errore: error.message }, { status: 500 });
  }

  const { data } = db.storage.from(SECCHIO_FOTO).getPublicUrl(nome);
  return NextResponse.json({ ok: true, indirizzo: data.publicUrl });
}
