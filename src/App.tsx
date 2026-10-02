/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MotorcycleShowcase } from './components/MotorcycleShowcase';
import { FinancingCalculator } from './components/FinancingCalculator';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';
import { TestRideModal } from './components/TestRideModal';
import { Motorcycle } from './types';
import { MOTORCYCLES } from './data/motorcycles';

export default function App() {
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
      {/* Top Bar Navigation */}
      <Navbar onOpenTestRide={() => handleOpenTestRide()} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExplore3D={handleExplore3D}
          onExploreCatalog={handleExploreCatalog}
          onBookTestRide={() => handleOpenTestRide()}
        />

        {/* Motorcycle Showcase & 3D Interactive Viewer */}
        <MotorcycleShowcase
          onSelectForFinancing={handleSelectForFinancing}
          onBookTestRide={(bike) => handleOpenTestRide(bike)}
        />

        {/* Custom Tailored Financing Calculator */}
        <FinancingCalculator
          initialBike={selectedBikeForAction}
          onBookTestRide={(bike) => handleOpenTestRide(bike)}
        />

        {/* Reparto Corse & Dealership Workshop Services */}
        <ServicesSection />
      </main>

      {/* Official Footer */}
      <Footer />

      {/* Interactive Test Ride Booking Modal */}
      <TestRideModal
        isOpen={testRideModalOpen}
        onClose={() => setTestRideModalOpen(false)}
        preselectedBike={selectedBikeForAction}
      />
    </div>
  );
}
