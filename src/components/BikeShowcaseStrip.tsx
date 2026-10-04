'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Motorcycle } from '../types';
import { MOTO_NUOVE } from '../data/motorcycles';
import { ArrowRight, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { HorizontalRoad } from './HorizontalRoad';
import { formatNumero } from '../utils/format';

/** Indice della schermata piu' vicina alla posizione attuale. */
function schermataVicina(pista: HTMLElement): number {
  const figli = Array.from(pista.children) as HTMLElement[];
  let migliore = 0;
  let minima = Infinity;
  figli.forEach((figlio, i) => {
    const distanza = Math.abs(figlio.offsetLeft - pista.scrollLeft);
    if (distanza < minima) {
      minima = distanza;
      migliore = i;
    }
  });
  return migliore;
}

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
  /*
    QUANTE MOTO IN VETRINA
    Lo showcase e' un racconto, non il catalogo: ogni schermata occupa tutto
    lo schermo, quindi oltre una decina di moto diventa una fila
    interminabile e nessuno arriva in fondo. Qui mostriamo solo le gamme che
    hanno la scheda completa, e il catalogo vero sta subito sotto.
  */
  const moto = MOTO_NUOVE.filter((m) => m.specs.displacementCc !== undefined).slice(0, 8);
  const totale = moto.length;

  const pistaRef = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  /** Vero mentre si trascina col mouse. */
  const [trascinando, setTrascinando] = useState(false);
  /** Vero su telefoni e tavolette, dove lo scorrimento col dito e' gia' perfetto. */
  const [tocco, setTocco] = useState(false);
  /** Animazione in corso, per poterla fermare se ne parte un'altra. */
  const animazioneRef = useRef<number | null>(null);

  useEffect(() => {
    setTocco(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  /**
   * Porta in vista una schermata con un'animazione nostra.
   *
   * PERCHE' NON USIAMO scrollTo CON behavior 'smooth'
   * Lo scorrimento morbido del browser non ha durata controllabile, cambia
   * da browser a browser e soprattutto litiga con l'aggancio delle
   * schermate: l'aggancio prova a riallineare mentre l'animazione e' ancora
   * in corso, e il movimento risulta a scatti. Qui spostiamo noi la
   * posizione fotogramma per fotogramma, con una curva che parte decisa e
   * si addolcisce in arrivo. Il risultato e' identico su ogni browser.
   */
  const vaiA = useCallback((n: number, durata = 340) => {
    const pista = pistaRef.current;
    if (!pista) return;
    const schermata = pista.children[n] as HTMLElement | undefined;
    if (!schermata) return;

    if (animazioneRef.current !== null) cancelAnimationFrame(animazioneRef.current);

    const partenza = pista.scrollLeft;
    const distanza = schermata.offsetLeft - partenza;
    if (Math.abs(distanza) < 1) return;

    // Chi ha chiesto meno animazioni ci arriva subito.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pista.scrollLeft = schermata.offsetLeft;
      return;
    }

    const avvio = performance.now();
    const curva = (t: number) => 1 - Math.pow(1 - t, 3);

    const passo = (ora: number) => {
      const t = Math.min(1, (ora - avvio) / durata);
      pista.scrollLeft = partenza + distanza * curva(t);
      animazioneRef.current = t < 1 ? requestAnimationFrame(passo) : null;
    };
    animazioneRef.current = requestAnimationFrame(passo);
  }, []);

  // Quale schermata e' in vista: lo chiediamo al browser.
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

  /**
   * Rotella del mouse: una moto per volta.
   *
   * I trackpad mandano decine di impulsi minuscoli al secondo: senza filtro
   * la striscia schizzerebbe avanti di tre moto alla volta. Accumuliamo gli
   * impulsi e, superata una soglia, avanziamo di una schermata ignorando il
   * resto finche' l'animazione non e' finita.
   */
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista || tocco) return;

    const SOGLIA = 10;
    let accumulato = 0;
    let occupato = false;
    let sblocca: number | undefined;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const max = pista.scrollWidth - pista.clientWidth;
      const avanti = e.deltaY > 0;
      const puo = avanti ? pista.scrollLeft < max - 2 : pista.scrollLeft > 2;
      if (!puo) {
        accumulato = 0;
        return;
      }

      e.preventDefault();
      if (occupato) return;

      accumulato += e.deltaY;
      if (Math.abs(accumulato) < SOGLIA) return;

      const passo = accumulato > 0 ? 1 : -1;
      accumulato = 0;
      occupato = true;

      const prossima = Math.min(
        Math.max(schermataVicina(pista) + passo, 0),
        pista.children.length - 1,
      );
      vaiA(prossima);

      window.clearTimeout(sblocca);
      sblocca = window.setTimeout(() => {
        occupato = false;
        accumulato = 0;
      }, 240);
    };

    pista.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      pista.removeEventListener('wheel', onWheel);
      window.clearTimeout(sblocca);
    };
  }, [tocco, vaiA]);

  /** Trascinamento col mouse, come si sposta una fotografia sul tavolo. */
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista || tocco) return;

    let attivo = false;
    let partenzaX = 0;
    let partenzaScroll = 0;
    let spostamento = 0;

    const giu = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (animazioneRef.current !== null) cancelAnimationFrame(animazioneRef.current);
      attivo = true;
      spostamento = 0;
      partenzaX = e.clientX;
      partenzaScroll = pista.scrollLeft;
      setTrascinando(true);
    };

    const muovi = (e: PointerEvent) => {
      if (!attivo) return;
      const delta = e.clientX - partenzaX;
      spostamento = Math.abs(delta);
      pista.scrollLeft = partenzaScroll - delta;
    };

    const su = () => {
      if (!attivo) return;
      attivo = false;
      setTrascinando(false);
      // Al rilascio ci allineiamo alla schermata piu' vicina, con la stessa
      // curva morbida del resto: niente scatto secco.
      vaiA(schermataVicina(pista), 260);
    };

    // Un trascinamento non deve far scattare il pulsante sotto il puntatore.
    const clic = (e: MouseEvent) => {
      if (spostamento > 10) {
        e.preventDefault();
        e.stopPropagation();
        spostamento = 0;
      }
    };

    pista.addEventListener('pointerdown', giu);
    window.addEventListener('pointermove', muovi);
    window.addEventListener('pointerup', su);
    window.addEventListener('pointercancel', su);
    pista.addEventListener('click', clic, true);

    return () => {
      pista.removeEventListener('pointerdown', giu);
      window.removeEventListener('pointermove', muovi);
      window.removeEventListener('pointerup', su);
      window.removeEventListener('pointercancel', su);
      pista.removeEventListener('click', clic, true);
    };
  }, [tocco, vaiA]);

  // Fermiamo l'animazione quando il componente sparisce.
  useEffect(
    () => () => {
      if (animazioneRef.current !== null) cancelAnimationFrame(animazioneRef.current);
    },
    [],
  );

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
        className={`flex overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none ${
          tocco
            ? 'snap-x snap-mandatory'
            : trascinando
              ? 'cursor-grabbing select-none'
              : 'cursor-grab'
        }`}
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

      {/*
        AVANZAMENTO
        L'asfalto adesso sta sotto la moto, dove serve davvero: qui resta
        solo il contatore con una riga sottile, che dice a che punto siamo
        senza fare concorrenza alla strada.
      */}
      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 pb-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono tabular-nums text-white/80 shrink-0">
              {String(Math.min(indice + 1, totale + 1)).padStart(2, '0')}
            </span>

            <div className="relative flex-1 h-px bg-white/15">
              <div
                className="absolute inset-y-0 left-0 bg-[#D00020] transition-[width] duration-500 ease-out"
                style={{ width: `${((indice + 1) / (totale + 1)) * 100}%` }}
                aria-hidden="true"
              />
            </div>

            <span className="text-xs font-mono tabular-nums text-white/80 shrink-0">
              {String(totale + 1).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => vaiA(Math.max(indice - 1, 0))}
                disabled={indice === 0}
                aria-label="Moto precedente"
                className="p-2 rounded-full border border-white/20 bg-black/30 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => vaiA(Math.min(indice + 1, totale))}
                disabled={suUltima}
                aria-label="Moto successiva"
                className="p-2 rounded-full border border-white/20 bg-black/30 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Quali viste possiamo usare come apertura, in ordine di preferenza.
 *
 * Il frontale e il posteriore schiacciano la moto e a tutta schermata si
 * leggono male: restano in fondo, come ultima risorsa. I profili e le tre
 * quarti sono quelli che la raccontano meglio.
 */
