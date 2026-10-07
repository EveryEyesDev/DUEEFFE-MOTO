'use client';

import React from 'react';
import { Motorcycle } from '../types';
import { Camera, Calendar, Gauge, ShieldCheck, ChevronRight } from 'lucide-react';
import { formatEuro, formatKm } from '../utils/format';

interface BikeCardProps {
  bike: Motorcycle;
  /** Cosa succede quando si sceglie la moto. */
  onSelect?: (bike: Motorcycle) => void;
  /** Evidenzia la scheda come selezionata. */
  selected?: boolean;
}

/**
 * Scheda di una moto nel catalogo.
 *
 * Funziona sia per il nuovo sia per l'usato: se la moto e' usata
 * mostra anno, chilometri ed eventuale garanzia.
 */
/**
 * L'indirizzo della copia ridotta, quella fatta su misura del riquadro.
 *
 * La copia la scrive strumenti/foto-elenco.py accanto all'originale. Se
 * per qualche moto non ci fosse, il riquadro resterebbe vuoto: e' il
 * motivo per cui quello strumento va rilanciato quando si cambia una
 * fotografia su strada.
 */
function perElenco(percorso: string | undefined): string | undefined {
  return percorso?.replace('/in-strada.webp', '/in-strada-elenco.webp');
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike, onSelect, selected = false }) => {
  const isUsato = bike.condition === 'usato';
  const venduta = bike.used?.sold === true;

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden border bg-[#0e0f14] transition-all ${
        selected
          ? 'border-[#D00020] ring-1 ring-[#D00020] shadow-lg shadow-red-950/40'
          : 'border-white/10 hover:border-white/25'
      } ${venduta ? 'opacity-60' : ''}`}
    >
      {/* Immagine */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#181920] to-[#0a0a0d] flex items-center justify-center overflow-hidden">
        {/* Nel catalogo la moto si mostra su strada: e' la fotografia che
            fa innamorare. Le viste studio stanno nel dettaglio. */}
        {bike.roadImage ?? bike.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perElenco(bike.roadImage ?? bike.image)}
            alt={`${bike.brand} ${bike.name}`}
            // Pigro e asincrono: in pagina ci sono cinquanta riquadri e se ne
            // vedono quattro. Senza, il browser scaricava tutto subito e la
            // prima schermata aspettava anche le moto in fondo all'elenco.
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <Camera className="w-8 h-8" />
            <span className="text-[11px] uppercase tracking-wider">Foto in arrivo</span>
          </div>
        )}

        {/* Etichette in alto */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
              isUsato ? 'bg-slate-200 text-slate-900' : 'bg-[#D00020] text-white'
            }`}
          >
            {isUsato ? 'Usato' : 'Nuovo'}
          </span>
          {bike.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-black/75 text-white border border-white/20">
              {bike.badge}
            </span>
          )}
        </div>

        {venduta && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest text-white border-2 border-white rotate-[-8deg]">
              Venduta
            </span>
          </div>
        )}
      </div>

      {/* Testo */}
      <div className="flex flex-col flex-1 p-4">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{bike.brand}</span>
        <h3 className="text-base font-bold text-white font-display leading-tight">{bike.name}</h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{bike.subtitle}</p>

        {/* Dati dell'usato */}
        {isUsato && bike.used && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#D00020]" />
              {bike.used.year}
            </span>
            <span className="inline-flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#D00020]" />
              {formatKm(bike.used.km)}
            </span>
            {bike.used.warrantyMonths !== undefined && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D00020]" />
                {bike.used.warrantyMonths} mesi
              </span>
            )}
          </div>
        )}

        {/* Prezzo e azione */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            {bike.price !== undefined ? (
              <>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                  {isUsato ? 'Prezzo' : 'Da'}
                </span>
                <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                  {formatEuro(bike.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-300">Prezzo su richiesta</span>
            )}
            {bike.monthlyEstimate !== undefined && (
              <span className="block text-[11px] text-[#D00020] font-semibold">
                da {formatEuro(bike.monthlyEstimate)}/mese
              </span>
            )}
          </div>

          {onSelect && !venduta && (
            <button
              type="button"
              onClick={() => onSelect(bike)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-white/5 hover:bg-[#D00020] border border-white/10 hover:border-[#D00020] rounded-lg transition-colors whitespace-nowrap"
            >
              Dettagli
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
