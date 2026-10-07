'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Camera, Gauge, Zap, Weight, Fuel, Ruler, Cog } from 'lucide-react';
import { Motorcycle } from '../types';
import { SITE } from '../config/site';
import { BikeGallery } from './BikeGallery';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Stemma } from './LoghiMarchi';

/**
 * La scheda di una moto, sulla sua pagina.
 *
 * COSA CAMBIA RISPETTO AL CATALOGO
 * Nel catalogo la scheda si apre sotto la griglia e chi guarda ha gia' il
 * contesto: sa che marca sta sfogliando, da dove arriva. Qui no: chi
 * arriva viene da una ricerca, e questa pagina e' la prima cosa che vede
 * del salone. Per questo in cima ci sono marca, prezzo e telefono, e in
 * fondo il rimando al catalogo: deve poter capire in tre secondi che moto
 * e', quanto costa e chi gliela vende.
 *
 * LA FOTOGRAFIA SU STRADA STA IN ALTO
 * Nel catalogo le viste studio bastano, perche' la fotografia su strada e'
 * gia' nel riquadro da cui si arriva. Qui e' la prima immagine della
 * pagina: e' quella che dice "questa moto esiste e sta su una strada",
 * mentre uno scontorno su fondo bianco sembra un disegno tecnico.
 */

const CAMPI: { chiave: keyof Motorcycle['specs']; etichetta: string; unita: string; icona: React.ElementType }[] = [
  { chiave: 'displacementCc', etichetta: 'Cilindrata', unita: 'cc', icona: Cog },
  { chiave: 'powerHp', etichetta: 'Potenza', unita: 'CV', icona: Zap },
  { chiave: 'torqueNm', etichetta: 'Coppia', unita: 'Nm', icona: Gauge },
  { chiave: 'weightKg', etichetta: 'Peso', unita: 'kg', icona: Weight },
  { chiave: 'seatHeightMm', etichetta: 'Altezza sella', unita: 'mm', icona: Ruler },
  { chiave: 'fuelCapacityL', etichetta: 'Serbatoio', unita: 'l', icona: Fuel },
];

const TESTUALI: { chiave: keyof Motorcycle['specs']; etichetta: string }[] = [
  { chiave: 'engineType', etichetta: 'Motore' },
  { chiave: 'transmission', etichetta: 'Cambio' },
  { chiave: 'frontBrakes', etichetta: 'Freno anteriore' },
  { chiave: 'suspension', etichetta: 'Sospensioni' },
];

