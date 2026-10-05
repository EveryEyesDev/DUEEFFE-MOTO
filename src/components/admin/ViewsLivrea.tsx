'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Motorcycle, BikeColorway } from '../../types';
import { CaricaFoto } from './CaricaFoto';

/**
 * Le fotografie della scheda, divise per livrea.
 *
 * COM'E' FATTO IL CATALOGO
 * Una moto ha una o piu' livree (i colori), e ogni livrea ha fino a sei
 * viste: fronte, retro, i due profili e le due tre quarti. Chi apre la
 * moto sul sito vede le viste della livrea scelta, e cambiando colore
 * resta sulla stessa inquadratura.
 *
 * PER L'USATO BASTA UNA LIVREA
 * Una moto usata e' un pezzo unico: ha il colore che ha. Il modulo parte
 * gia' con una livrea sola, e chi vuole puo' aggiungerne altre solo se
 * serve davvero, per una moto nuova disponibile in piu' colori.
 *
 * NON SERVE RIEMPIRLE TUTTE
 * Le viste lasciate vuote semplicemente non compaiono. Con una fotografia
 * sola la scheda funziona lo stesso.
 */

const VISTE: { id: string; etichetta: string }[] = [
  { id: 'lato-destro', etichetta: 'Profilo destro' },
  { id: 'lato-sinistro', etichetta: 'Profilo sinistro' },
  { id: 'fronte', etichetta: 'Fronte' },
  { id: 'retro', etichetta: 'Retro' },
  { id: 'angolo-destro', etichetta: 'Tre quarti destro' },
  { id: 'angolo-sinistro', etichetta: 'Tre quarti sinistro' },
];

interface Props {
  moto: Motorcycle;
  onCambia: (colorways: BikeColorway[]) => void;
}

export const ViewsLivrea: React.FC<Props> = ({ moto, onCambia }) => {
  const livree: BikeColorway[] = moto.colorways?.length
    ? moto.colorways
    : [{ slug: 'unica', name: 'Colore', hex: '#1a1a1e', views: [] }];

  const modifica = (indice: number, campi: Partial<BikeColorway>) => {
    const copia = livree.map((l, i) => (i === indice ? { ...l, ...campi } : l));
    onCambia(copia);
  };

  const cambiaVista = (indice: number, vista: string, indirizzo: string) => {
    const livrea = livree[indice];
    const altre = livrea.views.filter((v) => v.id !== vista);
    const nuove = indirizzo
      ? [
          ...altre,
          {
            id: vista,
            label: VISTE.find((v) => v.id === vista)?.etichetta ?? vista,
            src: indirizzo,
          },
        ]
      : altre;
    // Teniamo l'ordine fisso delle viste, cosi' la scheda le mostra sempre
    // nello stesso giro invece che nell'ordine in cui sono state caricate.
    nuove.sort((a, b) => VISTE.findIndex((v) => v.id === a.id) - VISTE.findIndex((v) => v.id === b.id));
    modifica(indice, { views: nuove });
  };

  return (
    <div className="space-y-6">
      {livree.map((livrea, indice) => (
        <div key={indice} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block flex-1 min-w-[160px]">
              <span className="block text-xs text-slate-400 mb-1.5">Nome del colore</span>
              <input
                type="text"
                value={livrea.name}
                onChange={(e) => modifica(indice, { name: e.target.value })}
                placeholder="es. Rosso Passion"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D00020]"
              />
            </label>

            <label className="block">
              <span className="block text-xs text-slate-400 mb-1.5">Pallino</span>
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(livrea.hex) ? livrea.hex : '#1a1a1e'}
                onChange={(e) => modifica(indice, { hex: e.target.value })}
                className="w-14 h-10 rounded-lg bg-black/40 border border-white/15 cursor-pointer"
              />
            </label>

            {livree.length > 1 && (
              <button
                type="button"
                onClick={() => onCambia(livree.filter((_, i) => i !== indice))}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-[#ff6b7f] hover:border-[#ff6b7f]/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Togli colore
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {VISTE.map((vista) => (
              <CaricaFoto
                key={vista.id}
                etichetta={vista.etichetta}
                cartella={`${moto.id}/${livrea.slug || 'unica'}`}
                indirizzo={livrea.views.find((v) => v.id === vista.id)?.src ?? ''}
                onCambia={(indirizzo) => cambiaVista(indice, vista.id, indirizzo)}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onCambia([
            ...livree,
            {
              slug: `colore-${livree.length + 1}`,
              name: '',
              hex: '#1a1a1e',
              views: [],
            },
          ])
        }
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dashed border-white/20 text-xs text-slate-400 hover:text-white hover:border-white/40 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Aggiungi un altro colore
      </button>
    </div>
  );
};
