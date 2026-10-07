'use client';

import React from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { SITE, MAP_EMBED_URL, DIRECTIONS_URL } from '../config/site';

/**
 * La mappa della sede: Google Maps, sempre aperta.
 *
 * E' quella di sempre, con il filtro che la smorza per non farla stonare
 * col resto della pagina. Si puo' spostare e ingrandire dentro al
 * riquadro, come ci si aspetta da una mappa di Google, e il pulsante porta
 * alle indicazioni stradali.
 *
 * COSA COMPORTA, E VA SAPUTO
 * La mappa e' un pezzo di sito di Google dentro al nostro. Appena la
 * pagina si apre, senza che nessuno la tocchi, Google riceve l'indirizzo
 * IP del visitatore e gli mette dei cookie suoi. Non sono cookie tecnici,
 * e per quelli non tecnici la legge vuole il consenso prima, non dopo.
 *
 * Il sito oggi la fascia del consenso non ce l'ha. Finche' le cose stanno
 * cosi' questo e' il punto scoperto del sito, ed e' una scelta del salone,
 * non una svista: la mappa aperta vale piu' della finestra che copre la
 * pagina al primo accesso.
 *
 * Le tre strade per chiuderlo, quando si vorra':
 *   - costruire la fascia del consenso e caricare la mappa solo dopo il si';
 *   - rimettere la mappa dietro a un pulsante, come fu per un giorno;
 *   - usare mattonelle che non mettono cookie, tenendo il collegamento a
 *     Google Maps per le indicazioni.
 *
 * Qualunque strada si prenda, va aggiornata anche app/privacy/page.tsx.
 */
export const MappaSede: React.FC = () => (
  <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
    <iframe
      title={`Mappa della sede di ${SITE.legalName} a ${SITE.address.city}`}
      src={MAP_EMBED_URL}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full h-[300px] sm:h-[360px] border-0 grayscale-[0.35] contrast-[1.1]"
    />

    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
      <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-[#D00020] shrink-0" aria-hidden="true" />
        {SITE.address.street}, {SITE.address.city}
      </p>
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D00020] hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
      >
        <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
        Indicazioni
      </a>
    </div>
  </div>
);
