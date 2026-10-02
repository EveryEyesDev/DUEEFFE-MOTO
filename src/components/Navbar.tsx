'use client';

import React, { useState } from 'react';
import { DueffeLogo } from './DueffeLogo';
import { Calendar, Menu, X, PhoneCall } from 'lucide-react';

interface NavbarProps {
  onOpenTestRide: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTestRide }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Gamma Moto', href: '#gamma' },
    { label: 'Showroom 3D', href: '#visualizzatore-3d' },
    { label: 'Finanziamenti', href: '#finanziamento' },
    { label: 'Officina & Reparto Corse', href: '#officina' },
    { label: 'Contatti', href: '#contatti' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Single Brand Wordmark Element */}
        <a href="#" className="flex items-center gap-2 group focus:outline-none" aria-label="Dueffe Moto Homepage">
          <DueffeLogo size="md" />
        </a>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white hover:border-b-2 hover:border-[#E10600] pb-1 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+39068994512"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E10600]" />
            <span className="font-tech tracking-wider">06.8994512</span>
          </a>

          <button
            onClick={onOpenTestRide}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-lg shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>Prenota Test Ride</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Apri menu di navigazione"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0c0d12]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="tel:+39068994512"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
            >
              <PhoneCall className="w-4 h-4 text-[#E10600]" />
              <span>Chiamaci: 06.8994512</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
