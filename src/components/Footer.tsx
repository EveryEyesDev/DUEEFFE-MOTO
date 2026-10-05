'use client';

import React from 'react';
import Link from 'next/link';
import { DueffeLogo } from './DueffeLogo';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useCatalogo } from '../lib/catalogo-contesto';
import { SITE } from '../config/site';
import { SocialLinks } from './SocialLinks';


export const Footer: React.FC = () => {
  const { nuove } = useCatalogo();
  // Le marche che trattiamo: quelle gia' a catalogo per prime, poi le
  // altre dichiarate in configurazione, senza ripetizioni.
  const marche = Array.from(
    new Set([...nuove.map((m) => m.brand).sort(), ...SITE.brands]),
  );

  return (
    <footer className="bg-[#050507] border-t border-white/10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Marchio */}
          <div className="space-y-4">
            <DueffeLogo size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              {SITE.tagline}
              <br />
              {SITE.brands.join(' · ')}
            </p>
            <SocialLinks variante="icon" invito={null} />
          </div>

          {/*
            LE MARCHE, NON L'ELENCO DELLE MOTO
            Qui prima c'era la lista di tutti i modelli nuovi. Con sei moto
            ci stava; con una cinquantina diventa un muro di nomi che allunga
            il fondo pagina e non aiuta nessuno a trovare niente. Restano le
            marche, che e' l'informazione che la gente cerca davvero in
            fondo a un sito di concessionaria, e portano al catalogo gia'
            filtrato su quella marca.
          */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Le marche</h3>
            <ul className="space-y-2">
              {marche.map((marca) => (
                <li key={marca}>
                  <Link
                    href={`/moto?marca=${encodeURIComponent(marca)}`}
                    className="hover:text-white transition-colors"
                  >
                    {marca}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servizi */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Servizi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/moto" className="hover:text-white transition-colors">
                  Catalogo nuovo e usato
                </Link>
              </li>
              <li>
                <Link href="/#finanziamento" className="hover:text-white transition-colors">
                  Simulazione rata
                </Link>
              </li>
              <li>
                <Link href="/#officina" className="hover:text-white transition-colors">
                  Officina e tagliandi
                </Link>
              </li>
              <li>
                <Link href="/#officina" className="hover:text-white transition-colors">
                  Pratiche e immatricolazioni
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Sede e contatti</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D00020] shrink-0 mt-0.5" />
                <address className="not-italic">
                  {SITE.address.street}
                  <br />
                  {SITE.address.postalCode} {SITE.address.city} ({SITE.address.provinceName})
                </address>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D00020] shrink-0" />
                <a href={SITE.phone.href} className="font-mono text-white hover:underline">
                  {SITE.phone.display}
                </a>
              </div>
              {SITE.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D00020] shrink-0" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-white">
                    {SITE.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dati legali */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {SITE.legalName} · P.IVA {SITE.legal.vatNumber} · Codice SDI{' '}
            {SITE.legal.sdiCode} · Tutti i diritti riservati.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
