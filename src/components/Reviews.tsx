'use client';

import React from 'react';
import { Star, ExternalLink, ShieldCheck, Wrench, Users } from 'lucide-react';
import { SITE, MAPS_URL } from '../config/site';

/** Le cinque stelle, piene fino al voto. */
const Stelle: React.FC<{ voto: number; size?: string }> = ({ voto, size = 'w-5 h-5' }) => (
  <span className="inline-flex items-center gap-1" aria-label={`${voto} stelle su 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${size} ${n <= Math.round(voto) ? 'text-[#D00020] fill-current' : 'text-slate-600'}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

/** Perche' i clienti tornano: parole nostre, non testi di terzi. */
const MOTIVI = [
  {
    icon: Wrench,
    titolo: 'Officina interna',
    testo: 'Chi ti consiglia in salone è la stessa persona che conosce la moto sul ponte.',
  },
  {
    icon: ShieldCheck,
    titolo: 'Preventivi chiari',
    testo: 'Quanto viene lo sai prima che iniziamo, non quando vieni a ritirarla.',
  },
  {
    icon: Users,
    titolo: 'Ci siamo anche dopo',
    testo: 'La vendita è l’inizio del rapporto, non la fine. È lì che si vede la differenza.',
  },
];

/**
 * Riscontro dei clienti.
 *
 * Mostriamo il VOTO COMPLESSIVO e il numero di recensioni, non i testi.
 *
 * PERCHE' COSI'
 * Il voto medio e' un dato di fatto verificabile, e chi vuole leggere le
 * recensioni le trova sulla scheda Google in un clic. Riportare invece i
 * testi e i nomi di chi li ha scritti significherebbe ripubblicare dati
 * personali di persone che non hanno acconsentito a comparire qui, e
 * sceglierne alcune farebbe scattare l'obbligo di dichiarare come sono
 * state selezionate. Il voto da solo evita tutto questo e convince
 * praticamente allo stesso modo.
 *
 * Se un giorno raccoglierete testimonianze vostre, con il consenso di chi
 * le scrive, quelle si potranno pubblicare per esteso senza problemi.
 */
export const Reviews: React.FC = () => {
  if (!SITE.googleReviews.enabled) return null;

  const { rating, count, asOf } = SITE.googleReviews;
  const voto = rating.toString().replace('.', ',');
  const linkRecensioni = SITE.googleReviews.url || MAPS_URL;

  return (
    <section
      id="recensioni"
      className="py-16 sm:py-20 bg-[#070709] border-b border-white/10 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#D00020] mb-1">
            Dicono di noi
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight">
            Il giudizio di chi è passato da noi
          </h2>
        </div>

        {/* Il voto, in grande */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-8 rounded-2xl bg-[#0e0f14] border border-white/10 text-center sm:text-left">
            <div className="shrink-0">
              <div className="text-6xl font-extrabold text-white font-tech tabular-nums leading-none">
                {voto}
              </div>
              <div className="mt-3 flex justify-center sm:justify-start">
                <Stelle voto={rating} />
              </div>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-10">
              <p className="text-base text-slate-200 leading-relaxed">
                <strong className="text-white">{count} recensioni</strong> su Google, con una
                media di {voto} stelle su cinque.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Dato aggiornato a {asOf}. Le recensioni sono pubblicate su Google e non sono
                filtrate né selezionate da noi.
              </p>
              <a
                href={linkRecensioni}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Leggile tutte su Google</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Perche' tornano */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 max-w-5xl mx-auto">
          {MOTIVI.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.titolo}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center"
              >
                <div className="inline-flex p-2.5 rounded-xl bg-[#D00020]/10 text-[#D00020] mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-display">{m.titolo}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{m.testo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
