'use client';

import React from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { SITE, MAP_EMBED_URL, DIRECTIONS_URL } from '../config/site';

/**
 * La mappa della sede, sempre aperta.
 *
 * PERCHE' ADESSO SI VEDE SUBITO
 * Prima c'era un riquadro con un pulsante, e la mappa partiva solo al
 * clic. Non era un capriccio: la mappa era di Google, e Google appena si
 * carica riceve l'indirizzo IP di chi guarda e gli mette dei cookie. Non
 * sono tecnici, quindi vanno chiesti prima, e chiederli vuol dire la
 * fascia del consenso che copre la pagina al primo accesso.
 *
 * Cambiando fornitore il problema sparisce invece di essere gestito.
 * OpenStreetMap serve le mattonelle e basta: niente cookie, niente da far
 * accettare, e la mappa puo' stare aperta come dev'essere. Il dettaglio
 * sta in MAP_EMBED_URL, dentro config/site.ts.
 *
 * I COLORI
 * Le mattonelle di OpenStreetMap sono chiare e il sito e' scuro: messe
 * cosi' com'erano sembravano un foglio di carta appiccicato sopra. Il
 * filtro le gira in negativo e ne ruota la tinta, che e' il modo
 * consueto di ricavare una mappa notturna da una diurna senza doverne
 * servire un'altra. Le strade restano chiare sul fondo scuro, come sul
 * resto del sito.
 *
 * Le indicazioni stradali continuano ad andare su Google Maps, che le fa
 * meglio: ma sono collegamenti, e finche' non ci si clicca verso Google
 * non parte niente.
 */
export const MappaSede: React.FC = () => (
  <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
    <iframe
      title={`Mappa della sede di ${SITE.legalName} a ${SITE.address.city}`}
      src={MAP_EMBED_URL}
      loading="lazy"
      className="w-full h-[300px] sm:h-[360px] border-0"
      style={{ filter: 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.05)' }}
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
