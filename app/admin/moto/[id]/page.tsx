import React from 'react';
import { notFound } from 'next/navigation';
import { leggiCatalogoCompleto } from '../../../../src/lib/catalogo';
import { ModuloMoto } from '../../../../src/components/admin/ModuloMoto';
import { IntestazioneAdmin } from '../../../../src/components/admin/IntestazioneAdmin';

export const dynamic = 'force-dynamic';

export default async function ModificaMoto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutte = await leggiCatalogoCompleto();
  const voce = tutte.find((v) => v.moto.id === decodeURIComponent(id));
  if (!voce) notFound();

  return (
    <main className="min-h-screen bg-[#070709] text-slate-100">
      <IntestazioneAdmin titolo={`${voce.moto.brand} ${voce.moto.name}`} />
      <div className="max-w-4xl mx-auto px-5 py-8">
        <ModuloMoto motoIniziale={voce.moto} nascostaIniziale={voce.nascosta} nuova={false} />
      </div>
    </main>
  );
}
