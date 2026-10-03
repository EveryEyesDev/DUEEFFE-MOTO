'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Motorcycle } from '../types';
import { MOTO_NUOVE } from '../data/motorcycles';
import { ArrowRight, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { formatNumero } from '../utils/format';

interface BikeShowcaseStripProps {
  /** Apre il dettaglio di una moto. */
  onApriMoto: (bike: Motorcycle) => void;
  /** Porta al futuro aiuto alla scelta. Per ora rimanda al catalogo. */
  onTrovaLaTua: () => void;
}

/**
 * Striscia a tutto schermo: una moto per schermata, scorrimento orizzontale.
 *
 * COME FUNZIONA LO SCORRIMENTO
 * E' un normale contenitore con `overflow-x` e aggancio (`scroll-snap`):
 * su telefono e tablet lo scorrimento col dito e' quello nativo del browser,
 * senza una riga di codice.
 *
 * Su schermo grande, con il mouse, intercettiamo la rotella e la convertiamo
 * in avanzamento orizzontale, ma SOLO finche' la striscia ha ancora qualcosa
 * da mostrare in quella direzione: arrivati in fondo lasciamo che la pagina
 * riprenda a scorrere normalmente, cosi' non si resta mai intrappolati.
 *
 * Chi ha chiesto meno animazioni nelle impostazioni del dispositivo non vede
 * ne' le entrate in dissolvenza ne' lo scorrimento morbido.
 */
export const BikeShowcaseStrip: React.FC<BikeShowcaseStripProps> = ({
  onApriMoto,
  onTrovaLaTua,
}) => {
  const moto = MOTO_NUOVE;
  const totale = moto.length;

  const pistaRef = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);

  /** Porta in vista la schermata numero n. */
  const vaiA = useCallback((n: number) => {
    const pista = pistaRef.current;
    if (!pista) return;
    const schermata = pista.children[n] as HTMLElement | undefined;
    schermata?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, []);

  // Quale schermata e' in vista: lo chiediamo al browser invece di calcolarlo.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (!voce.isIntersecting) continue;
          const n = Number((voce.target as HTMLElement).dataset.indice);
          if (!Number.isNaN(n)) setIndice(n);
        }
      },
      { root: pista, threshold: 0.55 },
    );

    for (const figlio of Array.from(pista.children)) osservatore.observe(figlio);
    return () => osservatore.disconnect();
  }, [totale]);

  // Rotella del mouse: avanza nella striscia finche' ha senso.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onWheel = (e: WheelEvent) => {
      // I gesti chiaramente orizzontali li lasciamo al browser.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const max = pista.scrollWidth - pista.clientWidth;
      const versoDestra = e.deltaY > 0;
      const puoAvanzare = versoDestra ? pista.scrollLeft < max - 2 : pista.scrollLeft > 2;

      // Siamo a un capo della striscia: la pagina riprende a scorrere.
      if (!puoAvanzare) return;

      e.preventDefault();
      pista.scrollLeft += e.deltaY;
    };

    pista.addEventListener('wheel', onWheel, { passive: false });
    return () => pista.removeEventListener('wheel', onWheel);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      vaiA(Math.min(indice + 1, totale));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      vaiA(Math.max(indice - 1, 0));
    }
  };

  const suUltima = indice >= totale;

  return (
    <section
      id="showcase"
      aria-label="Le nostre moto, una per schermata"
      className="relative bg-[#070709] border-b border-white/10 scroll-mt-20"
    >
      <div
        ref={pistaRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {moto.map((bike, i) => (
          <Schermata
            key={bike.id}
            bike={bike}
            indice={i}
            attiva={indice === i}
            onApri={() => onApriMoto(bike)}
          />
        ))}

        <SchermataFinale indice={totale} attiva={suUltima} onTrova={onTrovaLaTua} />
      </div>

      {/* Avanzamento e comandi */}
      <div className="absolute bottom-6 inset-x-0 z-20 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-4">
          <span className="text-xs font-mono tabular-nums text-white/70 shrink-0">
            {String(Math.min(indice + 1, totale + 1)).padStart(2, '0')}
          </span>

          <div className="flex-1 h-px bg-white/15 relative">
            <div
              className="absolute inset-y-0 left-0 bg-[#D00020] transition-all duration-500"
              style={{ width: `${((indice + 1) / (totale + 1)) * 100}%` }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#D00020] transition-all duration-500"
              style={{ left: `${((indice + 1) / (totale + 1)) * 100}%` }}
              aria-hidden="true"
            />
          </div>

          <span className="text-xs font-mono tabular-nums text-white/70 shrink-0">
            {String(totale + 1).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => vaiA(Math.max(indice - 1, 0))}
              disabled={indice === 0}
              aria-label="Moto precedente"
              className="p-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => vaiA(Math.min(indice + 1, totale))}
              disabled={suUltima}
              aria-label="Moto successiva"
              className="p-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Una moto, a tutta schermata. */
const Schermata: React.FC<{
  bike: Motorcycle;
  indice: number;
  attiva: boolean;
  onApri: () => void;
}> = ({ bike, indice, attiva, onApri }) => {
  const foto = bike.gallery?.[0] ?? bike.image;

  // I dati tecnici si mostrano solo se ci sono davvero.
  const dati = [
    bike.specs.displacementCc !== undefined
      ? `${formatNumero(bike.specs.displacementCc)} cc`
      : null,
    bike.specs.powerHp !== undefined ? `${formatNumero(bike.specs.powerHp, 1)} CV` : null,
    bike.categoryLabel,
  ].filter((v): v is string => v !== null);

  // Le entrate sono scalate: prima il nome, poi i dati, infine l'invito.
  const entra = (ritardo: string) =>
    `transition-all duration-700 ease-out ${ritardo} ${
      attiva ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`;

  return (
    <article
      data-indice={indice}
      className="relative shrink-0 w-screen h-[88vh] min-h-[600px] snap-start snap-always overflow-hidden flex"
    >
      {/* Atmosfera: aloni costruiti dal colore del marchio, non foto di terzi */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#070709]" />
        <div
          className="absolute top-[26%] left-1/2 -translate-x-1/2 lg:top-1/2 lg:left-auto lg:right-[18%] lg:translate-x-0 lg:-translate-y-1/2 w-[75vw] max-w-[900px] aspect-square bg-[#D00020]/10 blur-[140px] rounded-full transition-opacity duration-1000"
          style={{ opacity: attiva ? 1 : 0.3 }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070709] to-transparent" />
      </div>

      {/* La moto: il protagonista */}
      <div className="absolute inset-x-0 top-0 h-[52%] lg:inset-0 lg:h-auto flex items-center justify-center lg:justify-end lg:pr-[6%] pointer-events-none">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={`${bike.brand} ${bike.name}`}
            className={`w-[104%] sm:w-[88%] lg:w-[62%] max-h-full lg:max-h-[72vh] object-contain transition-all duration-1000 ease-out motion-reduce:transition-none ${
              attiva ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-700">
            <Camera className="w-16 h-16" />
            <span className="text-xs uppercase tracking-widest">Fotografia in arrivo</span>
          </div>
        )}
      </div>

      {/* Il testo, a sinistra, senza coprire la moto */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 self-end lg:self-center pb-24 lg:pb-0">
        <div className="max-w-xl">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D00020] ${entra('delay-100')}`}>
            {bike.brand}
          </p>

          <h2
            className={`mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display uppercase tracking-tight leading-[0.95] ${entra('delay-150')}`}
          >
            {bike.name}
          </h2>

          {bike.claim && (
            <p className={`mt-4 text-base sm:text-lg text-slate-300 ${entra('delay-300')}`}>
              {bike.claim}
            </p>
          )}

          <div
            className={`mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/85 ${entra('delay-500')}`}
          >
            {dati.map((d, n) => (
              <React.Fragment key={d}>
                {n > 0 && <span className="w-1 h-1 rounded-full bg-[#D00020]" aria-hidden="true" />}
                <span className="font-tech tabular-nums">{d}</span>
              </React.Fragment>
            ))}
          </div>

          <button
            type="button"
            onClick={onApri}
            className={`mt-9 group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white ${entra('delay-700')}`}
          >
            <span className="border-b-2 border-[#D00020] pb-1">Scopri la moto</span>
            <ArrowRight className="w-4 h-4 text-[#D00020] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
};

/** Chiusura della striscia: l'invito a farsi aiutare nella scelta. */
const SchermataFinale: React.FC<{ indice: number; attiva: boolean; onTrova: () => void }> = ({
  indice,
  attiva,
  onTrova,
}) => (
  <article
    data-indice={indice}
    className="relative shrink-0 w-screen h-[88vh] min-h-[560px] snap-start snap-always overflow-hidden flex items-center justify-center"
  >
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#070709]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[700px] aspect-square bg-[#D00020]/10 blur-[140px] rounded-full" />
    </div>

    <div
      className={`relative z-10 text-center px-6 transition-all duration-700 ease-out motion-reduce:transition-none ${
        attiva ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display uppercase tracking-tight leading-tight">
        Non sai quale scegliere?
      </h2>
      <p className="mt-4 text-base text-slate-400">Trova la moto che fa per te.</p>

      <button
        type="button"
        onClick={onTrova}
        className="mt-9 group inline-flex items-center gap-3 px-7 py-4 text-sm font-bold uppercase tracking-widest text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-xl shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
      >
        <span>Trova la tua moto</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </article>
);
