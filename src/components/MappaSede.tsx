'use client';

import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { SITE, MAP_EMBED_URL, DIRECTIONS_URL } from '../config/site';

/**
 * La mappa della sede, che si carica solo quando la si chiede.
 *
 * PERCHE' NON PARTE DA SOLA
 * La mappa di Google e' un pezzo di sito di Google dentro il nostro:
 * appena si carica, Google sa che quella persona e' passata di qui e le
 * mette dei cookie, anche se lei la mappa non la guarda nemmeno.
 *
 * Quei cookie non servono a far funzionare il sito, quindi per legge si
 * possono mettere solo dopo che la persona ha detto di si'. Un sito che
 * carica la mappa subito ha bisogno della fascia del consenso, con tutto
 * quello che si porta dietro: la finestra che copre la pagina, le scelte
 * da conservare, il registro di chi ha accettato cosa.
 *
 * Qui si e' scelta la strada corta e piu' onesta: finche' non clicchi,
 * verso Google non parte niente. Il clic e' il consenso, dato per quella
 * volta e per quella cosa sola. Niente fascia, niente scelte da
 * conservare, e chi la mappa non la vuole non viene nemmeno contato.
 *
 * COSA VEDE CHI NON CLICCA
 * Il riquadro con l'indirizzo scritto e il pulsante per le indicazioni,
 * che porta su Google Maps in una scheda nuova. Chi cerca la strada la
 * trova lo stesso: non si perde niente, si sposta solo il momento in cui
 * Google entra in gioco.
 */
export const MappaSede: React.FC = () => {
  const [caricata, setCaricata] = useState(false);

  if (caricata) {
    return (
      <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
        <iframe
          title={`Mappa della sede di ${SITE.legalName} a ${SITE.address.city}`}
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[300px] sm:h-[360px] border-0 grayscale-[0.35] contrast-[1.1]"
        />
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
      <div className="h-[300px] sm:h-[360px] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <MapPin className="w-7 h-7 text-[#D00020]" aria-hidden="true" />

        <div>
          <p className="text-sm font-semibold text-white">{SITE.address.street}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {SITE.address.postalCode} {SITE.address.city} ({SITE.address.province})
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setCaricata(true)}
            className="px-4 py-2 rounded-lg bg-[#D00020] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Mostra la mappa
          </button>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 hover:border-white/35 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            Indicazioni
          </a>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500 max-w-sm">
          La mappa &egrave; di Google: caricandola, Google riceve il tuo indirizzo IP e
          pu&ograve; usare cookie. Finch&eacute; non premi, non parte nulla.
        </p>
      </div>
    </div>
  );
};
