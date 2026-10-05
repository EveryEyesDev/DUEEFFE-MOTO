'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

/** Esce dall'area riservata buttando via il biglietto di accesso. */
export const EsciButton: React.FC = () => {
  const router = useRouter();

  const esci = async () => {
    await fetch('/api/admin/accesso', { method: 'DELETE' });
    router.push('/entra');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={esci}
      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Esci
    </button>
  );
};
