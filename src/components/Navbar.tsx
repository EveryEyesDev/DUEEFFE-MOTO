'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DueffeLogo } from './DueffeLogo';
import { Menu, X, PhoneCall } from 'lucide-react';
import { SITE } from '../config/site';

/**
 * I percorsi partono dalla radice, non sono semplici ancore:
 * cosi' la navigazione funziona anche dalla pagina del catalogo.
 */
const NAV_LINKS = [
  { label: 'Le nostre moto', href: '/moto' },
  { label: 'Recensioni', href: '/#recensioni' },
  { label: 'Finanziamenti', href: '/#finanziamento' },
  { label: 'Officina', href: '/#officina' },
  { label: 'Contatti', href: '/#contatti' },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Marchio */}
        <Link href="/" className="flex items-center group focus:outline-none" aria-label={`${SITE.brandName}, vai alla home`}>
          <DueffeLogo size="md" />
        </Link>

        {/* Navigazione principale */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300" aria-label="Navigazione principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-white border-b-2 border-transparent hover:border-[#D00020] pb-1 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Azioni */}
        <div className="flex items-center gap-3">
          <a
            href={SITE.phone.href}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#D00020] hover:bg-red-700 rounded-lg shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="font-tech tracking-wider">{SITE.phone.display}</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label={mobileMenuOpen ? 'Chiudi il menu di navigazione' : 'Apri il menu di navigazione'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0c0d12]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
