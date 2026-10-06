'use client';

import React from 'react';
import Link from 'next/link';

/**
 * I marchi che trattiamo, con i loro stemmi.
 *
 * DOVE SI USANO
 * In home, una striscia sotto il racconto: dice in un colpo d'occhio
 * quali marche si trovano in salone, che e' la prima cosa che chiede chi
 * sta cercando una moto.
 * Nel catalogo, lo stemma accanto al nome nei pulsanti del filtro.
 *
 * GLI STEMMI SONO QUELLI UFFICIALI
 * Presi dai siti dei costruttori, non ridisegnati: un marchio storto o di
 * colore sbagliato si nota, e fa sembrare il sito improvvisato. Stanno in
 * public/brand/marchi/ e sono tutti alti 120 pixel, cosi' in fila
 * risultano della stessa misura senza doverli ritoccare uno per uno.
 *
 * SE UN MARCHIO NON HA LO STEMMA
 * Compare il nome scritto. Succede quando si aggiunge una marca nuova e lo
 * stemma non e' ancora stato messo: meglio il nome che un buco.
 */

/** Il file dello stemma, se ce l'abbiamo. */
export function stemmaDi(marca: string): string | null {
  const nome = marca
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const conosciuti = ['moto-morini', 'suzuki', 'voge'];
  return conosciuti.includes(nome) ? `/brand/marchi/${nome}.webp` : null;
}

/** Lo stemma piccolo, da mettere accanto a un nome. */
export const Stemma: React.FC<{ marca: string; classe?: string }> = ({ marca, classe = '' }) => {
  const file = stemmaDi(marca);
  if (!file) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={file}
      alt=""
      aria-hidden="true"
      className={`h-4 w-auto object-contain shrink-0 ${classe}`}
    />
  );
};

/**
 * La striscia dei marchi, per la home.
 *
 * A colori, perche' e' il posto dove devono farsi vedere: chi arriva sul
 * sito di una concessionaria la prima cosa che vuole sapere e' quali
 * marche ci trova. In grigio passavano inosservati, che e' l'opposto di
 * quello che servono a fare.
 *
 * Nel filtro del catalogo, invece, restano spenti finche' non li scegli:
 * li' sono comandi, e un comando acceso deve voler dire "questo e'
 * selezionato".
 *
 * Ogni stemma porta al catalogo gia' filtrato su quella marca.
 */
export const LoghiMarchi: React.FC<{ marche: string[] }> = ({ marche }) => {
  const conStemma = marche.filter((m) => stemmaDi(m));
  if (conStemma.length === 0) return null;

  return (
    <section className="border-y border-white/10 bg-[#0a0a0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 mb-7">
          I marchi che trattiamo
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-16">
          {conStemma.map((marca) => (
            <li key={marca}>
              <Link
                href={`/moto?marca=${encodeURIComponent(marca)}`}
                aria-label={`Vedi le moto ${marca}`}
                className="block group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stemmaDi(marca) as string}
                  alt={marca}
                  className="h-10 sm:h-12 w-auto object-contain opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105 motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
