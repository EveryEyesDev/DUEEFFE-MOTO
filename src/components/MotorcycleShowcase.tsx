'use client';

import React, { useState } from 'react';
import { Motorcycle, BikeCategory, BikeCondition } from '../types';
import { useCatalogo } from '../lib/catalogo-contesto';
import { BikeCard } from './BikeCard';
import { stemmaDi } from './LoghiMarchi';
import { BikeGallery } from './BikeGallery';
import {
  Search,
  Gauge,
  Zap,
  Weight,
  Calculator,
  Check,
  Fuel,
  Settings2,
  Camera,
  PhoneCall,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE } from '../config/site';
import { formatEuro, formatKm, formatNumero } from '../utils/format';

interface MotorcycleShowcaseProps {
  /** Marca su cui aprire il catalogo, se si arriva da un collegamento mirato. */
  marcaIniziale?: string;
  selectedBike: Motorcycle;
  onSelectBike: (bike: Motorcycle) => void;
  onSelectForFinancing: (bike: Motorcycle) => void;
}

const CATEGORIES: { key: BikeCategory; label: string }[] = [
  { key: 'all', label: 'Tutte' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'naked', label: 'Strada' },
  { key: 'cruiser', label: 'Cruiser' },
  { key: 'bagger', label: 'Bagger' },
];

/** Testo mostrato al posto dei dati non ancora confermati. */
const DATO_MANCANTE = 'In arrivo';

/** Mostra il valore con la sua unita', in stile italiano, oppure il segnaposto. */
const valueOr = (value: number | string | undefined, unit = ''): string => {
  if (value === undefined || value === '') return DATO_MANCANTE;
  const testo = typeof value === 'number' ? formatNumero(value, 1) : value;
  return `${testo}${unit}`;
};

