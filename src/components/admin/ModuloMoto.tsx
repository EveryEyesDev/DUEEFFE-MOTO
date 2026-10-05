'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Motorcycle, BikeCategory } from '../../types';
import { CaricaFoto } from './CaricaFoto';
import { ViewsLivrea } from './ViewsLivrea';

/**
 * Il modulo con cui il responsabile compila una moto.
 *
 * COM'E' ORGANIZZATO
 * Nell'ordine in cui si ragiona guardando una moto in salone: prima cos'e'
 * (marca, modello, nuova o usata), poi quanto costa, poi com'e' fatta
 * (scheda tecnica), infine le fotografie. I campi dell'usato compaiono
 * solo se la moto e' usata, cosi' chi inserisce una moto nuova non si
 * trova davanti caselle che non lo riguardano.
 *
 * COSA E' OBBLIGATORIO
 * Pochissimo: codice, marca e modello. Tutto il resto puo' restare vuoto,
 * e in pagina compare "In arrivo" con l'invito a chiamare. E' una scelta
 * presa all'inizio e vale anche qui: meglio una casella vuota che un dato
 * inventato per far contento un modulo.
 */

const CATEGORIE: { chiave: Exclude<BikeCategory, 'all'>; etichetta: string }[] = [
  { chiave: 'adventure', etichetta: 'Adventure' },
  { chiave: 'naked', etichetta: 'Naked' },
  { chiave: 'cruiser', etichetta: 'Cruiser' },
  { chiave: 'bagger', etichetta: 'Bagger' },
];

interface Props {
  motoIniziale: Motorcycle;
  nascostaIniziale: boolean;
  /** Vero quando si sta creando: cambia i pulsanti e permette di scegliere il codice. */
  nuova: boolean;
}

