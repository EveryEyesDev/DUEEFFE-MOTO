'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { DueffeLogo } from '../../src/components/DueffeLogo';

/**
 * La pagina di accesso all'area riservata.
 *
 * E' volutamente spoglia: nessun collegamento al resto del sito, nessuna
 * navigazione. Chi arriva qui sa gia' cosa cerca, e chi ci capita per
 * sbaglio non deve trovare appigli.
 */
export default function Entra() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [inCorso, setInCorso] = useState(false);

  const invia = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');
    setInCorso(true);
    try {
      const risposta = await fetch('/api/admin/accesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (risposta.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      const dati = await risposta.json().catch(() => ({}));
      setErrore(dati.errore ?? 'Non sono riuscito a farti entrare.');
    } catch {
      setErrore('Nessuna risposta dal server. Controlla la connessione.');
    } finally {
      setInCorso(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070709] text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <DueffeLogo size="md" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div className="flex items-center gap-2.5 mb-1">
            <Lock className="w-4 h-4 text-[#D00020]" />
            <h1 className="text-sm font-bold uppercase tracking-widest">Area riservata</h1>
          </div>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Da qui si aggiorna il catalogo: moto usate, schede tecniche e fotografie.
          </p>

          <form onSubmit={invia} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs text-slate-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020] transition-colors"
              />
            </div>

            {errore && (
              <p role="alert" className="text-xs text-[#ff6b7f] leading-relaxed">
                {errore}
              </p>
            )}

            <button
              type="submit"
              disabled={inCorso || password.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#D00020] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider transition-colors"
            >
              {inCorso ? 'Un momento...' : 'Entra'}
              {!inCorso && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
