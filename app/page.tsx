'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '../src/components/Navbar';
import { HeroSection } from '../src/components/HeroSection';
import { ServicesMarquee } from '../src/components/ServicesMarquee';
import { BikeHighlights } from '../src/components/BikeHighlights';
import { Reviews } from '../src/components/Reviews';
import { FinancingCalculator } from '../src/components/FinancingCalculator';
import { ServicesSection } from '../src/components/ServicesSection';
import { Footer } from '../src/components/Footer';
import { ClosingCta } from '../src/components/ClosingCta';
import { Motorcycle } from '../src/types';
import { MOTORCYCLES, MOTO_NUOVE } from '../src/data/motorcycles';

/** Porta in vista una sezione della pagina con uno scorrimento morbido. */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <Contenuto />
    </Suspense>
  );
}

function Contenuto() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Il catalogo sta su /moto. Quando da li' si chiede di calcolare la rata,
  // la moto scelta arriva qui nell'indirizzo come ?moto=<id>.
  const [bikeForFinancing, setBikeForFinancing] = useState<Motorcycle>(MOTO_NUOVE[0]);

  useEffect(() => {
    const id = searchParams.get('moto');
    if (!id) return;
    const bike = MOTORCYCLES.find((m) => m.id === id);
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
