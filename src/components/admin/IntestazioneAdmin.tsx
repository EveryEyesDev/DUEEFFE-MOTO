import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EsciButton } from './EsciButton';

/** La barra in alto delle pagine dell'area riservata. */
export const IntestazioneAdmin: React.FC<{ titolo: string }> = ({ titolo }) => (
  <header className="border-b border-white/10 bg-[#050507] sticky top-0 z-20">
    <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/admin"
          aria-label="Torna all'elenco"
          className="text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-bold uppercase tracking-wider truncate">{titolo}</h1>
      </div>
      <EsciButton />
    </div>
  </header>
);
