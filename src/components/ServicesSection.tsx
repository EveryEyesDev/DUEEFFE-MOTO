'use client';

import React from 'react';
import {
  Wrench,
  Shield,
  MapPin,
  Clock,
  Phone,
  FileText,
  Mail,
  ExternalLink,
  Star,
  Navigation,
} from 'lucide-react';
import { SITE, MAPS_URL, MAP_EMBED_URL, DIRECTIONS_URL } from '../config/site';
import { SocialLinks } from './SocialLinks';

/** Interventi che si fanno in officina, mostrati come etichette. */
const INTERVENTI = [
  'Tagliandi',
  'Pneumatici',
  'Revisioni',
  'Diagnosi elettronica',
  'Freni',
  'Accessori',
];

const SERVIZI = [
  {
    index: '01',
    title: 'Officina e tagliandi',
    description:
      'Manutenzione ordinaria e straordinaria, diagnosi elettronica, gomme, freni e messa a punto. Il preventivo te lo diamo prima di iniziare, scritto e chiaro.',
    icon: Wrench,
  },
  {
    index: '02',
    title: 'Pratiche e immatricolazioni',
    description:
      'Passaggi di proprietà, immatricolazioni, bolli e supporto per le polizze. La burocrazia la sbrighiamo noi, tu pensi a guidare.',
    icon: FileText,
  },
  {
    index: '03',
    title: 'Garanzia e usato controllato',
    description:
      'Ogni moto usata passa dalla nostra officina prima di essere messa in vendita. Quello che sistemiamo te lo diciamo, quello che resta da fare anche.',
    icon: Shield,
  },
];

export const ServicesSection: React.FC = () => {
  const hasOrari = SITE.openingHours.length > 0;

  return (
    <section id="officina" className="py-20 bg-[#070709] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intestazione */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#D00020]">Officina</span>
            <span aria-hidden="true">·</span>
            <span>Servizi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Mani esperte, <span className="text-[#D00020]">strumenti giusti</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            La nostra officina non è un reparto accessorio: è il motivo per cui i clienti tornano.
            Ti spieghiamo sempre cosa abbiamo fatto e perché.
          </p>
        </div>

        {/* Griglia servizi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {SERVIZI.map((serv) => {
            const Icon = serv.icon;
            return (
              <article
                key={serv.index}
                className="bg-[#0e0f14] border border-white/10 rounded-2xl p-6 flex flex-col hover:border-[#D00020]/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold font-tech text-[#D00020]">{serv.index}.</span>
                  <div className="p-2.5 rounded-xl bg-white/5 text-slate-300 group-hover:text-[#D00020] group-hover:bg-[#D00020]/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-2">{serv.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-auto">{serv.description}</p>
              </article>
            );
          })}
        </div>

        {/* Cosa si fa in officina */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Cosa facciamo in officina
          </h3>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {INTERVENTI.map((voce) => (
              <li
                key={voce}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-white/5 border border-white/10 rounded-full"
              >
                {voce}
              </li>
            ))}
          </ul>
          <a
            href={SITE.phone.href}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" />
            <span>Prenota un tagliando</span>
          </a>
          <p className="mt-3 text-[11px] text-slate-500">
            Ti diciamo subito quando possiamo prenderla e quanto viene.
          </p>
        </div>

        {/* Scheda contatti e sede */}
        <div
          id="contatti"
          className="bg-gradient-to-r from-[#12131a] via-[#0d0e13] to-[#12131a] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl scroll-mt-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sede */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D00020]/10 border border-[#D00020]/30 text-xs font-semibold text-[#D00020]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Showroom e officina</span>
              </div>
              <h3 className="text-2xl font-bold text-white font-display">{SITE.legalName}</h3>
              <address className="not-italic text-xs sm:text-sm text-slate-400 leading-relaxed">
                {SITE.address.street}
                <br />
                {SITE.address.postalCode} {SITE.address.city} ({SITE.address.provinceName})
              </address>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D00020] hover:underline"
              >
                <span>Apri in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {SITE.googleReviews.enabled && (
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-1 text-[#D00020]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-lg font-bold text-white font-tech tabular-nums">
                      {SITE.googleReviews.rating.toString().replace('.', ',')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    su {SITE.googleReviews.count} recensioni Google
                    <br />
                    <span className="text-slate-500">
                      dato di {SITE.googleReviews.asOf}
                    </span>
                  </div>
                </a>
              )}
            </div>

            {/* Orari */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Clock className="w-4 h-4 text-[#D00020]" />
                Orari di apertura
              </div>
              {hasOrari ? (
                <dl className="space-y-1.5 text-xs">
                  {SITE.openingHours.map((slot) => (
                    <div key={slot.days} className="flex justify-between gap-3 text-slate-300">
                      <dt>{slot.days}</dt>
                      <dd className="font-mono text-white text-right">{slot.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chiamaci per conoscere gli orari di apertura aggiornati: rispondiamo noi dal
                  salone e ti diciamo subito quando passare.
                </p>
              )}
            </div>

            {/* Contatti rapidi */}
            <div className="flex flex-col gap-3">
              <a
                href={SITE.phone.href}
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{SITE.phone.display}</span>
              </a>

              {SITE.email && (
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  <Mail className="w-4 h-4 text-[#D00020]" />
                  <span>{SITE.email}</span>
                </a>
              )}

              {SITE.whatsapp && (
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <span>Scrivici su WhatsApp</span>
                </a>
              )}

              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                <Navigation className="w-4 h-4 text-[#D00020]" />
                <span>Portami da voi</span>
              </a>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Siamo a Cavallino, a pochi minuti da Lecce.
              </p>

              <SocialLinks
                centrato
                invito="Seguici sui social"
                className="pt-5 mt-1 border-t border-white/10"
              />
            </div>
          </div>

          {/* Mappa della sede */}
          <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <iframe
              title={`Mappa della sede di ${SITE.legalName} a ${SITE.address.city}`}
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[300px] sm:h-[360px] border-0 grayscale-[0.35] contrast-[1.1]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
