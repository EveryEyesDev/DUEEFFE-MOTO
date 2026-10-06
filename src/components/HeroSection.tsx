'use client';

import React from 'react';
import { DueffeLogo } from './DueffeLogo';
import { HeroBackground } from './HeroBackground';
import { Rotate3d, ChevronRight, Wrench, ShieldCheck, Bike } from 'lucide-react';
import { SITE } from '../config/site';

interface HeroSectionProps {
  onExploreCatalog: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Bike,
    value: `${SITE.brands.length} marchi`,
    label: SITE.primaryBrands.join(' · '),
  },
  {
    icon: Rotate3d,
    value: 'Foto e schede',
    label: 'La gamma sul sito'
  },
  {
    icon: Wrench,
    value: 'Officina interna',
    label: 'Tagliandi e diagnosi',
  },
  {
    icon: ShieldCheck,
    value: 'Usato garantito',
    label: 'Controllato prima della consegna',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreCatalog }) => {
  return (
    <section
      id="top"
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/10 bg-[#070709]"
    >
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center z-10">
        {/* Soprattitolo */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-6">
          <span className="text-[#D00020]">Cavallino</span>
          <span aria-hidden="true">·</span>
          <span>{SITE.address.provinceName}</span>
          <span aria-hidden="true">·</span>
          <span>Nel cuore del Salento</span>
        </div>

        {/* Logo in evidenza */}
        <div className="mb-8">
          <DueffeLogo size="xl" />
        </div>

        {/* Titolo */}
        <h1 className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display uppercase leading-[1.1] mb-6">
          La tua corsa
          <br className="hidden sm:inline" />{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#D00020]">
            inizia qui.
          </span>
        </h1>

        {/* Descrizione */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10 text-balance">
          Concessionaria ufficiale {SITE.primaryBrands.join(', ')}. Vendita e
          assistenza con la cura di chi guida davvero. Guarda la gamma con{' '}
          <strong className="text-white font-semibold">foto e schede tecniche</strong>, poi vieni
          a vederle dal vivo in salone.
        </p>

        {/* Azioni principali */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onExploreCatalog}
            className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-xl shadow-xl shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Rotate3d className="w-5 h-5" />
            <span>Guarda le nostre moto</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <a
            href="#contatti"
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-dashed border-white/20 rounded-xl transition-all"
          >
            <span>Parla con noi</span>
          </a>
        </div>

        {/* Barra dei punti di forza */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 p-2 text-left">
                <div className="p-2.5 rounded-lg bg-[#D00020]/10 text-[#D00020] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white font-tech truncate">{item.value}</div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};