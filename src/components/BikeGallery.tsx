'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BikeGalleryProps {
  /** Percorsi delle immagini dentro /public. */
  images: string[];
  /** Serve per il testo alternativo. */
  alt: string;
}

/**
 * Galleria fotografica di un modello.
 *
 * Immagine grande con le miniature sotto, frecce ai lati e frecce
 * della tastiera. Sono normali immagini: funziona su qualunque browser.
 */
export const BikeGallery: React.FC<BikeGalleryProps> = ({ images, alt }) => {
  const [indice, setIndice] = useState(0);

  // Se cambia la moto si riparte dalla prima fotografia.
  useEffect(() => {
    setIndice(0);
  }, [images]);

  if (images.length === 0) return null;

  const vai = (passo: number) =>
    setIndice((i) => (((i + passo) % images.length) + images.length) % images.length);

  return (
    <div
      className="w-full"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          vai(-1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          vai(1);
        }
      }}
      tabIndex={0}
    >
      {/* Immagine grande */}
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-[#f4f5f7] to-[#dfe2e6] border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[indice]}
          alt={`${alt}, immagine ${indice + 1} di ${images.length}`}
          className="w-full h-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => vai(-1)}
              aria-label="Immagine precedente"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => vai(1)}
              aria-label="Immagine successiva"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/65 text-white text-[11px] font-mono tabular-nums backdrop-blur-sm">
              {indice + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniature */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Vai all’immagine ${i + 1}`}
              aria-pressed={i === indice}
              className={`relative shrink-0 w-24 aspect-[16/10] rounded-lg overflow-hidden border transition-all ${
                i === indice
                  ? 'border-[#D00020] ring-1 ring-[#D00020]'
                  : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover bg-[#eceef0]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
