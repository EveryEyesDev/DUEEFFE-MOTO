'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as Icona } from 'lucide-react';

/**
 * Una casella per caricare una fotografia.
 *
 * COSA FA DAVVERO
 * Manda il file al server, che lo mette nell'archivio e restituisce
 * l'indirizzo pubblico. Quello che resta nella scheda della moto e'
 * l'indirizzo, non il file: cosi' una fotografia gia' caricata si puo'
 * riusare, e cambiarla non ne lascia in giro copie dimenticate.
 *
 * PERCHE' SI PUO' ANCHE SCRIVERE L'INDIRIZZO A MANO
 * Le fotografie delle moto nuove sono gia' nel sito, sotto /moto/...
 * Chi sa quale vuole la indica e basta, senza ricaricarla. Serve soprattutto
 * quando si corregge una scheda esistente.
 */

interface Props {
  cartella: string;
  indirizzo: string;
  onCambia: (indirizzo: string) => void;
  etichetta?: string;
}

export const CaricaFoto: React.FC<Props> = ({ cartella, indirizzo, onCambia, etichetta }) => {
  const input = useRef<HTMLInputElement>(null);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState('');

  const carica = async (file: File) => {
    setErrore('');
    setInCorso(true);
    try {
      const modulo = new FormData();
      modulo.append('file', file);
      modulo.append('cartella', cartella || 'varie');
      const risposta = await fetch('/api/admin/foto', { method: 'POST', body: modulo });
      const dati = await risposta.json().catch(() => ({}));
      if (risposta.ok && dati.indirizzo) {
        onCambia(dati.indirizzo);
      } else {
        setErrore(dati.errore ?? 'Caricamento non riuscito.');
      }
    } catch {
      setErrore('Nessuna risposta dal server.');
    } finally {
      setInCorso(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {etichetta && <span className="block text-xs text-slate-400">{etichetta}</span>}

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative w-36 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
          {indirizzo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={indirizzo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icona className="w-6 h-6 text-slate-700" />
          )}
          {indirizzo && (
            <button
              type="button"
              onClick={() => onCambia('')}
              aria-label="Togli la fotografia"
              className="absolute top-1 right-1 p-1 rounded bg-black/70 text-slate-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-[220px] space-y-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={inCorso}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/15 text-xs text-slate-200 hover:border-white/35 disabled:opacity-40 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {inCorso ? 'Carico...' : 'Scegli una fotografia'}
          </button>

          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) carica(file);
            }}
          />

          <input
            type="text"
            value={indirizzo}
            onChange={(e) => onCambia(e.target.value)}
            placeholder="oppure incolla qui un indirizzo, es. /moto/x-cape-700/in-strada.webp"
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-300 text-[11px] font-mono focus:outline-none focus:border-[#D00020] transition-colors"
          />

          {errore && <p className="text-[11px] text-[#ff6b7f]">{errore}</p>}
        </div>
      </div>
    </div>
  );
};
