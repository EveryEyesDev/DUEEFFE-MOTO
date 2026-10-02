'use client';

import React, { useState } from 'react';
import { Navbar } from '../src/components/Navbar';
import { HeroSection } from '../src/components/HeroSection';
import { MotorcycleShowcase } from '../src/components/MotorcycleShowcase';
import { FinancingCalculator } from '../src/components/FinancingCalculator';
import { ServicesSection } from '../src/components/ServicesSection';
import { Footer } from '../src/components/Footer';
import { TestRideModal } from '../src/components/TestRideModal';
import { Motorcycle } from '../src/types';
import { MOTORCYCLES } from '../src/data/motorcycles';

export default function NextLandingPage() {
  const [testRideModalOpen, setTestRideModalOpen] = useState<boolean>(false);
  const [selectedBikeForAction, setSelectedBikeForAction] = useState<Motorcycle>(MOTORCYCLES[0]);

  const handleOpenTestRide = (bike?: Motorcycle) => {
    if (bike) setSelectedBikeForAction(bike);
    setTestRideModalOpen(true);
  };

  const handleSelectForFinancing = (bike: Motorcycle) => {
    setSelectedBikeForAction(bike);
    const elem = document.getElementById('finanziamento');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore3D = () => {
    const elem = document.getElementById('visualizzatore-3d');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCatalog = () => {
    const elem = document.getElementById('gamma');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col font-sans selection:bg-[#E10600] selection:text-white">
      <Navbar onOpenTestRide={() => handleOpenTestRide()} />

      <main className="flex-1">
        <HeroSection
          onExplore3D={handleExplore3D}
          onExploreCatalog={handleExploreCatalog}
          onBookTestRide={() => handleOpenTestRide()}
        />

        <MotorcycleShowcase
          onSelectForFinancing={handleSelectForFinancing}
          onBookTestRide={(bike) => handleOpenTestRide(bike)}
        />

        <FinancingCalculator
          initialBike={selectedBikeForAction}
          onBookTestRide={(bike) => handleOpenTestRide(bike)}
        />

        <ServicesSection />
      </main>

      <Footer />

      <TestRideModal
        isOpen={testRideModalOpen}
        onClose={() => setTestRideModalOpen(false)}
        preselectedBike={selectedBikeForAction}
      />
    </div>
  );
}
