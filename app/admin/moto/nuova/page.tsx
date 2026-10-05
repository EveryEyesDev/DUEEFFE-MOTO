import React from 'react';
import { ModuloMoto } from '../../../../src/components/admin/ModuloMoto';
import { IntestazioneAdmin } from '../../../../src/components/admin/IntestazioneAdmin';
import { Motorcycle } from '../../../../src/types';

export const dynamic = 'force-dynamic';

/**
 * Una moto nuova di zecca, con i campi gia' impostati sul caso piu'
 * frequente: una usata, perche' e' quella che si aggiunge ogni mese.
 */
export default async function NuovaMoto({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const usata = tipo !== 'nuovo';

  const vuota: Motorcycle = {
    id: '',
    brand: '',
    name: '',
    subtitle: '',
    condition: usata ? 'usato' : 'nuovo',
    category: 'naked',
    categoryLabel: 'Naked',
    tagline: '',
    description: '',
    colors: [],
    specs: {},
    features: [],
    ...(usata ? { used: { year: new Date().getFullYear(), km: 0 } } : {}),
  };

  return (
    <main className="min-h-screen bg-[#070709] text-slate-100">
      <IntestazioneAdmin titolo={usata ? 'Nuova moto usata' : 'Nuova moto a listino'} />
      <div className="max-w-4xl mx-auto px-5 py-8">
        <ModuloMoto motoIniziale={vuota} nascostaIniziale={false} nuova />
      </div>
    </main>
  );
}
