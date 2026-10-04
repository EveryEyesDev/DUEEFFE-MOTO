'use client';

import React from 'react';

/**
 * LA STRADA SOTTO LE MOTO
 *
 * E' una vera superficie in prospettiva, non una striscia piatta: un piano
 * di asfalto coricato all'indietro, che si stringe allontanandosi fino a
 * perdersi nel buio. La moto ci poggia sopra con le gomme, e la mezzeria
 * tratteggiata scorre: sembra che stia viaggiando.
 *
 * COME E' FATTA
 * Un solo riquadro ruotato attorno all'asse orizzontale dentro una scena
 * con prospettiva. Ruotandolo, il browser lo disegna come un pavimento che
 * si allontana: le righe vicine restano larghe, quelle lontane si
 * schiacciano e i tratti della mezzeria si accorciano man mano. E' lo
 * stesso effetto della fotografia mandata dal cliente, ma costruito col
 * codice: nessuna immagine da scaricare e nitido a qualunque dimensione.
 *
 * PERCHE' SCORRE COSI'
 * Il movimento e' una `transform`, che la scheda grafica applica da sola
 * senza ridisegnare nulla ad ogni fotogramma. Spostare la posizione dello
 * sfondo, invece, obbligherebbe il browser a ricalcolare la texture in
 * continuazione: era una delle ragioni per cui lo showcase scattava.
 *
 * Il livello della mezzeria sporge di una campitura per lato e si sposta di
 * esattamente una campitura: quando l'animazione riparte il disegno
 * coincide con quello di prima, quindi il giro non si vede.
 */

/** Lunghezza di una campitura: tratto bianco piu' il vuoto che lo segue. */
const CAMPITURA = 240;

/** Asfalto: grigi freddi con qualche screziatura, come il bitume vero. */
const ASFALTO = [
  // Chiazze chiare e scure sparse: tolgono l'effetto plastica.
  'radial-gradient(ellipse 40% 60% at 18% 30%, rgba(255,255,255,0.035), transparent 70%)',
  'radial-gradient(ellipse 35% 50% at 72% 55%, rgba(255,255,255,0.028), transparent 70%)',
  'radial-gradient(ellipse 30% 45% at 45% 80%, rgba(0,0,0,0.35), transparent 70%)',
  // Grana fitta.
  'repeating-linear-gradient(115deg, rgba(255,255,255,0.016) 0 2px, transparent 2px 5px)',
  'repeating-linear-gradient(28deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 7px)',
  // Il colore di fondo, piu' chiaro vicino e piu' scuro verso il fondo.
  'linear-gradient(to top, #2b2d33 0%, #212329 30%, #17181d 62%, #0c0d11 100%)',
].join(', ');

interface HorizontalRoadProps {
  /**
   * Da che parte scorre l'asfalto.
   * 'left' quando la moto guarda a destra (il nostro caso): sembra che vada
   * avanti.
   */
  direction?: 'left' | 'right';
  /** Secondi per ciclo: piu' basso, piu' veloce. */
  speedSeconds?: number;
  className?: string;
}

export const HorizontalRoad: React.FC<HorizontalRoadProps> = ({
  direction = 'left',
  speedSeconds = 1.6,
  className = '',
}) => {
  const animazione = {
    animationName: direction === 'left' ? 'scorri-strada-sinistra' : 'scorri-strada-destra',
    animationDuration: `${speedSeconds}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    willChange: 'transform',
  } as const;

  return (
    <div
      className={`w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ position: 'relative', perspective: '340px', perspectiveOrigin: '50% 0%' }}
    >
      {/* Il piano di asfalto, coricato all'indietro */}
      <div
        className="absolute inset-x-[-25%] bottom-0 h-[260%] origin-bottom"
        style={{ transform: 'rotateX(76deg)', background: ASFALTO }}
      >
        {/* Riga continua del margine lontano */}
        <div className="absolute inset-x-0 top-[14%] h-[3px] bg-white/25" />

        {/* La mezzeria tratteggiata in movimento */}
        <div className="absolute inset-x-0 top-[46%] h-[10px] overflow-hidden">
          <div
            className="strada-mezzeria absolute inset-y-0"
            style={{
              left: -CAMPITURA,
              right: -CAMPITURA,
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(245,245,240,0.88) 0px, rgba(245,245,240,0.88) 120px, transparent 120px, transparent 240px)',
              ...animazione,
            }}
          />
        </div>

        {/* Riga continua del margine vicino */}
        <div className="absolute inset-x-0 bottom-[16%] h-[5px] bg-white/30" />
      </div>

      {/* Il fondo si perde nel buio, come all'orizzonte */}
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-[#070709] via-[#070709]/80 to-transparent" />
      {/* E le estremita' laterali, cosi' la strada non finisce di netto */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#070709] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#070709] to-transparent" />
    </div>
  );
};
