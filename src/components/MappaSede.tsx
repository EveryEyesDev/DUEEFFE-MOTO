'use client';

import React from 'react';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import { SITE, MAP_EMBED_URL, MAPS_URL, DIRECTIONS_URL } from '../config/site';

/**
 * La mappa della sede: sempre aperta, e cliccandola si va su Google Maps.
 *
 * PERCHE' LE MATTONELLE NON SONO DI GOOGLE
 * La mappa di Google incorporata, appena si carica, riceve l'indirizzo IP
 * di chi guarda e gli mette dei cookie. Non sono tecnici, quindi per legge
 * vanno chiesti prima, e chiederli vuol dire la fascia del consenso che
 * copre la pagina al primo accesso.
 *
 * Il salone la mappa la vuole aperta, non dietro a un pulsante. Con le
 * mattonelle di OpenStreetMap si puo' fare: quelle si servono e basta,
 * senza cookie, quindi non c'e' niente da far accettare.
 *
 * MA SU GOOGLE MAPS CI SI VA LO STESSO
 * Cliccando la mappa si apre Google Maps sulla scheda del salone, e il
 * pulsante porta alle indicazioni stradali. Sono collegamenti: finche'
 * nessuno ci clicca, verso Google non parte niente, ed e' esattamente la
 * differenza fra un collegamento e un pezzo di Google incorporato nella
 * pagina.
 *
 * Per renderla cliccabile tutta, la cartina non riceve i clic
 * (pointer-events: none) e sopra ci sta il collegamento. Si perde lo
 * spostamento con le dita dentro al riquadro, ma si guadagna il clic da
 * qualsiasi punto - che e' quello che la gente prova a fare - e sul
 * telefono la pagina non resta piu' impigliata nella mappa mentre si
 * scorre.
 *
 * I COLORI
 * Le mattonelle di OpenStreetMap sono chiare e il sito e' scuro: il filtro
 * le gira in negativo e ne ruota la tinta, che e' il modo consueto di
 * ricavare una mappa notturna da una diurna senza doverne servire
 * un'altra.
 */
export const MappaSede: React.FC = () => (
  <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Apri la sede di ${SITE.legalName} su Google Maps`}
      className="group relative block"
    >
      <iframe
        title={`Mappa della sede di ${SITE.legalName} a ${SITE.address.city}`}
        src={MAP_EMBED_URL}
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none w-full h-[300px] sm:h-[360px] border-0"
        style={{ filter: 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.05)' }}
      />

      {/* Si accende al passaggio: dice che il riquadro e' cliccabile senza
          doverci scrivere sopra niente a pagina ferma. */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 border border-white/25 backdrop-blur text-white text-[11px] font-bold uppercase tracking-wider">
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          Apri su Google Maps
        </span>
      </span>
    </a>

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
