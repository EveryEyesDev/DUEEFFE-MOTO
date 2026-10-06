'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';

/**
 * La striscia che avverte: stai guardando l'anteprima.
 *
 * Senza di lei il responsabile rischia di credere che una moto sia
 * pubblicata quando invece la vede solo lui, e di dire a un cliente
 * "guarda sul sito" per sentirsi rispondere che non c'e' niente.
 *
 * Sta in alto e si vede: deve dare fastidio quel tanto che basta a
 * ricordarsi di spegnerla.
 */
export const BarraAnteprima: React.FC = () => {
  const router = useRouter();

  const esci = async () => {
    await fetch('/api/admin/anteprima', { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-400 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-xs font-semibold">
        <Eye className="w-4 h-4 shrink-0" />
        <span>
          Anteprima: vedi anche le moto nascoste. I visitatori non le vedono.
        </span>
        <button
          type="button"
          onClick={esci}
          className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
        >
          <X className="w-3.5 h-3.5" />
          Esci
        </button>
      </div>
    </div>
  );
};