export const SchedaMoto: React.FC<{ moto: Motorcycle }> = ({ moto }) => {
  const usata = moto.condition === 'usato';
  const haViste = (moto.colorways?.length ?? 0) > 0;
  const ambientata = moto.roadImage;

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col font-sans selection:bg-[#D00020] selection:text-white">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/moto"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Tutte le moto
          </Link>

          {/* Intestazione */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Stemma marca={moto.brand} classe="h-4" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#D00020]">
              {moto.brand}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              &middot;
            </span>
            <span className="text-xs text-slate-400">{moto.categoryLabel}</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                usata ? 'bg-slate-200 text-slate-900' : 'bg-[#D00020] text-white'
              }`}
            >
              {usata ? 'Usato' : 'Nuovo'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display uppercase tracking-tight text-white">
            {moto.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">{moto.subtitle}</p>

          {/* Fotografia su strada */}
          <div className="mt-7 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#181920] to-[#0a0a0d]">
            {ambientata ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ambientata}
                alt={`${moto.brand} ${moto.name} su strada`}
                className="w-full aspect-[16/9] object-cover"
                // La prima immagine della pagina si carica subito: e' quella
                // che il visitatore sta aspettando di vedere.
                fetchPriority="high"
              />
            ) : (
              <div className="w-full aspect-[16/9] flex flex-col items-center justify-center gap-2 text-slate-600">
                <Camera className="w-8 h-8" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-wider">
                  Fotografia in arrivo
                </span>
              </div>
            )}
          </div>

          {/* Prezzo e contatto */}
          <div className="mt-7 flex flex-wrap items-end justify-between gap-5 pb-7 border-b border-white/10">
            <div>
              {moto.price !== undefined ? (
                <>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    {usata ? 'Prezzo' : 'A partire da'}
                  </div>
                  <div className="text-3xl font-extrabold font-tech text-white tabular-nums">
                    &euro; {moto.price.toLocaleString('it-IT')}
                  </div>
                  {moto.priceNote && (
                    <p className="text-[11px] text-slate-500 mt-1 max-w-md">{moto.priceNote}</p>
                  )}
                </>
              ) : (
                <div className="text-sm text-slate-400">
                  Prezzo in concessionaria: chiamaci e te lo diciamo.
                </div>
              )}
            </div>

            <a
              href={SITE.phone.href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#D00020] hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {SITE.phone.display}
            </a>
          </div>

          {moto.used && (
            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Riquadro etichetta="Anno" valore={String(moto.used.year)} />
              <Riquadro etichetta="Chilometri" valore={moto.used.km.toLocaleString('it-IT')} />
              {moto.used.warrantyMonths !== undefined && (
                <Riquadro etichetta="Garanzia" valore={`${moto.used.warrantyMonths} mesi`} />
              )}
              {moto.used.previousOwners !== undefined && (
                <Riquadro etichetta="Proprietari" valore={String(moto.used.previousOwners)} />
              )}
            </dl>
          )}

          <p className="mt-7 text-sm leading-relaxed text-slate-300 max-w-3xl">
            {moto.description}
          </p>

          {/* Le viste studio, livrea per livrea */}
          {haViste && (
            <section className="mt-10">
              <h2 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-4">
                Come &egrave; fatta
              </h2>
              <BikeGallery bike={moto} />
            </section>
          )}

          {/* Scheda tecnica */}
          <section className="mt-10">
            <h2 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-4">
              Scheda tecnica
            </h2>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAMPI.map(({ chiave, etichetta, unita, icona: Icona }) => {
                const valore = moto.specs[chiave];
                if (valore === undefined) return null;
                return (
                  <div
                    key={chiave}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500">
                      <Icona className="w-3 h-3 text-[#D00020]" aria-hidden="true" />
                      {etichetta}
                    </dt>
                    <dd className="mt-1 text-lg font-bold font-tech text-white tabular-nums">
                      {valore}
                      <span className="text-xs font-normal text-slate-400 ml-1">{unita}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>

            {TESTUALI.some(({ chiave }) => moto.specs[chiave] !== undefined) && (
              <dl className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/10">
                {TESTUALI.map(({ chiave, etichetta }) => {
                  const valore = moto.specs[chiave];
                  if (valore === undefined) return null;
                  return (
                    <div key={chiave} className="flex flex-wrap gap-2 px-4 py-2.5 text-sm">
                      <dt className="text-slate-500 w-40 shrink-0">{etichetta}</dt>
                      <dd className="text-slate-200">{valore}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </section>

          {moto.features.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-4">
                In dotazione
              </h2>
              <ul className="flex flex-wrap gap-2">
                {moto.features.map((voce) => (
                  <li
                    key={voce}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-slate-300"
                  >
                    {voce}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Invito finale: chi e' arrivato in fondo sta valutando sul serio */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 text-center">
            <p className="text-lg font-bold font-display uppercase tracking-tight text-white">
              Vuoi vederla dal vivo?
            </p>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl mx-auto">
              Siamo a {SITE.address.street}, {SITE.address.city}. Chiama prima di passare,
              cos&igrave; te la prepariamo.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={SITE.phone.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D00020] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                Chiamaci
              </a>
              <Link
                href="/moto"
                className="px-5 py-2.5 rounded-lg border border-white/15 hover:border-white/35 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Vedi tutte le moto
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Riquadro: React.FC<{ etichetta: string; valore: string }> = ({ etichetta, valore }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
    <dt className="text-[10px] uppercase tracking-widest text-slate-500">{etichetta}</dt>
    <dd className="mt-0.5 text-lg font-bold font-tech text-white tabular-nums">{valore}</dd>
  </div>
);
