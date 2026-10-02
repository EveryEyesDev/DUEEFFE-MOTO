import React from 'react';
import { DueffeLogo } from './DueffeLogo';
import { Rotate3d, ChevronRight, Gauge, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onExplore3D: () => void;
  onExploreCatalog: () => void;
  onBookTestRide: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore3D,
  onExploreCatalog,
  onBookTestRide,
}) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/10 bg-[#070709]">
      {/* Background Ambience & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E10600]/12 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-red-950/20 blur-[100px] rounded-full" />
        {/* Subtle racing grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center z-10">
        {/* Subtle unboxed metadata kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-6">
          <span className="text-[#E10600]">Concessionaria Ufficiale</span>
          <span aria-hidden="true">·</span>
          <span>Showroom & Reparto Corse</span>
          <span aria-hidden="true">·</span>
          <span>Pronta Consegna 2026</span>
        </div>

        {/* Hero Logo Emphasis */}
        <div className="mb-6 transform hover:scale-[1.02] transition-transform duration-300">
          <DueffeLogo size="xl" showRacer={true} />
        </div>

        {/* Main Headline */}
        <h1 className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display uppercase leading-[1.1] mb-6">
          L'Emozione Pura Della <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#E10600]">
            Velocità Italiana.
          </span>
        </h1>

        {/* Body Description */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10 text-balance">
          Scopri le moto più prestigiose ed esclusive. Esplora ogni dettaglio millimetrico
          con il nostro rivoluzionario <strong className="text-white font-semibold">configuratore 3D interattivo a 360°</strong>,
          ascolta il rombo del motore e prenota il tuo test ride in pista o su strada.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onExplore3D}
            className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-xl shadow-xl shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Rotate3d className="w-5 h-5" />
            <span>Configura Moto in 3D</span>
          </button>

          <button
            onClick={onExploreCatalog}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <span>Consulta il Catalogo</span>
            <ChevronRight className="w-4 h-4 text-[#E10600]" />
          </button>

          <button
            onClick={onBookTestRide}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-dashed border-white/20 rounded-xl transition-all"
          >
            <span>Prenota Test Ride</span>
          </button>
        </div>

        {/* Racing Proof Highlights Bar */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-2 text-left">
            <div className="p-2.5 rounded-lg bg-[#E10600]/10 text-[#E10600]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white font-tech tabular-nums">221 CV</div>
              <div className="text-xs text-slate-400">Potenza Massima V4</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 text-left">
            <div className="p-2.5 rounded-lg bg-[#E10600]/10 text-[#E10600]">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white font-tech tabular-nums">2.8 sec</div>
              <div className="text-xs text-slate-400">Scatto 0-100 km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 text-left">
            <div className="p-2.5 rounded-lg bg-[#E10600]/10 text-[#E10600]">
              <Rotate3d className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white font-tech tabular-nums">360° Realtime</div>
              <div className="text-xs text-slate-400">Ispezione 3D Completa</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 text-left">
            <div className="p-2.5 rounded-lg bg-[#E10600]/10 text-[#E10600]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white font-tech tabular-nums">4 Anni</div>
              <div className="text-xs text-slate-400">Garanzia Ufficiale Red</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
