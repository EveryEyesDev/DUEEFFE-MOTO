import React from 'react';
import { Wrench, Gauge, Shield, Award, Sparkles, MapPin, Clock, Phone, MessageSquare } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      index: '01',
      title: 'Reparto Corse & Setup Pista',
      description: 'Mappature centralina custom su banco prova Dynojet frenato, regolazione idraulica sospensioni Öhlins e bilanciamento carichi per piloti amatori e licenziati.',
      icon: Gauge,
    },
    {
      index: '02',
      title: 'Officina Ufficiale & Diagnosi 2026',
      description: 'Strumentazione diagnostica ufficiale per telemetria, aggiornamenti firmware centraline ECU/BBS e tagliandi certificati con registrazione sul portale di fabbrica.',
      icon: Wrench,
    },
    {
      index: '03',
      title: 'Ricambi Originali & Performance Parts',
      description: 'Magazzino con oltre 12.000 referenze: scarichi completi Akrapovič e Termignoni, componentistica in ergal ricavata dal pieno e carbonio autoclave.',
      icon: Sparkles,
    },
    {
      index: '04',
      title: 'Garanzia Ufficiale Ever Red & Soccorso',
      description: 'Fino a 4 anni di garanzia a chilometraggio illimitato con assistenza stradale ACI Global inclusa 24 ore su 24 in tutta Europa.',
      icon: Shield,
    },
  ];

  return (
    <section id="officina" className="py-20 bg-[#070709] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#E10600]">Eccellenza Tecnica</span>
            <span aria-hidden="true">·</span>
            <span>Officina Specializzata Dueffe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Passione meccanica & <span className="text-[#E10600]">Cura Artigianale</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Dalla manutenzione ordinaria alla preparazione estrema per i cordoli del Mugello e di Misano. I nostri tecnici sono certificati dai costruttori.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((serv) => {
            const Icon = serv.icon;
            return (
              <div
                key={serv.index}
                className="bg-[#0e0f14] border border-white/10 rounded-2xl p-6 flex flex-col hover:border-[#E10600]/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold font-tech text-[#E10600]">
                    {serv.index}.
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 text-slate-300 group-hover:text-[#E10600] group-hover:bg-[#E10600]/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-white transition-colors">
                  {serv.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-auto">
                  {serv.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dealership Visit & Opening Hours Card */}
        <div id="contatti" className="bg-gradient-to-r from-[#12131a] via-[#0d0e13] to-[#12131a] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Location Info */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E10600]/10 border border-[#E10600]/30 text-xs font-semibold text-[#E10600]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Showroom & Pit Lane</span>
              </div>
              <h3 className="text-2xl font-bold text-white font-display">
                Dueffe Moto Showroom
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Via Aurelia Km 14.500, Roma (RM)<br />
                A 3 minuti dall'uscita 1 del Grande Raccordo Anulare.<br />
                Ampio parcheggio interno e pista prove dedicata.
              </p>
            </div>

            {/* Opening Hours */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Clock className="w-4 h-4 text-[#E10600]" />
                Orari di Apertura
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Lunedì – Venerdì:</span>
                  <span className="font-mono text-white">09:00 – 13:00 / 15:30 – 19:30</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sabato:</span>
                  <span className="font-mono text-white">09:30 – 13:00 / 15:30 – 19:00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Domenica:</span>
                  <span className="text-[#E10600] font-semibold">Chiuso (In Pista!)</span>
                </div>
              </div>
            </div>

            {/* Fast Contact Actions */}
            <div className="flex flex-col gap-3">
              <a
                href="tel:+39068994512"
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-[#E10600]" />
                <span>Chiamaci: 06.8994512</span>
              </a>

              <a
                href="https://wa.me/393450000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-950/40 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Scrivici su WhatsApp Rapido</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
