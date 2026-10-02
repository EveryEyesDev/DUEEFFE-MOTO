'use client';

import React, { useState } from 'react';
import { Motorcycle, BikeCategory, BikeColorOption } from '../types';
import { MOTORCYCLES } from '../data/motorcycles';
import { Motorcycle3DViewer } from './Motorcycle3DViewer';
import { 
  Rotate3d, 
  Image as ImageIcon, 
  Gauge, 
  Zap, 
  Weight, 
  ChevronRight, 
  Calculator, 
  Calendar,
  Check,
  Fuel,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MotorcycleShowcaseProps {
  onSelectForFinancing: (bike: Motorcycle) => void;
  onBookTestRide: (bike: Motorcycle) => void;
}

export const MotorcycleShowcase: React.FC<MotorcycleShowcaseProps> = ({
  onSelectForFinancing,
  onBookTestRide,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BikeCategory>('all');
  const [activeBike, setActiveBike] = useState<Motorcycle>(MOTORCYCLES[0]);
  const [viewMode, setViewMode] = useState<'3d' | 'specs'>('3d');
  const [selectedColor, setSelectedColor] = useState<BikeColorOption>(MOTORCYCLES[0].colors[0]);

  // Handle bike selection
  const handleSelectBike = (bike: Motorcycle) => {
    setActiveBike(bike);
    setSelectedColor(bike.colors[0]);
  };

  // Filtered bikes
  const filteredBikes = selectedCategory === 'all'
    ? MOTORCYCLES
    : MOTORCYCLES.filter((b) => b.category === selectedCategory);

  const categories: { key: BikeCategory; label: string }[] = [
    { key: 'all', label: 'Tutte le Moto' },
    { key: 'supersport', label: 'SuperSport' },
    { key: 'naked', label: 'HyperNaked' },
    { key: 'adventure', label: 'Adventure Rally' },
    { key: 'cruiser', label: 'Power Cruiser' },
    { key: 'heritage', label: 'Heritage Vintage' },
  ];

  return (
    <section id="gamma" className="py-20 bg-[#070709] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#E10600]">Showroom Ufficiale Dueffe</span>
            <span aria-hidden="true">·</span>
            <span>Gamma Completa 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Scegli il tuo bolide & <span className="text-[#E10600]">Esploralo in 3D</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Seleziona una moto per visualizzarla in 3D interattivo a 360°, cambiare il colore della livrea in tempo reale,
            ascoltare il suono del motore e consultare la scheda tecnica completa.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-[#E10600] text-white shadow-lg shadow-red-900/40 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Horizontal Model Selector Cards with Smooth Motion */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {filteredBikes.map((bike) => {
            const isSelected = activeBike.id === bike.id;
            return (
              <motion.button
                key={bike.id}
                onClick={() => handleSelectBike(bike)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex flex-col p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#15161c] border-[#E10600] shadow-lg shadow-red-950/40 ring-1 ring-[#E10600]'
                    : 'bg-[#0e0f14] border-white/5 hover:border-white/20'
                }`}
              >
                {bike.badge && (
                  <span className="text-[10px] font-bold text-[#E10600] uppercase tracking-wider mb-1">
                    {bike.badge}
                  </span>
                )}
                <span className="text-sm font-bold text-white font-display truncate">
                  {bike.name}
                </span>
                <span className="text-xs text-slate-400 mb-2 truncate">
                  {bike.categoryLabel}
                </span>
                <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    € {bike.price.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[11px] text-[#E10600] font-tech font-semibold">
                    da €{bike.monthlyEstimate}/m
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Interactive Main Stage (3D Viewer vs Technical Sheet) */}
        <div id="visualizzatore-3d" className="bg-[#0b0c10] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative">
          {/* Top Bar inside Stage: Model Title + Mode Toggle (3D vs Scheda Tecnica) */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E10600]">
                  {activeBike.categoryLabel}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Codice: {activeBike.id}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight mt-0.5">
                {activeBike.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeBike.subtitle}
              </p>
            </div>

            {/* View Mode Switcher: 3D vs Scheda Tecnica */}
            <div className="flex items-center p-1 bg-black/60 rounded-xl border border-white/10 self-stretch sm:self-auto">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === '3d'
                    ? 'bg-[#E10600] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-4 h-4" />
                <span>Visualizza in 3D a 360°</span>
              </button>
              <button
                onClick={() => setViewMode('specs')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'specs'
                    ? 'bg-[#E10600] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Scheda Tecnica & Gallery</span>
              </button>
            </div>
          </div>

          {/* Active View Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): 3D Viewer or Specs & Visualizer */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {viewMode === '3d' ? (
                  <motion.div
                    key={`3d-${activeBike.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Motorcycle3DViewer
                      motorcycle={activeBike}
                      selectedColor={selectedColor}
                      onColorChange={setSelectedColor}
                      onBookTestRide={() => onBookTestRide(activeBike)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`specs-${activeBike.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="w-full rounded-2xl bg-[#0e0f14] border border-white/10 p-6 sm:p-8"
                  >
                    {/* Visual Banner for the Motorcycle */}
                    <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#181920] to-[#0a0a0d] border border-white/5 flex items-center justify-center mb-6">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-xs font-bold text-white bg-black/70 px-3 py-1 rounded backdrop-blur border border-white/10">
                          {selectedColor.name}
                        </span>
                      </div>

                      {/* Motorcycle Silhouette & Vector Art Presentation */}
                      <div className="relative flex flex-col items-center justify-center p-6 text-center">
                        <div 
                          className="w-32 h-32 rounded-full blur-2xl opacity-40 absolute"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <div className="relative z-10 text-white flex flex-col items-center">
                          <Rotate3d className="w-16 h-16 text-[#E10600] mb-3 animate-pulse" />
                          <h4 className="text-2xl font-bold font-display uppercase tracking-tight">
                            {activeBike.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">
                            Livrea mostrata: <strong className="text-white">{selectedColor.name}</strong>. Passa alla modalità 3D per girarla liberamente a 360 gradi!
                          </p>
                          <button
                            onClick={() => setViewMode('3d')}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-lg transition-transform hover:scale-105"
                          >
                            <Rotate3d className="w-4 h-4" />
                            Passa a 3D Interattivo
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Specifications Breakdown Table */}
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-[#E10600]" />
                      Specifiche Meccaniche & Ciclistica
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-slate-400">Architettura Motore</div>
                        <div className="text-white font-semibold mt-1">{activeBike.specs.engineType}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-slate-400">Trasmissione & Cambio</div>
                        <div className="text-white font-semibold mt-1">{activeBike.specs.transmission}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-slate-400">Impianto Frenante Anteriore</div>
                        <div className="text-white font-semibold mt-1">{activeBike.specs.frontBrakes}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-slate-400">Sospensioni Anteriori</div>
                        <div className="text-white font-semibold mt-1">{activeBike.specs.suspension}</div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                        Dotazioni & Pacchetto Elettronico
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {activeBike.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column (4 cols): Sticky Purchase / Configurator Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Telemetry Core Metrics Card */}
              <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider pb-3 border-b border-white/10 font-mono">
                  <span>Dati Telemetrici</span>
                  <span className="text-[#E10600] font-bold">Ufficiali Dueffe</span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#E10600]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-tech text-white tabular-nums">
                        {activeBike.specs.powerHp} CV
                      </div>
                      <div className="text-[11px] text-slate-400">Potenza Massima</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#E10600]">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-tech text-white tabular-nums">
                        {activeBike.specs.topSpeedKmH} km/h
                      </div>
                      <div className="text-[11px] text-slate-400">Velocità Max</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#E10600]">
                      <Weight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-tech text-white tabular-nums">
                        {activeBike.specs.weightKg} kg
                      </div>
                      <div className="text-[11px] text-slate-400">Peso a Secco</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#E10600]">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-tech text-white tabular-nums">
                        {activeBike.specs.fuelCapacityL} L
                      </div>
                      <div className="text-[11px] text-slate-400">Serbatoio</div>
                    </div>
                  </div>
                </div>

                {/* Acceleration Bar */}
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Accelerazione 0-100 km/h:</span>
                    <span className="font-bold text-white font-mono">{activeBike.specs.accel0100}s</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-[#E10600] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(15, 100 - (activeBike.specs.accel0100 / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Price & Contiguous Purchase Actions */}
              <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Prezzo Chiavi in Mano</span>
                    <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      € {activeBike.price.toLocaleString('it-IT')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Finanziamento da</span>
                    <span className="text-lg font-bold text-[#E10600] font-tech tabular-nums">
                      € {activeBike.monthlyEstimate}
                    </span>
                    <span className="text-xs text-slate-400">/mese</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => onBookTestRide(activeBike)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Prenota Test Ride Ufficiale</span>
                  </button>

                  <button
                    onClick={() => onSelectForFinancing(activeBike)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                    <Calculator className="w-4 h-4 text-[#E10600]" />
                    <span>Calcola Rata Finanziamento</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-[11px] text-slate-500">
                    4 Anni di Garanzia Ufficiale · Assistenza Stradale 24h · Tagliando dei 1.000km incluso
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
