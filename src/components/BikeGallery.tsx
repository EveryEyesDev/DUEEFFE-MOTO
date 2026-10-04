'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Motorcycle } from '../types';

interface BikeGalleryProps {
  bike: Motorcycle;
}

/**
 * Galleria del dettaglio moto.
 *
 * Mostra SOLO le viste studio su fondo bianco: fronte, retro, i due profili
 * e le due inclinate. La fotografia su strada non entra qui: quella serve a
 * far innamorare nel catalogo, questa serve a far vedere la moto per com'e'.
 *
 * Se il modello ha piu' livree, sotto compare il selettore dei colori e le
 * sei viste cambiano di conseguenza, restando sulla stessa inquadratura.
 */
export const BikeGallery: React.FC<BikeGalleryProps> = ({ bike }) => {
  // Senza moto non c'e' niente da mostrare. Succede per un istante
  // quando il dettaglio si apre prima che la scelta sia arrivata:
  // senza questo controllo la pagina si pianta.
  const livree = bike?.colorways ?? [];
  const [livrea, setLivrea] = useState(0);
  const [vista, setVista] = useState(0);

  // Cambiando moto si riparte dalla prima livrea e dalla prima vista.
  useEffect(() => {
    setLivrea(0);
    setVista(0);
  }, [bike?.id]);

  if (livree.length === 0) return null;

  const corrente = livree[Math.min(livrea, livree.length - 1)];
  const viste = corrente.views;
  const indice = Math.min(vista, viste.length - 1);
  const attuale = viste[indice];

  const vai = (passo: number) =>
    setVista((i) => (((i + passo) % viste.length) + viste.length) % viste.length);

  /** Passando a un'altra livrea si resta sulla stessa inquadratura. */
  const cambiaLivrea = (n: number) => {
    const idVista = attuale.id;
    setLivrea(n);
    const corrispondente = livree[n].views.findIndex((v) => v.id === idVista);
    setVista(corrispondente >= 0 ? corrispondente : 0);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          vai(-1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          vai(1);
        }
      }}
      className="w-full focus:outline-none"
    >
      {/* Immagine grande */}
      <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden bg-white border border-white/10">
        {viste.map((v) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${corrente.slug}-${v.id}`}
            src={v.src}
            alt={`${bike.brand} ${bike.name} ${corrente.name}, ${v.label.toLowerCase()}`}
            // Tutte montate e incrociate per opacita': il cambio e' istantaneo
            // e senza il lampo bianco del caricamento.
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              v.id === attuale.id ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {viste.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => vai(-1)}
              aria-label="Vista precedente"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => vai(1)}
              aria-label="Vista successiva"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/65 text-white text-[11px] font-semibold backdrop-blur-sm">
              {attuale.label}
            </span>
          </>
        )}
      </div>

      {/* Miniature delle viste */}
      {viste.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {viste.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVista(i)}
              aria-label={v.label}
              aria-pressed={i === indice}
              className={`relative shrink-0 w-20 aspect-[16/11] rounded-lg overflow-hidden border bg-white transition-all ${
                i === indice
                  ? 'border-[#D00020] ring-1 ring-[#D00020]'
                  : 'border-white/10 opacity-55 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.src} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Selettore delle livree */}
      {livree.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 mr-1">Livrea</span>
          {livree.map((l, i) => (
            <button
              key={l.slug}
              type="button"
              onClick={() => cambiaLivrea(i)}
              aria-pressed={i === livrea}
              className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                i === livrea
                  ? 'border-[#D00020] bg-[#D00020]/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full border border-white/25 shrink-0"
                style={{ backgroundColor: l.hex }}
                aria-hidden="true"
              />
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
