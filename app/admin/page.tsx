import React from 'react';
import Link from 'next/link';
import { Plus, Pencil, EyeOff, Database, AlertTriangle } from 'lucide-react';
import { leggiCatalogoCompleto } from '../../src/lib/catalogo';
import { supabaseConfigurato } from '../../src/lib/supabase';
import { DueffeLogo } from '../../src/components/DueffeLogo';
import { EsciButton } from '../../src/components/admin/EsciButton';

export const dynamic = 'force-dynamic';

/**
 * L'elenco di tutto il catalogo, come lo vede il responsabile.
 *
 * Usate per prime: sono quelle che cambiano ogni mese, mentre le nuove si
 * toccano di rado. Chi apre questa pagina quasi sempre viene per l'usato.
 */
export default async function Admin() {
  const tutte = await leggiCatalogoCompleto();
  const usate = tutte.filter((v) => v.moto.condition === 'usato');
  const nuove = tutte.filter((v) => v.moto.condition !== 'usato');

  return (
    <main className="min-h-screen bg-[#070709] text-slate-100">
      <header className="border-b border-white/10 bg-[#050507] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DueffeLogo size="sm" />
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Gestione catalogo
            </span>
          </div>
          <EsciButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8 space-y-10">
        {!supabaseConfigurato && (
          <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-100/90">
              <strong className="block mb-1">Il database non e&rsquo; ancora collegato.</strong>
              Puoi girare per le pagine e vedere i moduli, ma quello che salvi non viene
              conservato. Servono le chiavi di Supabase fra le variabili del sito.
            </div>
          </div>
        )}

        <Sezione
          titolo="Moto usate"
          sottotitolo="Il parco usato, da aggiornare ogni mese"
          voci={usate}
          vuoto="Nessuna moto usata. Aggiungi la prima col pulsante qui sopra."
          nuovaCondizione="usato"
        />

        <Sezione
          titolo="Moto nuove"
          sottotitolo="La gamma a listino: si modifica di rado"
          voci={nuove}
          vuoto="Nessuna moto nuova."
          nuovaCondizione="nuovo"
        />
      </div>
    </main>
  );
}

function Sezione({
  titolo,
  sottotitolo,
  voci,
  vuoto,
  nuovaCondizione,
}: {
  titolo: string;
  sottotitolo: string;
  voci: { moto: { id: string; brand: string; name: string; price?: number }; nascosta: boolean; nelDatabase: boolean }[];
  vuoto: string;
  nuovaCondizione: 'nuovo' | 'usato';
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display uppercase tracking-tight">
            {titolo}{' '}
            <span className="text-sm font-normal text-slate-500 tracking-normal normal-case">
              ({voci.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{sottotitolo}</p>
        </div>
        <Link
          href={`/admin/moto/nuova?tipo=${nuovaCondizione}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D00020] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          Aggiungi
        </Link>
      </div>

      {voci.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 px-4 rounded-xl border border-dashed border-white/10">
          {vuoto}
        </p>
      ) : (
        <ul className="grid gap-2">
          {voci.map(({ moto, nascosta, nelDatabase }) => (
            <li key={moto.id}>
              <Link
                href={`/admin/moto/${encodeURIComponent(moto.id)}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05] px-4 py-3 transition-colors group"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-500">
                    {moto.brand}
                  </span>
                  <span className="block text-sm font-semibold truncate">{moto.name}</span>
                </span>

                <span className="flex items-center gap-3 shrink-0">
                  {nascosta && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300">
                      <EyeOff className="w-3 h-3" />
                      Nascosta
                    </span>
                  )}
                  {nelDatabase && (
                    <span
                      className="text-slate-600"
                      title="Modificata dall&rsquo;area riservata"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {moto.price !== undefined && (
                    <span className="text-xs font-mono tabular-nums text-slate-300">
                      {moto.price.toLocaleString('it-IT')} &euro;
                    </span>
                  )}
                  <Pencil className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
