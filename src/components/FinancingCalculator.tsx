'use client';

import React, { useState } from 'react';
import { Motorcycle } from '../types';
import { MOTORCYCLES } from '../data/motorcycles';
import { Calculator, CheckCircle2, Shield, ArrowRight, Percent } from 'lucide-react';

interface FinancingCalculatorProps {
  initialBike?: Motorcycle;
  onBookTestRide?: (bike: Motorcycle) => void;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  initialBike = MOTORCYCLES[0],
  onBookTestRide,
}) => {
  const [selectedBike, setSelectedBike] = useState<Motorcycle>(initialBike);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [durationMonths, setDurationMonths] = useState<number>(36);
  const [includeBalloon, setIncludeBalloon] = useState<boolean>(true);
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const bikePrice = selectedBike.price;
  const downPayment = Math.round((bikePrice * downPaymentPercent) / 100);
  const balloonPayment = includeBalloon ? Math.round(bikePrice * 0.4) : 0;
  const financedAmount = Math.max(0, bikePrice - downPayment - (includeBalloon ? balloonPayment / 1.15 : 0));

  // Approx TAN 4.99% monthly rate
  const annualInterestRate = 0.0499;
  const monthlyRate = annualInterestRate / 12;

  let monthlyInstallment = 0;
  if (financedAmount > 0 && monthlyRate > 0) {
    monthlyInstallment = Math.round(
      (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths))) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1)
    );
  }

  const handleRequestQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) return;
    setQuoteSubmitted(true);
    setTimeout(() => {
      // keep message visible
    }, 4000);
  };

  return (
    <section id="finanziamento" className="py-20 bg-[#0a0a0d] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
            <span className="text-[#E10600]">Servizi Finanziari Ufficiali</span>
            <span aria-hidden="true">·</span>
            <span>Dueffe Financial Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase tracking-tight">
            Calcola la tua rata <span className="text-[#E10600]">Su Misura</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Sali in sella alla tua nuova moto con piani flessibili, valore futuro garantito
            e la libertà di cambiare modello dopo 24 o 36 mesi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Calculator Sliders */}
          <div className="lg:col-span-7 bg-[#0e0f14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Model Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Modello da Finanziare:
              </label>
              <select
                value={selectedBike.id}
                onChange={(e) => {
                  const b = MOTORCYCLES.find((m) => m.id === e.target.value);
                  if (b) setSelectedBike(b);
                }}
                className="w-full bg-[#181920] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E10600] transition-colors"
              >
                {MOTORCYCLES.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.name} — € {bike.price.toLocaleString('it-IT')} ({bike.categoryLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Anticipo / Down Payment Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Anticipo Versato:
                </label>
                <span className="text-sm font-bold font-mono text-white">
                  {downPaymentPercent}% (€ {downPayment.toLocaleString('it-IT')})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0% (Anticipo Zero)</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Durata in Mesi Buttons */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Durata del Finanziamento:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[24, 36, 48, 60].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setDurationMonths(months)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      durationMonths === months
                        ? 'bg-[#E10600] border-[#E10600] text-white shadow-md'
                        : 'bg-[#181920] border-white/5 text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {months} Mesi
                  </button>
                ))}
              </div>
            </div>

            {/* Maxi Rata / Valore Futuro Garantito Toggle */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Formula Valore Futuro Garantito</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Maxi rata finale 40% (€ {Math.round(bikePrice * 0.4).toLocaleString('it-IT')}). Al termine decidi se tenerla, restituirla o sostituirla.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeBalloon(!includeBalloon)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeBalloon ? 'bg-[#E10600]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    includeBalloon ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Calculated Quote & Request Form */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#15161c] to-[#0c0d12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E10600] mb-2 font-mono">
              <Calculator className="w-4 h-4" />
              Riepilogo Preventivo Trasparente
            </div>

            <div className="my-4 pb-4 border-b border-white/10">
              <div className="text-xs text-slate-400">Rata Mensile Stimata:</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-tech tabular-nums">
                  € {monthlyInstallment}
                </span>
                <span className="text-sm text-slate-400">/mese</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                <span>TAN fisso 4,99%</span>
                <span>·</span>
                <span>TAEG 6,12%</span>
                <span>·</span>
                <span>Spese istruttoria €0</span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 text-xs py-2">
              <div className="flex justify-between text-slate-400">
                <span>Prezzo Moto:</span>
                <span className="text-white font-mono">€ {bikePrice.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Anticipo ({downPaymentPercent}%):</span>
                <span className="text-white font-mono">€ {downPayment.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Numero Rate:</span>
                <span className="text-white font-mono">{durationMonths} mensilità</span>
              </div>
              {includeBalloon && (
                <div className="flex justify-between text-slate-400">
                  <span>Maxi Rata Finale Garantita:</span>
                  <span className="text-white font-mono">€ {balloonPayment.toLocaleString('it-IT')}</span>
                </div>
              )}
            </div>

            {/* Quick Lock Quote Form */}
            <div className="mt-6 pt-6 border-t border-white/10">
              {quoteSubmitted ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Preventivo Bloccato con Successo!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Ti abbiamo inviato il piano d'ammortamento completo a <strong className="text-emerald-300">{customerEmail}</strong>. Un consulente Dueffe ti contatterà entro 2 ore.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestQuote} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Blocca questo tasso promozionale:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="La tua email..."
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="flex-1 bg-[#0b0c10] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E10600]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-xl transition-transform active:scale-95 whitespace-nowrap"
                    >
                      Invia Richiesta
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nessun vincolo di acquisto. Tasso protetto per 14 giorni.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
