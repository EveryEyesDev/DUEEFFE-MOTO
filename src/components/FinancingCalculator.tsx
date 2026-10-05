'use client';

import React, { useMemo, useState } from 'react';
import { Motorcycle } from '../types';
import { useCatalogo } from '../lib/catalogo-contesto';
import { Calculator, Info, PhoneCall } from 'lucide-react';
import { SITE } from '../config/site';
import { formatEuro } from '../utils/format';

interface FinancingCalculatorProps {
  /** Modello preselezionato quando l'utente arriva dal pulsante "Calcola la rata". */
  initialBike?: Motorcycle;
}

/** Importo di partenza quando il modello scelto non ha ancora un prezzo a listino. */
const IMPORTO_PREDEFINITO = 12000;

/** TAN di partenza, puramente indicativo e modificabile dall'utente. */
const TAN_PREDEFINITO = 7.5;

/**
 * Rata di un ammortamento alla francese con eventuale maxi rata finale.
 * La maxi rata viene scontata al valore attuale prima di ripartire il capitale.
 */
function calcolaRata(
  capitale: number,
  tassoMensile: number,
  mesi: number,
  maxiRata: number,
): number {
  if (mesi <= 0) return 0;
  if (tassoMensile === 0) return Math.max(0, (capitale - maxiRata) / mesi);

  const valoreAttualeMaxiRata = maxiRata / Math.pow(1 + tassoMensile, mesi);
  const capitaleDaRateizzare = capitale - valoreAttualeMaxiRata;
  if (capitaleDaRateizzare <= 0) return 0;

  return (
    (capitaleDaRateizzare * tassoMensile) / (1 - Math.pow(1 + tassoMensile, -mesi))
  );
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ initialBike }) => {
  const { tutte } = useCatalogo();
  const [selectedBikeId, setSelectedBikeId] = useState<string>(
    initialBike?.id ?? tutte[0]?.id ?? '',
  );
  const [importo, setImporto] = useState<number>(initialBike?.price ?? IMPORTO_PREDEFINITO);
  const [anticipoPercent, setAnticipoPercent] = useState<number>(20);
  const [durataMesi, setDurataMesi] = useState<number>(36);
  const [maxiRataAttiva, setMaxiRataAttiva] = useState<boolean>(false);
  const [tan, setTan] = useState<number>(TAN_PREDEFINITO);

  const selectedBike = tutte.find((m) => m.id === selectedBikeId) ?? tutte[0];

  const { anticipo, capitale, maxiRata, rata, totaleRate } = useMemo(() => {
    const anticipoCalc = (importo * anticipoPercent) / 100;
    const capitaleCalc = Math.max(0, importo - anticipoCalc);
    const maxiRataCalc = maxiRataAttiva ? capitaleCalc * 0.3 : 0;
    const tassoMensile = tan / 100 / 12;
    const rataCalc = calcolaRata(capitaleCalc, tassoMensile, durataMesi, maxiRataCalc);

    return {
      anticipo: anticipoCalc,
      capitale: capitaleCalc,
      maxiRata: maxiRataCalc,
      rata: rataCalc,
      totaleRate: rataCalc * durataMesi,
    };
  }, [importo, anticipoPercent, durataMesi, maxiRataAttiva, tan]);

  return (
    <section id="finanziamento" className="py-20 bg-[#0a0a0d] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#D00020]">Finanziamenti</span>
            <span aria-hidden="true">·</span>
            <span>Simulazione indicativa</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Fatti un&rsquo;idea della <span className="text-[#D00020]">rata</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Muovi i cursori per vedere come cambia la rata al variare di anticipo, durata e tasso.
            È uno strumento di orientamento: le condizioni vere te le diamo in salone, sul modello
            che ti interessa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonna sinistra: i controlli */}
          <div className="lg:col-span-7 bg-[#0e0f14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Modello */}
            <div className="mb-6">
              <label
                htmlFor="modello-finanziamento"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >
                Modello di riferimento
              </label>
              <select
                id="modello-finanziamento"
                value={selectedBike.id}
                onChange={(e) => {
                  setSelectedBikeId(e.target.value);
                  const b = tutte.find((m) => m.id === e.target.value);
                  if (b?.price !== undefined) setImporto(b.price);
                }}
                className="w-full bg-[#181920] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D00020] transition-colors"
              >
                {tutte.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.brand} {bike.name}
                    {bike.price !== undefined ? ` — ${formatEuro(bike.price)}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Importo */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="importo"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  Importo della moto
                </label>
                <span className="text-sm font-bold font-mono text-white">{formatEuro(importo)}</span>
              </div>
              <input
                id="importo"
                type="range"
                min={2000}
                max={30000}
                step={500}
                value={importo}
                onChange={(e) => setImporto(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D00020]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>€ 2.000</span>
                <span>€ 30.000</span>
              </div>
              {selectedBike.price === undefined && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Questo modello non ha ancora un listino pubblicato: imposta tu l&rsquo;importo di
                  riferimento.
                </p>
              )}
            </div>

            {/* Anticipo */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="anticipo"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  Anticipo
                </label>
                <span className="text-sm font-bold font-mono text-white">
                  {anticipoPercent}% ({formatEuro(anticipo)})
                </span>
              </div>
              <input
                id="anticipo"
                type="range"
                min={0}
                max={50}
                step={5}
                value={anticipoPercent}
                onChange={(e) => setAnticipoPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D00020]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Durata */}
            <div className="mb-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Durata
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[24, 36, 48, 60].map((mesi) => (
                  <button
                    key={mesi}
                    type="button"
                    onClick={() => setDurataMesi(mesi)}
                    aria-pressed={durataMesi === mesi}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      durataMesi === mesi
                        ? 'bg-[#D00020] border-[#D00020] text-white shadow-md'
                        : 'bg-[#181920] border-white/5 text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {mesi} mesi
                  </button>
                ))}
              </div>
            </div>

            {/* TAN */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="tan"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  Tasso annuo nominale ipotizzato
                </label>
                <span className="text-sm font-bold font-mono text-white">
                  {tan.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <input
                id="tan"
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={tan}
                onChange={(e) => setTan(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D00020]"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Valore impostabile da te. Il tasso reale dipende dalla finanziaria e dalla
                pratica, non lo decidiamo noi in questa pagina.
              </p>
            </div>

            {/* Maxi rata finale */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white block">Maxi rata finale</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Sposta il 30% del capitale ({formatEuro(capitale * 0.3)}) a fine contratto,
                  abbassando le rate mensili.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={maxiRataAttiva}
                aria-label="Attiva la maxi rata finale"
                onClick={() => setMaxiRataAttiva(!maxiRataAttiva)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maxiRataAttiva ? 'bg-[#D00020]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    maxiRataAttiva ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Colonna destra: il risultato */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#15161c] to-[#0c0d12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D00020] mb-2 font-mono">
              <Calculator className="w-4 h-4" />
              Risultato della simulazione
            </div>

            <div className="my-4 pb-4 border-b border-white/10">
              <div className="text-xs text-slate-400">Rata mensile indicativa</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-tech tabular-nums">
                  {formatEuro(rata)}
                </span>
                <span className="text-sm text-slate-400">/mese</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Su {durataMesi} mesi, con tasso annuo nominale al{' '}
                {tan.toFixed(1).replace('.', ',')}%.
              </div>
            </div>

            <dl className="space-y-2 text-xs py-2">
              <Riga label="Importo moto" value={formatEuro(importo)} />
              <Riga label={`Anticipo (${anticipoPercent}%)`} value={formatEuro(anticipo)} />
              <Riga label="Capitale finanziato" value={formatEuro(capitale)} />
              <Riga label="Numero rate" value={`${durataMesi} mensilità`} />
              {maxiRataAttiva && <Riga label="Maxi rata finale" value={formatEuro(maxiRata)} />}
              <Riga label="Totale rate" value={formatEuro(totaleRate)} />
            </dl>

            {/* Avvertenza */}
            <div className="mt-5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                Calcolo puramente indicativo, elaborato nel tuo browser. Non è un&rsquo;offerta
                contrattuale e non tiene conto di spese di istruttoria, imposte, assicurazioni o
                della valutazione del merito creditizio. Per il preventivo vero, con TAEG e
                condizioni complete, parliamone di persona.
              </p>
            </div>

            <a
              href={SITE.phone.href}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chiedi il preventivo reale</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Riga: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-slate-400">
    <dt>{label}</dt>
    <dd className="text-white font-mono">{value}</dd>
  </div>
);
