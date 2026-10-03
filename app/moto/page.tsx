'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../src/components/Navbar';
import { BikeShowcaseStrip } from '../../src/components/BikeShowcaseStrip';
import { MotorcycleShowcase } from '../../src/components/MotorcycleShowcase';
import { Footer } from '../../src/components/Footer';
import { ClosingCta } from '../../src/components/ClosingCta';
import { Motorcycle } from '../../src/types';
import { MOTORCYCLES, MOTO_NUOVE } from '../../src/data/motorcycles';
import { ChevronLeft } from 'lucide-react';

/**
 * Pagina del catalogo: tutte le moto, nuove e usate.
 *
 * Sta su una pagina propria e non in fondo alla home, cosi' le schede
 * non compaiono due volte nella stessa scorrimento e il catalogo
 * puo' crescere quanto serve senza allungare la home.
 */
export default function PaginaMoto() {
  return (
    <Suspense fallback={null}>
      <Contenuto />
    </Suspense>
  );
}

function Contenuto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBike, setSelectedBike] = useState<Motorcycle>(MOTO_NUOVE[0]);

  // Arrivando dalla vetrina in home, la moto scelta viaggia nell'indirizzo.
  useEffect(() => {
    const id = searchParams.get('moto');
    if (!id) return;
    const bike = MOTORCYCLES.find((m) => m.id === id);
    if (!bike) return;
    setSelectedBike(bike);
    requestAnimationFrame(() => {
      document.getElementById('dettaglio-moto')?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [searchParams]);

  // Il simulatore di rata sta in home: ci andiamo portandoci dietro la moto scelta.
  const handleSelectForFinancing = useCallback(
    (bike: Motorcycle) => {
      setSelectedBike(bike);
      router.push(`/?moto=${encodeURIComponent(bike.id)}#finanziamento`);
    },
    [router],
  );

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col font-sans selection:bg-[#D00020] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Ritorno alla home */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Torna alla home
          </Link>
        </div>

        <BikeShowcaseStrip
          onApriMoto={(bike) => {
            setSelectedBike(bike);
            requestAnimationFrame(() =>
              document.getElementById('dettaglio-moto')?.scrollIntoView({ behavior: 'smooth' }),
            );
          }}
          onTrovaLaTua={() =>
            document.getElementById('gamma')?.scrollIntoView({ behavior: 'smooth' })
          }
        />

        <MotorcycleShowcase
          selectedBike={selectedBike}
          onSelectBike={setSelectedBike}
          onSelectForFinancing={handleSelectForFinancing}
        />

        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
