'use client';

import React, { useEffect, useRef } from 'react';

/**
 * L'alone rosso che segue il puntatore.
 *
 * COME E' FATTO PER NON PESARE
 * E' un riquadro solo, fermo sopra la pagina, con dentro una sfumatura
 * circolare. Non si ridisegna: si sposta. Muovere un elemento con
 * `transform` e' l'unica cosa che il browser sa fare senza rifare il
 * calcolo della pagina ne' ridipingerla - se ne occupa la scheda video - e
 * a sessanta fotogrammi al secondo la differenza fra spostare e ridisegnare
 * e' fra il non accorgersene e il sito che singhiozza.
 *
 * React qui non entra. Il puntatore manda decine di eventi al secondo e
 * farne uno stato vorrebbe dire decine di ridisegni al secondo di tutta la
 * pagina: si scrive direttamente sull'elemento, attraverso il riferimento.
 *
 * E non si scrive nemmeno a ogni evento. Gli eventi arrivano piu' fitti di
 * quanto lo schermo sappia mostrare, quindi si segna solo dove si trova il
 * puntatore e si sposta una volta per fotogramma, quando il browser lo
 * chiede. Il resto sarebbe lavoro buttato.
 *
 * QUANDO NON COMPARE
 * Su telefoni e tavolette, dove il puntatore non esiste e l'alone
 * resterebbe fermo in un angolo. E quando il sistema dice di ridurre le
 * animazioni: chi lo imposta spesso lo fa perche' il movimento gli da'
 * fastidio davvero.
 *
 * Non serve nasconderlo anche da CSS a schermo stretto: finche' nessun
 * puntatore si muove resta trasparente, e su un telefono non si muove mai.
 * Una classe in piu' avrebbe solo aggiunto un secondo posto dove la stessa
 * decisione poteva divergere.
 *
 * PERCHE' STA DAVANTI E NON DIETRO
 * Dietro non si vedeva. Ogni sezione del sito ha il suo fondo pieno, e un
 * alone messo sotto resta coperto: lo stesso inciampo gia' preso con la
 * griglia tecnica, che era in pagina da giorni e non l'aveva vista
 * nessuno.
 *
 * Davanti pero' un velo rosso sopra il testo lo sporcherebbe. La via
 * d'uscita e' `mix-blend-mode: screen`, che sa solo schiarire: dove la
 * pagina e' quasi nera il rosso si vede, dove c'e' una scritta bianca non
 * cambia niente, perche' piu' di bianco non si puo' andare. Il testo resta
 * leggibile come prima e il fondo si accende.
 *
 * SUL RESTO DEL SITO NON INCIDE
 * Non intercetta i clic (pointer-events: none) e per chi legge con la voce
 * non esiste (aria-hidden): e' decorazione pura, non cambia una riga di
 * quello che Google legge.
 */

/** Quanto l'alone insegue il puntatore: 1 lo incolla, 0,12 lo fa scivolare. */
const INSEGUIMENTO = 0.12;

export const BagliorePuntatore: React.FC = () => {
  const alone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = alone.current;
    if (!elemento) return;

    const niente = window.matchMedia('(prefers-reduced-motion: reduce)');
    const conPuntatore = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (niente.matches || !conPuntatore.matches) return;

    // Dove sta il puntatore, e dove e' arrivato l'alone: la distanza fra i
    // due e' quello che gli da' l'aria di seguirti invece di essere
    // attaccato alla freccia.
    let versoX = window.innerWidth / 2;
    let versoY = window.innerHeight / 2;
    let x = versoX;
    let y = versoY;
    let acceso = false;
    let fotogramma = 0;

    const segna = (e: PointerEvent) => {
      versoX = e.clientX;
      versoY = e.clientY;
      if (!acceso) {
        acceso = true;
        elemento.style.opacity = '1';
      }
    };

    const spegni = () => {
      acceso = false;
      elemento.style.opacity = '0';
    };

    const passo = () => {
      x += (versoX - x) * INSEGUIMENTO;
      y += (versoY - y) * INSEGUIMENTO;
      // translate3d e non translate: cosi' l'elemento si prende un livello
      // suo sulla scheda video e non trascina nel ridisegno quello che ha
      // sotto.
      elemento.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      fotogramma = requestAnimationFrame(passo);
    };

    window.addEventListener('pointermove', segna, { passive: true });
    document.addEventListener('pointerleave', spegni);
    fotogramma = requestAnimationFrame(passo);

    return () => {
      window.removeEventListener('pointermove', segna);
      document.removeEventListener('pointerleave', spegni);
      cancelAnimationFrame(fotogramma);
    };
  }, []);

  return (
    <div
      ref={alone}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[22rem] w-[22rem] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
      style={{
        // Rosso del marchio. Con `screen` i valori si sommano alla pagina
        // invece di coprirla, quindi si puo' tenere piu' acceso di quanto
        // si potrebbe con un velo normale senza spegnere le scritte.
        //
        // Stretto e acceso invece che largo e smorto: un alone grande e
        // tenue si confondeva con le sfumature che il sito ha gia' di suo e
        // sembrava una macchia, uno piccolo si legge come un fascio che
        // viene dal puntatore.
        background:
          'radial-gradient(circle, rgba(208,0,32,0.38) 0%, rgba(208,0,32,0.16) 40%, rgba(208,0,32,0) 70%)',
        mixBlendMode: 'screen',
      }}
    />
  );
};
