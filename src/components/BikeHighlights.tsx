'use client';

import React from 'react';
import { Motorcycle } from '../types';
import { getVetrina, MOTO_NUOVE, MOTO_USATE } from '../data/motorcycles';
import { BikeCard } from './BikeCard';
import { ArrowRight } from 'lucide-react';

interface BikeHighlightsProps {
  /** Porta al catalogo completo. */
  onVediTutte: () => void;
  /** Apre una moto nel catalogo. */
  onSelectBike: (bike: Motorcycle) => void;
}

/**
 * Vetrina in home: qualche moto in evidenza e il rimando al catalogo completo.
 *
 * Quali moto compaiono si decide in src/data/motorcycles.ts, mettendo
 * `featured: true` sulla moto. Se non ne e' segnata nessuna, prende le prime.
 */
export const BikeHighlights: React.FC<BikeHighlightsProps> = ({ onVediTutte, onSelectBike }) => {
  const vetrina = getVetrina(3);
  const totale = MOTO_NUOVE.length + MOTO_USATE.length;

  if (vetrina.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#0a0a0d] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intestazione */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-[#D00020] mb-1">
              In evidenza
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight">
              Qualche moto dal nostro salone
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Una selezione dal catalogo. Dentro trovi tutte le moto nuove e il parco
              usato disponibile.
            </p>
          </div>

          <button
            onClick={onVediTutte}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <span>Vedi tutte le moto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Schede */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vetrina.map((bike) => (
            <BikeCard key={bike.id} bike={bike} onSelect={onSelectBike} />
          ))}
        </div>

        {/* Rimando in fondo */}
        <div className="mt-8 text-center">
          <button
            onClick={onVediTutte}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>
              Vedi di più: {totale} {totale === 1 ? 'moto' : 'moto'} in catalogo
            </span>
            <ArrowRight className="w-4 h-4 text-[#D00020]" />
          </button>
        </div>
      </div>
    </section>
  );
};
