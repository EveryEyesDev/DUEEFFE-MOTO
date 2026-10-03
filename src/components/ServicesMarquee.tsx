'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SITE } from '../config/site';

/** Pixel al secondo: velocita' costante, su schermo stretto come su schermo largo. */
const VELOCITA = 55;

/**
 * Striscia scorrevole sotto l'apertura.
 *
 * Elenca in continuo quello che fate: nuovo e usato, permuta, finanziamenti,
 * officina. Serve a dire in due secondi che non siete solo un salone.
 *
 * COME SI OTTIENE IL GIRO SENZA STACCHI
 * Il nastro ripete lo stesso gruppo di voci piu' volte, quante ne servono a
 * coprire tutta la larghezza dello schermo piu' una di scorta, e scorre
 * esattamente della larghezza di UN gruppo. Quando l'animazione torna al
 * punto di partenza, il gruppo successivo si trova gia' dove stava il primo:
 * l'occhio non vede nessun salto e nessuno spazio vuoto.
 *
 * Due copie sole non bastano: su uno schermo largo un gruppo puo' essere piu'
 * stretto della finestra, e a quel punto si vedrebbe il vuoto prima del
 * ricongiungimento. Per questo il numero di copie si calcola, non si fissa.
 *
 * La larghezza del gruppo dipende dal testo e dai caratteri, che arrivano
 * dalla rete: la misuriamo dopo il caricamento e la ricalcoliamo se la
 * finestra cambia dimensione.
 */
export const ServicesMarquee: React.FC = () => {
  const voci = SITE.marquee;

  const gruppoRef = useRef<HTMLDivElement>(null);
  const [larghezzaGruppo, setLarghezzaGruppo] = useState(0);
  const [copie, setCopie] = useState(2);

  const misura = useCallback(() => {
    const gruppo = gruppoRef.current;
    if (!gruppo) return;

    const larghezza = gruppo.getBoundingClientRect().width;
    if (larghezza <= 0) return;

    setLarghezzaGruppo(larghezza);
    // Copie necessarie a coprire lo schermo, piu' una che entra da destra.
    setCopie(Math.max(2, Math.ceil(window.innerWidth / larghezza) + 1));
  }, []);

  useEffect(() => {
    if (voci.length === 0) return;

    misura();

    // I caratteri arrivano dopo il primo disegno e cambiano la larghezza.
    document.fonts?.ready.then(misura).catch(() => {});

    const osservatore = new ResizeObserver(misura);
    if (gruppoRef.current) osservatore.observe(gruppoRef.current);
    window.addEventListener('resize', misura);

    return () => {
      osservatore.disconnect();
      window.removeEventListener('resize', misura);
    };
  }, [misura, voci.length]);

  if (voci.length === 0) return null;

  // Finche' non abbiamo misurato, il nastro resta fermo invece di animarsi
  // con una lunghezza sbagliata: meglio immobile che a scatti.
  const misurato = larghezzaGruppo > 0;
  const durata = misurato ? larghezzaGruppo / VELOCITA : 0;

  const Gruppo = ({ riferimento, nascosto }: { riferimento?: React.Ref<HTMLDivElement>; nascosto?: boolean }) => (
    <div ref={riferimento} className="flex shrink-0" aria-hidden={nascosto || undefined}>
      {voci.map((voce) => (
        <span
          key={voce}
          className="flex items-center gap-6 mr-6 shrink-0 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-white whitespace-nowrap"
        >
          {voce}
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="relative bg-[#D00020] overflow-hidden select-none"
      role="complementary"
      aria-label="I nostri servizi"
    >
      <div
        className={`flex w-max py-3 ${
          misurato ? 'motion-safe:animate-[scorri-nastro_var(--durata)_linear_infinite]' : ''
        }`}
        style={
          {
            '--larghezza-gruppo': `${larghezzaGruppo}px`,
            '--durata': `${durata}s`,
          } as React.CSSProperties
        }
      >
        {/* Il primo gruppo e' quello misurato ed e' l'unico letto ad alta voce */}
        <Gruppo riferimento={gruppoRef} />
        {Array.from({ length: copie - 1 }, (_, i) => (
          <Gruppo key={i} nascosto />
        ))}
      </div>
    </div>
  );
};
