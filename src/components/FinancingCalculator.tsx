'use client';

import React, { useMemo, useState } from 'react';
import { Motorcycle } from '../types';
import { useCatalogo } from '../lib/catalogo-contesto';
import { Calculator, Info, PhoneCall, GitCompare } from 'lucide-react';
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

  // Il confronto: una seconda moto, le stesse condizioni.
  const [confronto, setConfronto] = useState<boolean>(false);
  const [secondaId, setSecondaId] = useState<string>('');

  const selectedBike = tutte.find((m) => m.id === selectedBikeId) ?? tutte[0];

  /**
   * Le moto proponibili per il confronto: quelle con un prezzo, tolta
   * quella gia' scelta. Senza prezzo non c'e' niente da confrontare, e
   * mostrarle vorrebbe dire far scegliere una voce che poi non calcola.
   */
  const confrontabili = useMemo(
    () => tutte.filter((m) => m.price !== undefined && m.id !== selectedBike?.id),
    [tutte, selectedBike?.id],
  );

  const secondaBike = confrontabili.find((m) => m.id === secondaId);

  const esito = useMemo(() => {
    const conto = (prezzo: number) => {
      const anticipoCalc = (prezzo * anticipoPercent) / 100;
      const capitaleCalc = Math.max(0, prezzo - anticipoCalc);
      const maxiRataCalc = maxiRataAttiva ? capitaleCalc * 0.3 : 0;
      const rataCalc = calcolaRata(capitaleCalc, tan / 100 / 12, durataMesi, maxiRataCalc);
      return {
        importo: prezzo,
        anticipo: anticipoCalc,
        capitale: capitaleCalc,
        maxiRata: maxiRataCalc,
        rata: rataCalc,
        totaleRate: rataCalc * durataMesi,
      };
    };
    // La seconda moto entra col suo prezzo di listino, non con il cursore:
    // il confronto ha senso se le condizioni sono le stesse e cambia la
    // moto. Se cambiasse anche l'importo non si capirebbe piu' da dove
    // viene la differenza.
    return {
      prima: conto(importo),
      seconda: secondaBike?.price !== undefined ? conto(secondaBike.price) : null,
    };
  }, [importo, anticipoPercent, durataMesi, maxiRataAttiva, tan, secondaBike?.price]);

  const { anticipo, capitale, maxiRata, rata, totaleRate } = esito.prima;
  const confrontoAttivo = confronto && esito.seconda !== null && secondaBike !== undefined;



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

            {/* Il confronto. Sta qui, sotto il modello, perche' e' un modo
                di scegliere la moto: non un'altra impostazione del
                finanziamento. */}
            <div className="mb-6">
              {/* Due stati affiancati, nel linguaggio dei pulsanti della
                  durata qui sotto: pieno rosso quello attivo.

                  Prima era una scritta grigia da 12 pixel senza cornice,
                  uguale alle etichette dei campi, e l'unico segnale che
                  fosse cliccabile era il passaggio del mouse - che su
                  telefono non esiste. Il risultato e' che il confronto
                  c'era da giorni e il salone ha chiesto di aggiungerlo. */}
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Quante moto
              </span>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Quante moto confrontare">
                {[
                  { acceso: false, testo: 'Una moto' },
                  { acceso: true, testo: 'Confronta due moto' },
                ].map((voce) => (
                  <button
                    key={voce.testo}
                    type="button"
                    aria-pressed={confronto === voce.acceso}
                    onClick={() => {
                      setConfronto(voce.acceso);
                      if (voce.acceso && !secondaId && confrontabili[0]) {
                        setSecondaId(confrontabili[0].id);
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
                      confronto === voce.acceso
                        ? 'bg-[#D00020] border-[#D00020] text-white'
                        : 'bg-[#181920] border-white/10 text-slate-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {voce.acceso && <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />}
                    {voce.testo}
                  </button>
                ))}
              </div>

              {confronto && (
                <div className="mt-3">
                  <label
                    htmlFor="modello-confronto"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                  >
                    Confronta con
                  </label>
                  <select
                    id="modello-confronto"
                    value={secondaId}
                    onChange={(e) => setSecondaId(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D00020] transition-colors"
                  >
                    {confrontabili.map((bike) => (
                      <option key={bike.id} value={bike.id}>
                        {bike.brand} {bike.name} &mdash; {formatEuro(bike.price as number)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    La seconda moto entra col suo prezzo di listino. Anticipo, durata e tasso
                    restano quelli qui sotto: cos&igrave; la differenza che vedi &egrave; solo la
                    moto.
                  </p>
                </div>
              )}
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

          {/* Il risultato.
              Su schermo stretto sta SOPRA i comandi. Impilato nell'ordine
              naturale finiva dopo modello, confronto, importo, anticipo,
              durata, tasso e maxi rata: chi toccava un comando non vedeva
              cambiare niente e pensava che non funzionasse. Sopra, la
              risposta e' sempre sott'occhio e i comandi stanno sotto, dove
              si armeggia. Da lg in su torna a destra, come prima. */}
          <div
            id="esito-rata"
            className="order-first lg:order-none lg:col-span-5 bg-gradient-to-b from-[#15161c] to-[#0c0d12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D00020] mb-2 font-mono">
              <Calculator className="w-4 h-4" />
              Risultato della simulazione
            </div>

            {confrontoAttivo && esito.seconda ? (
              <>
                {/* Due colonne: la rata grande di ciascuna, affiancate. Il
                    confronto si fa guardando due numeri vicini, non
                    ricordandosi il primo mentre si legge il secondo. */}
                <div className="my-4 grid grid-cols-2 gap-3 pb-4 border-b border-white/10">
                  <ColonnaRata
                    nome={`${selectedBike.brand} ${selectedBike.name}`}
                    rata={esito.prima.rata}
                    prezzo={esito.prima.importo}
                  />
                  <ColonnaRata
                    nome={`${secondaBike.brand} ${secondaBike.name}`}
                    rata={esito.seconda.rata}
                    prezzo={esito.seconda.importo}
                  />
                </div>

                <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Differenza al mese
                  </div>
                  <div className="text-xl font-extrabold font-tech text-white tabular-nums mt-0.5">
                    {formatEuro(Math.abs(esito.prima.rata - esito.seconda.rata))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {esito.prima.rata === esito.seconda.rata
                      ? 'Stessa rata: a parità di condizioni le due moto si equivalgono.'
                      : `La ${
                          esito.prima.rata < esito.seconda.rata ? selectedBike.name : secondaBike.name
                        } costa meno al mese. Su ${durataMesi} mesi fanno ${formatEuro(
                          Math.abs(esito.prima.totaleRate - esito.seconda.totaleRate),
                        )} di differenza.`}
                  </p>
                </div>

                <dl className="space-y-2 text-xs py-2">
                  <Riga label={`Anticipo (${anticipoPercent}%)`} value={`${formatEuro(esito.prima.anticipo)} · ${formatEuro(esito.seconda.anticipo)}`} />
                  <Riga label="Capitale finanziato" value={`${formatEuro(esito.prima.capitale)} · ${formatEuro(esito.seconda.capitale)}`} />
                  <Riga label="Numero rate" value={`${durataMesi} mensilità`} />
                  {/* La maxi rata veniva applicata al calcolo anche qui ma
                      non era scritta da nessuna parte: chi la accendeva
                      vedeva le rate scendere senza capire perche'. */}
                  {maxiRataAttiva && (
                    <Riga
                      label="Maxi rata finale"
                      value={`${formatEuro(esito.prima.maxiRata)} · ${formatEuro(esito.seconda.maxiRata)}`}
                    />
                  )}
                  <Riga label="Totale rate" value={`${formatEuro(esito.prima.totaleRate)} · ${formatEuro(esito.seconda.totaleRate)}`} />
                </dl>
              </>
            ) : (
              <>
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
              </>
            )}

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

/** Una delle due colonne del confronto: nome, rata grande, prezzo sotto. */
const ColonnaRata: React.FC<{ nome: string; rata: number; prezzo: number }> = ({
  nome,
  rata,
  prezzo,
}) => (
  <div className="min-w-0">
    <div className="text-[11px] text-slate-400 truncate" title={nome}>
      {nome}
    </div>
    <div className="text-2xl sm:text-3xl font-extrabold text-white font-tech tabular-nums mt-1 leading-none">
      {formatEuro(rata)}
    </div>
    <div className="text-[10px] text-slate-500 mt-1">
      al mese &middot; {formatEuro(prezzo)}
    </div>
  </div>
);

const Riga: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-slate-400">
    <dt>{label}</dt>
    <dd className="text-white font-mono">{value}</dd>
  </div>
);
