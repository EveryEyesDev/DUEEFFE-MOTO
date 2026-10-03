'use client';

import React from 'react';
import { PhoneCall, MapPin } from 'lucide-react';
import { SITE, DIRECTIONS_URL } from '../config/site';
import { SocialLinks } from './SocialLinks';

/**
 * Chiusura della pagina, subito prima del footer.
 *
 * Chi arriva fin qui ha gia' guardato le moto e letto le recensioni:
 * serve un ultimo invito chiaro, con le due sole azioni che contano,
 * telefonare oppure venire in salone.
 */
export const ClosingCta: React.FC = () => (
  <section className="relative py-16 sm:py-20 bg-[#0a0a0d] border-b border-white/10 overflow-hidden">
    {/* Alone del colore del marchio, come in apertura */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-[#D00020]/10 blur-[120px] rounded-full pointer-events-none"
      aria-hidden="true"
    />

    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display uppercase tracking-tight leading-tight">
        Pronto a trovare la tua <span className="text-[#D00020]">prossima moto?</span>
      </h2>
      <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
        Passa in concessionaria o chiamaci. Rispondiamo noi dal salone, non un
        centralino, e se la moto che cerchi non ce l&rsquo;abbiamo te lo diciamo subito.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={SITE.phone.href}
          className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-xl shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{SITE.phone.display}</span>
        </a>

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <MapPin className="w-4 h-4 text-[#D00020]" />
          <span>Vieni a trovarci</span>
        </a>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        {SITE.address.street} · {SITE.address.postalCode} {SITE.address.city} (
        {SITE.address.provinceName})
      </p>

      <SocialLinks
        centrato
        invito="Ci trovi anche su"
        className="mt-10 pt-8 border-t border-white/10 max-w-sm mx-auto"
      />
    </div>
  </section>
);