export const ModuloMoto: React.FC<Props> = ({ motoIniziale, nascostaIniziale, nuova }) => {
  const router = useRouter();
  const [moto, setMoto] = useState<Motorcycle>(motoIniziale);
  const [nascosta, setNascosta] = useState(nascostaIniziale);
  const [salvando, setSalvando] = useState(false);
  const [messaggio, setMessaggio] = useState<{ testo: string; buono: boolean } | null>(null);

  const aggiorna = (campi: Partial<Motorcycle>) => setMoto((m) => ({ ...m, ...campi }));
  const aggiornaScheda = (campo: string, valore: string) =>
    setMoto((m) => ({
      ...m,
      specs: { ...m.specs, [campo]: valore === '' ? undefined : Number(valore) },
    }));
  const aggiornaSchedaTesto = (campo: string, valore: string) =>
    setMoto((m) => ({ ...m, specs: { ...m.specs, [campo]: valore || undefined } }));

  const salva = async () => {
    setSalvando(true);
    setMessaggio(null);
    try {
      const risposta = await fetch('/api/admin/moto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moto, nascosta }),
      });
      const dati = await risposta.json().catch(() => ({}));
      if (risposta.ok) {
        setMessaggio({ testo: 'Salvata. Il sito e’ gia’ aggiornato.', buono: true });
        if (nuova) router.push(`/admin/moto/${encodeURIComponent(moto.id)}`);
        router.refresh();
      } else {
        setMessaggio({ testo: dati.errore ?? 'Non sono riuscito a salvare.', buono: false });
      }
    } catch {
      setMessaggio({ testo: 'Nessuna risposta dal server.', buono: false });
    } finally {
      setSalvando(false);
    }
  };

  const elimina = async () => {
    setSalvando(true);
    const risposta = await fetch(`/api/admin/moto?id=${encodeURIComponent(moto.id)}`, {
      method: 'DELETE',
    });
    setSalvando(false);
    if (risposta.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const dati = await risposta.json().catch(() => ({}));
      setMessaggio({ testo: dati.errore ?? 'Non sono riuscito a eliminare.', buono: false });
    }
  };

  const usata = moto.condition === 'usato';

  return (
    <div className="space-y-8 pb-32">
      <Riquadro titolo="Che moto e'">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo
            etichetta="Marca"
            valore={moto.brand}
            onChange={(v) => aggiorna({ brand: v })}
            obbligatorio
          />
          <Campo
            etichetta="Modello"
            valore={moto.name}
            onChange={(v) => aggiorna({ name: v })}
            obbligatorio
          />
          <Campo
            etichetta="Codice interno"
            valore={moto.id}
            onChange={(v) => aggiorna({ id: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            disabilitato={!nuova}
            aiuto={
              nuova
                ? 'Lettere minuscole, numeri e trattini. Non si potra’ piu’ cambiare.'
                : 'Non si cambia dopo la creazione.'
            }
          />
          <Scelta
            etichetta="Reparto"
            valore={moto.condition}
            opzioni={[
              { valore: 'nuovo', etichetta: 'Nuova' },
              { valore: 'usato', etichetta: 'Usata' },
            ]}
            onChange={(v) =>
              aggiorna({
                condition: v as 'nuovo' | 'usato',
                used: v === 'usato' ? moto.used ?? { year: new Date().getFullYear(), km: 0 } : undefined,
              })
            }
          />
          <Scelta
            etichetta="Tipo"
            valore={moto.category}
            opzioni={CATEGORIE.map((c) => ({ valore: c.chiave, etichetta: c.etichetta }))}
            onChange={(v) =>
              aggiorna({
                category: v as Exclude<BikeCategory, 'all'>,
                categoryLabel: CATEGORIE.find((c) => c.chiave === v)?.etichetta ?? v,
              })
            }
          />
          <Campo
            etichetta="Sottotitolo"
            valore={moto.subtitle ?? ''}
            onChange={(v) => aggiorna({ subtitle: v })}
            aiuto="Una riga sotto il nome, nel catalogo."
          />
        </div>

        <Testo
          etichetta="Descrizione"
          valore={moto.description ?? ''}
          onChange={(v) => aggiorna({ description: v })}
          aiuto="Qualche riga per chi apre la scheda. Si puo’ lasciare vuota."
        />
      </Riquadro>

      <Riquadro titolo="Prezzo">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo
            etichetta="Prezzo in euro"
            tipo="number"
            valore={moto.price?.toString() ?? ''}
            onChange={(v) => aggiorna({ price: v === '' ? undefined : Number(v) })}
            aiuto="Vuoto: in pagina compare &laquo;Prezzo su richiesta&raquo;."
          />
          <Campo
            etichetta="Nota sul prezzo"
            valore={moto.priceNote ?? ''}
            onChange={(v) => aggiorna({ priceNote: v })}
            aiuto="Per esempio: franco concessionario, IVA inclusa."
          />
        </div>
      </Riquadro>

      {usata && (
        <Riquadro titolo="Dati dell'usato">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Campo
              etichetta="Anno"
              tipo="number"
              valore={moto.used?.year?.toString() ?? ''}
              onChange={(v) =>
                aggiorna({ used: { ...(moto.used ?? { year: 0, km: 0 }), year: Number(v) } })
              }
            />
            <Campo
              etichetta="Chilometri"
              tipo="number"
              valore={moto.used?.km?.toString() ?? ''}
              onChange={(v) =>
                aggiorna({ used: { ...(moto.used ?? { year: 0, km: 0 }), km: Number(v) } })
              }
            />
            <Campo
              etichetta="Codice o targa"
              valore={moto.used?.stockCode ?? ''}
              onChange={(v) =>
                aggiorna({ used: { ...(moto.used ?? { year: 0, km: 0 }), stockCode: v } })
              }
              aiuto="Per ritrovarla in salone."
            />
            <Campo
              etichetta="Garanzia (mesi)"
              tipo="number"
              valore={moto.used?.warrantyMonths?.toString() ?? ''}
              onChange={(v) =>
                aggiorna({
                  used: {
                    ...(moto.used ?? { year: 0, km: 0 }),
                    warrantyMonths: v === '' ? undefined : Number(v),
                  },
                })
              }
            />
            <Campo
              etichetta="Proprietari precedenti"
              tipo="number"
              valore={moto.used?.previousOwners?.toString() ?? ''}
              onChange={(v) =>
                aggiorna({
                  used: {
                    ...(moto.used ?? { year: 0, km: 0 }),
                    previousOwners: v === '' ? undefined : Number(v),
                  },
                })
              }
            />
            <label className="flex items-center gap-2.5 self-end pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={moto.used?.sold ?? false}
                onChange={(e) =>
                  aggiorna({
                    used: { ...(moto.used ?? { year: 0, km: 0 }), sold: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#D00020]"
              />
              <span className="text-sm">Venduta</span>
            </label>
          </div>
        </Riquadro>
      )}

      <Riquadro
        titolo="Scheda tecnica"
        nota="Lascia vuoto quello che non sai: in pagina compare &laquo;In arrivo&raquo;."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Campo etichetta="Cilindrata (cc)" tipo="number"
            valore={moto.specs.displacementCc?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('displacementCc', v)} />
          <Campo etichetta="Potenza (CV)" tipo="number"
            valore={moto.specs.powerHp?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('powerHp', v)} />
          <Campo etichetta="Coppia (Nm)" tipo="number"
            valore={moto.specs.torqueNm?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('torqueNm', v)} />
          <Campo etichetta="Peso (kg)" tipo="number"
            valore={moto.specs.weightKg?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('weightKg', v)} />
          <Campo etichetta="Altezza sella (mm)" tipo="number"
            valore={moto.specs.seatHeightMm?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('seatHeightMm', v)} />
          <Campo etichetta="Serbatoio (litri)" tipo="number"
            valore={moto.specs.fuelCapacityL?.toString() ?? ''}
            onChange={(v) => aggiornaScheda('fuelCapacityL', v)} />
          <Campo etichetta="Tipo motore"
            valore={moto.specs.engineType ?? ''}
            onChange={(v) => aggiornaSchedaTesto('engineType', v)} />
          <Campo etichetta="Cambio"
            valore={moto.specs.transmission ?? ''}
            onChange={(v) => aggiornaSchedaTesto('transmission', v)} />
          <Campo etichetta="Freno anteriore"
            valore={moto.specs.frontBrakes ?? ''}
            onChange={(v) => aggiornaSchedaTesto('frontBrakes', v)} />
        </div>
      </Riquadro>

      <Riquadro
        titolo="Fotografia del catalogo"
        nota="E&rsquo; quella che si vede nell&rsquo;elenco: meglio la moto in strada o davanti al salone."
      >
        <CaricaFoto
          cartella={moto.id}
          indirizzo={moto.roadImage ?? ''}
          onCambia={(indirizzo) => aggiorna({ roadImage: indirizzo || undefined })}
        />
      </Riquadro>

      <Riquadro
        titolo="Fotografie della scheda"
        nota="Quelle che si vedono aprendo la moto: fronte, retro, i due profili e le due tre quarti."
      >
        <ViewsLivrea
          moto={moto}
          onCambia={(colorways) => aggiorna({ colorways })}
        />
      </Riquadro>

      {/* Barra di salvataggio, sempre a portata di pollice */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#050507]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-5 py-3 flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Elenco
          </Link>

          <button
            type="button"
            onClick={() => setNascosta((n) => !n)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {nascosta ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {nascosta ? 'Nascosta dal sito' : 'Visibile sul sito'}
          </button>

          <span className="flex-1" />

          {messaggio && (
            <span
              role="status"
              className={`text-xs ${messaggio.buono ? 'text-emerald-400' : 'text-[#ff6b7f]'}`}
            >
              {messaggio.testo}
            </span>
          )}

          {!nuova && (
            <button
              type="button"
              onClick={elimina}
              disabled={salvando}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-[#ff6b7f] hover:border-[#ff6b7f]/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Elimina
            </button>
          )}

          <button
            type="button"
            onClick={salva}
            disabled={salvando}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#D00020] hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvo...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------- pezzi di modulo */

const Riquadro: React.FC<{ titolo: string; nota?: string; children: React.ReactNode }> = ({
  titolo,
  nota,
  children,
}) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-5">
    <div>
      <h2 className="text-sm font-bold uppercase tracking-widest text-white">{titolo}</h2>
      {nota && (
        <p
          className="text-xs text-slate-400 mt-1 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: nota }}
        />
      )}
    </div>
    {children}
  </section>
);

const Campo: React.FC<{
  etichetta: string;
  valore: string;
  onChange: (v: string) => void;
  tipo?: string;
  aiuto?: string;
  obbligatorio?: boolean;
  disabilitato?: boolean;
}> = ({ etichetta, valore, onChange, tipo = 'text', aiuto, obbligatorio, disabilitato }) => (
  <label className="block">
    <span className="block text-xs text-slate-400 mb-1.5">
      {etichetta}
      {obbligatorio && <span className="text-[#D00020]"> *</span>}
    </span>
    <input
      type={tipo}
      value={valore}
      disabled={disabilitato}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020] disabled:opacity-50 transition-colors"
    />
    {aiuto && (
      <span
        className="block text-[11px] text-slate-500 mt-1"
        dangerouslySetInnerHTML={{ __html: aiuto }}
      />
    )}
  </label>
);

const Testo: React.FC<{
  etichetta: string;
  valore: string;
  onChange: (v: string) => void;
  aiuto?: string;
}> = ({ etichetta, valore, onChange, aiuto }) => (
  <label className="block">
    <span className="block text-xs text-slate-400 mb-1.5">{etichetta}</span>
    <textarea
      rows={3}
      value={valore}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020] transition-colors resize-y"
    />
    {aiuto && <span className="block text-[11px] text-slate-500 mt-1">{aiuto}</span>}
  </label>
);

const Scelta: React.FC<{
  etichetta: string;
  valore: string;
  opzioni: { valore: string; etichetta: string }[];
  onChange: (v: string) => void;
}> = ({ etichetta, valore, opzioni, onChange }) => (
  <label className="block">
    <span className="block text-xs text-slate-400 mb-1.5">{etichetta}</span>
    <select
      value={valore}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020] transition-colors"
    >
      {opzioni.map((o) => (
        <option key={o.valore} value={o.valore} className="bg-[#0d0d12]">
          {o.etichetta}
        </option>
      ))}
    </select>
  </label>
);
