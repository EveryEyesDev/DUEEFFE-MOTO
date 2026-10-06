'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ServicesMarquee } from './ServicesMarquee';
import { BikeHighlights } from './BikeHighlights';
import { Reviews } from './Reviews';
import { FinancingCalculator } from './FinancingCalculator';
import { ServicesSection } from './ServicesSection';
import { Footer } from './Footer';
import { ClosingCta } from './ClosingCta';
import { Motorcycle } from '../types';
import { useCatalogo } from '../lib/catalogo-contesto';
import { LoghiMarchi } from './LoghiMarchi';

/** Porta in vista una sezione della pagina con uno scorrimento morbido. */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function ContenutoHome() {
  return (
    <Suspense fallback={null}>
      <Contenuto />
    </Suspense>
  );
}

function Contenuto() {
  const { nuove, tutte } = useCatalogo();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Il catalogo sta su /moto. Quando da li' si chiede di calcolare la rata,
  // la moto scelta arriva qui nell'indirizzo come ?moto=<id>.
  const [bikeForFinancing, setBikeForFinancing] = useState<Motorcycle>(nuove[0]);

  useEffect(() => {
    const id = searchParams.get('moto');
    if (!id) return;
    const bike = tutte.find((m) => m.id === id);
    if (!bike) return;
    setBikeForFinancing(bike);
    // Il contenuto compare dopo il caricamento, quindi l'ancora nell'indirizzo
    // da sola non basta: portiamo noi la sezione in vista.
    requestAnimationFrame(() => scrollToSection('finanziamento'));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col font-sans selection:bg-[#D00020] selection:text-white">
      <Navbar />

      <main className="flex-1">
        <HeroSection onExploreCatalog={() => router.push('/moto')} />

        {/* I marchi, subito sotto il racconto: e' la prima cosa che
            chiede chi sta cercando una moto. */}
        <LoghiMarchi marche={Array.from(new Set(nuove.map((m) => m.brand)))} />

        <ServicesMarquee />

        <BikeHighlights
          onVediTutte={() => router.push('/moto')}
          onSelectBike={(bike) => router.push(`/moto?moto=${encodeURIComponent(bike.id)}`)}
        />

        <Reviews />

        <FinancingCalculator key={bikeForFinancing.id} initialBike={bikeForFinancing} />

        <ServicesSection />

        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
