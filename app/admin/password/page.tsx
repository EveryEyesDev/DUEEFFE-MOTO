'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { IntestazioneAdmin } from '../../../src/components/admin/IntestazioneAdmin';

/** La pagina da cui il responsabile cambia la propria password. */
export default function CambiaPassword() {
  const router = useRouter();
  const [vecchia, setVecchia] = useState('');
  const [nuova, setNuova] = useState('');
  const [conferma, setConferma] = useState('');
  const [messaggio, setMessaggio] = useState<{ testo: string; buono: boolean } | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const invia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuova !== conferma) {
      setMessaggio({ testo: 'Le due password nuove non coincidono.', buono: false });
      return;
    }
    setInCorso(true);
    setMessaggio(null);
    try {
      const risposta = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vecchia, nuova }),
      });
      const dati = await risposta.json().catch(() => ({}));
      if (risposta.ok) {
        setMessaggio({
          testo: 'Password cambiata. Da adesso si entra con quella nuova.',
          buono: true,
        });
        setVecchia('');
        setNuova('');
        setConferma('');
        router.refresh();
      } else {
        setMessaggio({ testo: dati.errore ?? 'Non sono riuscito a cambiarla.', buono: false });
      }
    } catch {
      setMessaggio({ testo: 'Nessuna risposta dal server.', buono: false });
    } finally {
      setInCorso(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070709] text-slate-100">
      <IntestazioneAdmin titolo="Cambia la password" />

      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-[#D00020] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              La password vale per tutti quelli che entrano qui: &egrave; una sola. Cambiandola,
              chi aveva la vecchia non entra pi&ugrave;. Scegline una lunga, almeno dieci
              caratteri, e non riusarla da altre parti.
            </p>
          </div>

          <form onSubmit={invia} className="space-y-4">
            <Campo
              etichetta="Password di adesso"
              valore={vecchia}
              onChange={setVecchia}
              autoComplete="current-password"
            />
            <Campo
              etichetta="Password nuova"
              valore={nuova}
              onChange={setNuova}
              autoComplete="new-password"
            />
            <Campo
              etichetta="Ripeti la password nuova"
              valore={conferma}
              onChange={setConferma}
              autoComplete="new-password"
            />

            {messaggio && (
              <p
                role="status"
                className={`text-xs leading-relaxed ${
                  messaggio.buono ? 'text-emerald-400' : 'text-[#ff6b7f]'
                }`}
              >
                {messaggio.testo}
              </p>
            )}

            <button
              type="submit"
              disabled={inCorso || !vecchia || !nuova || !conferma}
              className="w-full px-5 py-2.5 rounded-lg bg-[#D00020] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider transition-colors"
            >
              {inCorso ? 'Cambio...' : 'Cambia la password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

const Campo: React.FC<{
  etichetta: string;
  valore: string;
  onChange: (v: string) => void;
  autoComplete: string;
}> = ({ etichetta, valore, onChange, autoComplete }) => (
  <label className="block">
    <span className="block text-xs text-slate-400 mb-1.5">{etichetta}</span>
    <input
      type="password"
      autoComplete={autoComplete}
      value={valore}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020] transition-colors"
    />
  </label>
);