export const MotorcycleShowcase: React.FC<MotorcycleShowcaseProps> = ({
  marcaIniziale,
  selectedBike,
  onSelectBike,
  onSelectForFinancing,
}) => {
  const [reparto, setReparto] = useState<BikeCondition>('nuovo');
  const [categoria, setCategoria] = useState<BikeCategory>('all');
  const [marca, setMarca] = useState<string>(marcaIniziale ?? 'tutte');
  const [fascia, setFascia] = useState<string>('tutte');
  const [cerca, setCerca] = useState('');

  const { nuove, usate } = useCatalogo();
  const elenco = reparto === 'nuovo' ? nuove : usate;

  /*
    I FILTRI
    Con una gamma sola bastava la categoria. Adesso che a catalogo ci sono
    decine di modelli di marche diverse, servono piu' strade per arrivare
    alla moto giusta: la marca, il tipo, la fascia di prezzo e la ricerca
    per nome, che e' quella che usa chi sa gia' cosa vuole.

    Marche e categorie non sono scritte a mano: le ricaviamo da quello che
    c'e' davvero in elenco, cosi' non si offre mai un filtro che non
    seleziona niente.
  */
  const marche = Array.from(new Set(elenco.map((b) => b.brand))).sort();

  const categorieDisponibili = CATEGORIES.filter(
    (c) => c.key === 'all' || elenco.some((b) => b.category === c.key),
  );

  /*
    LE FASCE DI PREZZO
    Una moto senza prezzo pubblicato non puo' finire in nessuna fascia: la
    mostriamo solo quando non si sta filtrando per prezzo. Meglio non
    farla comparire che farla comparire nella fascia sbagliata.
  */
  const FASCE: { key: string; label: string; dentro: (p?: number) => boolean }[] = [
    { key: 'tutte', label: 'Tutti i prezzi', dentro: () => true },
    { key: 'fino5', label: 'Fino a 5.000 €', dentro: (p) => p !== undefined && p < 5000 },
    { key: '5a10', label: '5.000 – 10.000 €', dentro: (p) => p !== undefined && p >= 5000 && p < 10000 },
    { key: 'oltre10', label: 'Oltre 10.000 €', dentro: (p) => p !== undefined && p >= 10000 },
  ];
  const fasciaScelta = FASCE.find((f) => f.key === fascia) ?? FASCE[0];
  const quanteConPrezzo = elenco.filter((b) => b.price !== undefined).length;

  const testo = cerca.trim().toLowerCase();
  const moto = elenco.filter(
    (b) =>
      (marca === 'tutte' || b.brand === marca) &&
      (categoria === 'all' || b.category === categoria) &&
      fasciaScelta.dentro(b.price) &&
      (testo === '' ||
        `${b.brand} ${b.name} ${b.categoryLabel}`.toLowerCase().includes(testo)),
  );

  const filtriAttivi =
    marca !== 'tutte' || categoria !== 'all' || fascia !== 'tutte' || testo !== '';

  const azzeraFiltri = () => {
    setMarca('tutte');
    setCategoria('all');
    setFascia('tutte');
    setCerca('');
  };

  // Cambiando marca si riparte da tutte le categorie: altrimenti si resta
  // su un filtro che per quella marca non seleziona piu' niente.
  const cambiaMarca = (nuova: string) => {
    setMarca(nuova);
    setCategoria('all');
  };

  const specs = selectedBike.specs;
  const hasAnySpec = Object.values(specs).some((v) => v !== undefined && v !== '');
  const hasFeatures = selectedBike.features.length > 0;
  const isUsato = selectedBike.condition === 'usato';

  // Nel dettaglio si mostrano SOLO le viste studio delle livree.
  const haViste = (selectedBike.colorways?.length ?? 0) > 0;

  const apriDettaglio = (bike: Motorcycle) => {
    onSelectBike(bike);
    document.getElementById('dettaglio-moto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="gamma" className="py-20 bg-[#070709] border-b border-white/10 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intestazione */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#D00020]">Le nostre moto</span>
            <span aria-hidden="true">·</span>
            <span>Nuovo e usato</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Il catalogo del <span className="text-[#D00020]">salone</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Le moto nuove a listino e il parco usato in pronta consegna. Apri una moto
            per vederne le fotografie e la scheda tecnica.
          </p>
        </div>

        {/* Marchi trattati */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-10 pb-8 border-b border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 mr-1">
            Marchi trattati
          </span>
          {SITE.brands.map((brand) => (
            <span
              key={brand}
              className="px-3 py-1 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full"
            >
              {brand}
            </span>
          ))}
        </div>

        {/* Reparti: nuovo e usato */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-black/60 rounded-xl border border-white/10">
            <RepartoTab
              attivo={reparto === 'nuovo'}
              onClick={() => {
                setReparto('nuovo');
                setCategoria('all');
              }}
              label="Moto nuove"
              conteggio={nuove.length}
            />
            <RepartoTab
              attivo={reparto === 'usato'}
              onClick={() => {
                setReparto('usato');
                setCategoria('all');
              }}
              label="Usato"
              conteggio={usate.length}
            />
          </div>
        </div>

        {/* Avviso sull'aggiornamento mensile dell'usato */}
        {reparto === 'usato' && (
          <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <RefreshCw className="w-4 h-4 text-[#D00020] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Il parco usato viene aggiornato ogni mese.</strong>{' '}
              Le moto girano in fretta: se una ti interessa chiamaci per sapere se è ancora
              disponibile, e se non trovi quello che cerchi diccelo, spesso arriva prima di
              finire in vetrina.
            </p>
          </div>
        )}

        {/*
          LA BARRA DEI FILTRI
          Tre file di pulsanti e una casella di ricerca. L'ordine non e'
          casuale: prima la marca, che e' il primo modo in cui la gente
          pensa a una moto, poi il tipo, poi il prezzo. Sotto, il conto di
          quante moto restano, cosi' si capisce subito l'effetto di quello
          che si e' scelto.
        */}
        <div className="mb-8 space-y-3">
          {/*
            MARCA
            Il marchio e' il pulsante, non un'icona accanto al nome. Messo
            piccolo di fianco a una scritta sembrava un'emoji, e un marchio
            ridotto a decorazione non si legge ne' si riconosce. Qui e'
            grande abbastanza da leggersi; il nome resta nell'etichetta per
            chi usa un lettore di schermo, e compare al posto dello stemma
            quando una marca non ne ha ancora uno.

            Spento quando non e' scelto, acceso quando lo e': stessa logica
            degli altri filtri, solo senza parole.
          */}
          {marche.length > 1 && (
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => cambiaMarca('tutte')}
                aria-pressed={marca === 'tutte'}
                className={`shrink-0 h-12 px-5 text-xs font-bold uppercase tracking-wider rounded-xl whitespace-nowrap transition-all ${
                  marca === 'tutte'
                    ? 'bg-white text-slate-900'
                    : 'bg-transparent text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                Tutte
              </button>

              {marche.map((m) => {
                const scelta = marca === m;
                const stemma = stemmaDi(m);
                return (
                  <button
                    key={m}
                    onClick={() => cambiaMarca(m)}
                    aria-pressed={scelta}
                    aria-label={`Mostra solo ${m}`}
                    title={m}
                    className={`shrink-0 h-12 px-5 rounded-xl border transition-all flex items-center justify-center ${
                      scelta
                        ? 'bg-white/10 border-white/40'
                        : 'bg-transparent border-white/10 hover:border-white/30'
                    }`}
                  >
                    {stemma ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stemma}
                        alt={m}
                        className={`h-6 w-auto object-contain transition-all duration-200 ${
                          scelta ? 'opacity-100 grayscale-0' : 'opacity-50 grayscale hover:opacity-80'
                        }`}
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {m}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tipo di moto */}
          {categorieDisponibili.length > 2 && (
            <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1">
              {categorieDisponibili.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoria(cat.key)}
                  aria-pressed={categoria === cat.key}
                  className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    categoria === cat.key
                      ? 'bg-[#D00020] text-white shadow-lg shadow-red-900/40 font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Prezzo e ricerca */}
          <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1.5">
            {quanteConPrezzo > 0 &&
              FASCE.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFascia(f.key)}
                  aria-pressed={fascia === f.key}
                  className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    fascia === f.key
                      ? 'bg-white/90 text-slate-900 font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}

            <label className="relative">
              <span className="sr-only">Cerca una moto</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="search"
                value={cerca}
                onChange={(e) => setCerca(e.target.value)}
                placeholder="Cerca per nome"
                className="w-48 pl-9 pr-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D00020] transition-colors"
              />
            </label>
          </div>

          {/* Quante ne restano */}
          <p className="text-center text-xs text-slate-500">
            {moto.length === elenco.length
              ? `${elenco.length} modelli`
              : `${moto.length} di ${elenco.length} modelli`}
            {filtriAttivi && (
              <>
                {' · '}
                <button
                  onClick={azzeraFiltri}
                  className="text-[#D00020] font-semibold hover:underline"
                >
                  azzera i filtri
                </button>
              </>
            )}
          </p>

          {fascia !== 'tutte' && quanteConPrezzo < elenco.length && (
            <p className="text-center text-[11px] text-slate-500">
              Di {elenco.length - quanteConPrezzo} modelli non abbiamo ancora pubblicato il
              prezzo: non compaiono finche' filtri per fascia.
            </p>
          )}
        </div>

        {/* Griglia del catalogo */}
        {moto.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-14">
            {moto.map((bike) => (
              <BikeCard
                key={bike.id}
                bike={bike}
                selected={selectedBike.id === bike.id}
                onSelect={apriDettaglio}
              />
            ))}
          </div>
        ) : (
          <CatalogoVuoto reparto={reparto} categoria={categoria} />
        )}

        {/*
          Gli altri marchi trattati ma non ancora a catalogo.
          L'elenco e' calcolato, non scritto a mano: man mano che carichiamo
          una gamma, quella marca sparisce da sola da questa riga.
        */}
        {reparto === 'nuovo' &&
          moto.length > 0 &&
          (() => {
            const mancanti = SITE.brands.filter((b) => !marche.includes(b));
            if (mancanti.length === 0) return null;
            return (
              <p className="max-w-2xl mx-auto -mt-6 mb-14 text-center text-xs text-slate-400 leading-relaxed">
                Trattiamo anche{' '}
                <strong className="text-slate-200">{mancanti.join(', ')}</strong>: per questi
                marchi chiamaci e ti diciamo cosa abbiamo in salone e cosa possiamo
                ordinarti.{' '}
                <a href={SITE.phone.href} className="text-[#D00020] font-semibold hover:underline">
                  {SITE.phone.display}
                </a>
              </p>
            );
          })()}

        {/* Dettaglio della moto scelta */}
        <div
          id="dettaglio-moto"
          className="bg-[#0b0c10] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative scroll-mt-24"
        >
          <div className="pb-6 border-b border-white/10 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D00020]">
                {selectedBike.brand}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{selectedBike.categoryLabel}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                  isUsato ? 'bg-slate-200 text-slate-900' : 'bg-[#D00020] text-white'
                }`}
              >
                {isUsato ? 'Usato' : 'Nuovo'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight mt-1">
              {selectedBike.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{selectedBike.subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBike.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Colonna sinistra: fotografie, descrizione e scheda */}
              <div className="lg:col-span-8">
                {haViste ? (
                  <BikeGallery bike={selectedBike} />
                ) : (
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-[#181920] to-[#0a0a0d] border border-white/5 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Camera className="w-12 h-12 text-slate-600 mb-3" />
                      <h4 className="text-xl font-bold font-display uppercase tracking-tight text-white">
                        Fotografie in arrivo
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-md">
                        Stiamo preparando le fotografie di questa moto. Nel frattempo vieni a
                        vederla in salone, oppure chiamaci e te la descriviamo.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-2xl bg-[#0e0f14] border border-white/10 p-6 sm:p-8">
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {selectedBike.description}
                  </p>

                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-[#D00020]" />
                    Scheda tecnica
                  </h4>

                  {hasAnySpec ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <SpecRow label="Motore" value={specs.engineType} />
                        <SpecRow label="Trasmissione" value={specs.transmission} />
                        <SpecRow label="Freni anteriori" value={specs.frontBrakes} />
                        <SpecRow label="Sospensioni" value={specs.suspension} />
                        {specs.seatHeightMm !== undefined && (
                          <SpecRow label="Altezza sella" value={`${specs.seatHeightMm} mm`} />
                        )}
                      </div>

                      {selectedBike.colors.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                            Livree disponibili
                          </h4>
                          <ul className="flex flex-wrap gap-2">
                            {selectedBike.colors.map((c) => (
                              <li
                                key={c.name}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-200"
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                  aria-hidden="true"
                                />
                                {c.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 p-4 rounded-lg bg-black/40 border border-white/5">
                      I dati tecnici di questa moto non sono ancora pubblicati su questo sito.
                      Chiamaci allo{' '}
                      <a href={SITE.phone.href} className="text-[#D00020] font-semibold hover:underline">
                        {SITE.phone.display}
                      </a>{' '}
                      e te li diamo subito.
                    </p>
                  )}

                  {hasFeatures && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                        Dotazioni
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {selectedBike.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#D00020] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna destra */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Dati dell'usato */}
                {isUsato && selectedBike.used && (
                  <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider pb-3 border-b border-white/10 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#D00020]" />
                      <span>Questo esemplare</span>
                    </div>
                    <dl className="mt-4 space-y-2 text-xs">
                      <Riga label="Immatricolazione" value={String(selectedBike.used.year)} />
                      <Riga label="Chilometri" value={formatKm(selectedBike.used.km)} />
                      {selectedBike.used.previousOwners !== undefined && (
                        <Riga label="Proprietari" value={String(selectedBike.used.previousOwners)} />
                      )}
                      {selectedBike.used.warrantyMonths !== undefined && (
                        <Riga label="Garanzia" value={`${selectedBike.used.warrantyMonths} mesi`} />
                      )}
                      {selectedBike.used.stockCode && (
                        <Riga label="Codice" value={selectedBike.used.stockCode} />
                      )}
                    </dl>
                  </div>
                )}

                {/* Dati principali */}
                <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider pb-3 border-b border-white/10 font-mono">
                    <span>Dati principali</span>
                    <span className="text-[#D00020] font-bold">{selectedBike.brand}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-4">
                    <MetricTile icon={Zap} value={valueOr(specs.powerHp, ' CV')} label="Potenza" />
                    <MetricTile
                      icon={Gauge}
                      value={valueOr(specs.displacementCc, ' cc')}
                      label="Cilindrata"
                    />
                    <MetricTile icon={Weight} value={valueOr(specs.weightKg, ' kg')} label="Peso" />
                    <MetricTile
                      icon={Fuel}
                      value={valueOr(specs.fuelCapacityL, ' L')}
                      label="Serbatoio"
                    />
                  </div>

                  {!hasAnySpec && (
                    <p className="text-[11px] text-slate-500 p-3 bg-black/40 rounded-xl border border-white/5">
                      I valori compariranno qui appena avremo i dati ufficiali.
                    </p>
                  )}
                </div>

                {/* Prezzo e azioni */}
                <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">
                        {isUsato ? 'Prezzo' : 'Prezzo da'}
                      </span>
                      {selectedBike.price !== undefined ? (
                        <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                          {formatEuro(selectedBike.price)}
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-white font-display">Su richiesta</div>
                      )}
                    </div>
                    {selectedBike.monthlyEstimate !== undefined && (
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Finanziamento da</span>
                        <span className="text-lg font-bold text-[#D00020] font-tech tabular-nums">
                          {formatEuro(selectedBike.monthlyEstimate)}
                        </span>
                        <span className="text-xs text-slate-400">/mese</span>
                      </div>
                    )}
                  </div>

                  {selectedBike.priceNote && (
                    <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
                      {selectedBike.priceNote}
                    </p>
                  )}

                  <div className="space-y-2.5 pt-2">
                    <a
                      href={SITE.phone.href}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Chiedi informazioni</span>
                    </a>

                    <button
                      onClick={() => onSelectForFinancing(selectedBike)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                      <Calculator className="w-4 h-4 text-[#D00020]" />
                      <span>Calcola la rata</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-center">
                    <p className="text-[11px] text-slate-500">
                      Permute valutate in giornata · Pratiche e immatricolazione incluse · Officina interna
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

/** Linguetta di un reparto del catalogo. */
const RepartoTab: React.FC<{
  attivo: boolean;
  onClick: () => void;
  label: string;
  conteggio: number;
}> = ({ attivo, onClick, label, conteggio }) => (
  <button
    onClick={onClick}
    aria-pressed={attivo}
    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
      attivo ? 'bg-[#D00020] text-white shadow-md' : 'text-slate-400 hover:text-white'
    }`}
  >
    <span>{label}</span>
    <span
      className={`px-1.5 py-0.5 text-[10px] font-bold rounded tabular-nums ${
        attivo ? 'bg-black/25 text-white' : 'bg-white/10 text-slate-400'
      }`}
    >
      {conteggio}
    </span>
  </button>
);

/** Messaggio quando un reparto non ha moto da mostrare. */
const CatalogoVuoto: React.FC<{ reparto: BikeCondition; categoria: BikeCategory }> = ({
  reparto,
  categoria,
}) => (
  <div className="max-w-xl mx-auto mb-14 text-center p-8 rounded-2xl bg-[#0e0f14] border border-white/10">
    <div className="inline-flex p-3 rounded-2xl bg-white/5 text-slate-400 mb-4">
      <Camera className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-bold text-white font-display">
      {reparto === 'usato'
        ? categoria === 'all'
          ? 'Nessun usato in vetrina al momento'
          : 'Nessun usato in questa categoria'
        : 'Nessun modello in questa categoria'}
    </h3>
    <p className="text-sm text-slate-400 mt-2">
      {reparto === 'usato'
        ? 'Il parco usato cambia di continuo e lo aggiorniamo ogni mese. Chiamaci e ti diciamo cosa abbiamo in arrivo, oppure dicci cosa cerchi e ce ne occupiamo noi.'
        : 'Prova a cambiare categoria, oppure chiamaci: in salone trovi anche modelli non ancora pubblicati qui.'}
    </p>
    <a
      href={SITE.phone.href}
      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl transition-transform hover:scale-105"
    >
      <PhoneCall className="w-4 h-4" />
      {SITE.phone.display}
    </a>
  </div>
);

const Riga: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-slate-400">{label}</dt>
    <dd className="text-white font-mono tabular-nums">{value}</dd>
  </div>
);

const SpecRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
    <div className="text-slate-400">{label}</div>
    <div className={`font-semibold mt-1 ${value ? 'text-white' : 'text-slate-500'}`}>
      {value ?? DATO_MANCANTE}
    </div>
  </div>
);

const MetricTile: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}> = ({ icon: Icon, value, label }) => {
  const missing = value === DATO_MANCANTE;
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/5 text-[#D00020] shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div
          className={`text-lg font-bold font-tech tabular-nums truncate ${
            missing ? 'text-slate-500 text-sm' : 'text-white'
          }`}
        >
          {value}
        </div>
        <div className="text-[11px] text-slate-400">{label}</div>
      </div>
    </div>
  );
};