const PREFERENZA = [
  'lato-destro',
  'angolo-destro',
  'lato-sinistro',
  'angolo-sinistro',
  'retro',
  'fronte',
];

/** Le viste prese dal lato sinistro mostrano la moto rivolta a sinistra. */
const GUARDA_A_SINISTRA = ['lato-sinistro', 'angolo-sinistro'];

/** Una moto, a tutta schermata. */
const Schermata: React.FC<{
  bike: Motorcycle;
  indice: number;
  attiva: boolean;
  onApri: () => void;
}> = ({ bike, indice, attiva, onApri }) => {
  /*
    TUTTE LE MOTO NELLA STESSA DIREZIONE
    Non tutti i modelli hanno le stesse fotografie: di alcuni il costruttore
    pubblica il profilo destro, di altri solo il sinistro. Mescolarle
    significherebbe vedere una moto andare a destra e la successiva a
    sinistra, con la strada che scorre sempre nello stesso verso.

    Percio' scegliamo sempre, quando c'e', una vista da destra; se il
    modello ha solo quelle da sinistra la ribaltiamo come allo specchio. Su
    una fotografia di profilo il ribaltamento non si nota, e il risultato e'
    una fila di moto tutte rivolte nello stesso senso di marcia.
  */
  const viste = bike.colorways?.[0]?.views ?? [];
  const scelta = PREFERENZA.map((id) => viste.find((v) => v.id === id)).find(Boolean);
  const vistaStudio = scelta?.src ?? viste[0]?.src ?? bike.image;
  const daRibaltare = scelta ? GUARDA_A_SINISTRA.includes(scelta.id) : false;

  /*
    LO SFONDO AMBIENTATO
    Usiamo la copia minuscola gia' sfocata (64 pixel, mezzo chilobyte)
    preparata da strumenti/sfondi-sfocati.py, non la fotografia grande con
    un filtro di sfocatura addosso: sfocare un'immagine da 1600 pixel ad
    ogni fotogramma era il motivo principale per cui lo scorrimento
    scattava. Ingrandendo una miniatura l'effetto e' lo stesso e non costa
    nulla.
  */
  const sfondo = bike.roadImage?.replace('/in-strada.webp', '/in-strada-sfondo.webp');

  const dati = [
    bike.specs.displacementCc !== undefined
      ? `${formatNumero(bike.specs.displacementCc)} cc`
      : null,
    bike.specs.powerHp !== undefined ? `${formatNumero(bike.specs.powerHp, 1)} CV` : null,
    bike.categoryLabel,
  ].filter((v): v is string => v !== null);

  const entra = (ritardo: string) =>
    `transition-[opacity,transform] duration-300 ease-out ${ritardo} ${
      attiva ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`;

  return (
    <article
      data-indice={indice}
      // `contain` dice al browser che quello che succede qui dentro non
      // influenza il resto della pagina: puo' quindi ridisegnare una sola
      // schermata invece di tutta la striscia.
      style={{ contain: 'layout paint style' }}
      className="relative shrink-0 w-full h-[88vh] min-h-[600px] snap-start snap-always overflow-hidden flex"
    >
      {/* SFONDO: la foto ambientata, sfocata e scurita, piu' fitta a sinistra
          dove ci sono i testi, che devono restare sempre leggibili. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#070709]" />

        {sfondo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sfondo}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-40 saturate-[0.7]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/85 to-[#070709]/55" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent lg:h-1/3 lg:via-transparent" />

        {/* Alone del marchio. E' una sfumatura circolare, non una macchia
            sfocata: stesso effetto, senza chiedere al browser di calcolare
            una sfocatura da 140 pixel per ogni schermata. */}
        <div
          className="absolute top-[22%] left-1/2 -translate-x-1/2 lg:top-1/2 lg:left-auto lg:right-[18%] lg:translate-x-0 lg:-translate-y-1/2 w-[75vw] max-w-[900px] aspect-square rounded-full transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(circle, rgba(208,0,32,0.16) 0%, rgba(208,0,32,0.05) 45%, transparent 70%)',
            opacity: attiva ? 1 : 0.3,
          }}
        />
      </div>

      {/*
        LA MOTO SULLA STRADA
        Strada e moto sono un blocco solo, cosi' restano sempre incollati.
        L'asfalto sta sotto e la moto gli poggia sopra: e' spostata un po'
        piu' in alto del margine vicino, come se stesse in mezzo alla
        carreggiata invece che sul ciglio.

        L'altezza della fotografia e' fissa e uguale per ogni modello:
        qualunque sia la moto occupa lo stesso spazio e le ruote toccano
        sempre la stessa riga di asfalto. Il limite di larghezza tiene la
        moto nella meta' destra dello schermo, lontana dai testi.
      */}
      <div className="absolute inset-x-0 bottom-[4%] lg:bottom-[9%] h-[22vh] lg:h-[30vh] pointer-events-none">
        <div className="absolute inset-0">
          <HorizontalRoad direction="left" speedSeconds={1.6} />
        </div>

        {/* L'ombra a terra: una sfumatura ovale, non un filtro sull'immagine. */}
        <div
          className="absolute bottom-[4vh] lg:bottom-[7vh] left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[10%] w-[62vw] lg:w-[34vw] h-[3vh] lg:h-[5vh] transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, transparent 72%)',
            opacity: attiva ? 1 : 0,
          }}
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-[5vh] lg:bottom-[8vh] flex justify-center lg:justify-end lg:pr-[6%]">
          {vistaStudio ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vistaStudio}
              alt={`${bike.brand} ${bike.name}`}
              loading={indice < 3 ? 'eager' : 'lazy'}
              decoding="async"
              className={`h-[30vh] lg:h-[58vh] w-auto max-w-[92vw] lg:max-w-[48vw] object-contain object-bottom transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                daRibaltare ? '-scale-x-100' : ''
              } ${attiva ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="h-[30vh] lg:h-[58vh] flex flex-col items-center justify-center gap-3 text-slate-700">
              <Camera className="w-16 h-16" />
              <span className="text-xs uppercase tracking-widest">Fotografia in arrivo</span>
            </div>
          )}
        </div>
      </div>

      {/* Il testo */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 self-end lg:self-center pb-[36vh] lg:pb-0 lg:-mt-[6vh]">
        <div className="max-w-xl">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D00020] ${entra('delay-[40ms]')}`}>
            {bike.brand}
          </p>

          <h2
            className={`mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display uppercase tracking-tight leading-[0.95] ${entra('delay-[80ms]')}`}
          >
            {bike.name}
          </h2>

          {bike.claim && (
            <p className={`mt-4 text-base sm:text-lg text-slate-300 ${entra('delay-[120ms]')}`}>
              {bike.claim}
            </p>
          )}

          <div
            className={`mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/85 ${entra('delay-[160ms]')}`}
          >
            {dati.map((d, n) => (
              <React.Fragment key={d}>
                {n > 0 && <span className="w-1 h-1 rounded-full bg-[#D00020]" aria-hidden="true" />}
                <span className="font-tech tabular-nums">{d}</span>
              </React.Fragment>
            ))}
          </div>

          <div className={`mt-9 ${entra('delay-200')}`}>
            <button
              type="button"
              onClick={onApri}
              className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white"
            >
              <span className="border-b-2 border-[#D00020] pb-1">Scopri la moto</span>
              <ArrowRight className="w-4 h-4 text-[#D00020] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
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
    className="relative shrink-0 w-full h-[88vh] min-h-[600px] snap-start snap-always overflow-hidden flex items-center justify-center"
  >
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#070709]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[700px] aspect-square bg-[#D00020]/10 blur-[140px] rounded-full" />
    </div>

    <div
      className={`relative z-10 text-center px-6 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
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
