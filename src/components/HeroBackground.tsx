'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SITE } from '../config/site';

/**
 * Sfondo dell'apertura.
 *
 * Disegno originale fatto a codice: strada in prospettiva che fugge
 * verso l'orizzonte, alone rosso del marchio, scie di velocita' e vignettatura.
 * Niente immagini di terzi, quindi nessun problema di diritti.
 *
 * Se in `SITE.heroImage` metti il percorso di una vostra fotografia
 * (per esempio '/foto/showroom.jpg'), quella diventa il fondo e il disegno
 * resta sopra come velatura. Se il file manca si torna da solo al disegno.
 */
export const HeroBackground: React.FC = () => {
  const photo = SITE.heroImage;
  const [photoOk, setPhotoOk] = useState<boolean>(Boolean(photo));
  const imgRef = useRef<HTMLImageElement>(null);

  // La foto puo' fallire prima che React agganci onError: ricontrolliamo al montaggio.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPhotoOk(false);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-[#070709]" />

      {/* Fotografia della sede, se disponibile */}
      {photo && photoOk && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={() => setPhotoOk(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/70 via-[#070709]/80 to-[#070709]" />
        </>
      )}

      {/* Strada in prospettiva */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[62%]"
        viewBox="0 0 1200 500"
        preserveAspectRatio="none"
      >
        <defs>
          {/* La strada sfuma verso l'alto, cosi' l'orizzonte non ha un bordo netto */}
          <linearGradient id="dissolvenzaStrada" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="35%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="mascheraStrada">
            <rect width="1200" height="500" fill="url(#dissolvenzaStrada)" />
          </mask>

          {/* Bagliore rosso all'orizzonte */}
          <radialGradient id="aloneOrizzonte" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="#D00020" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#D00020" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D00020" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Alone sopra la linea d'orizzonte */}
        <rect width="1200" height="500" fill="url(#aloneOrizzonte)" />

        <g mask="url(#mascheraStrada)">
          {/* Linee che convergono nel punto di fuga (600, 0) */}
          <g stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.2">
            {[-1400, -950, -620, -380, -200, -70, 70, 200, 380, 620, 950, 1400].map((x) => (
              <line key={x} x1="600" y1="0" x2={600 + x} y2="500" />
            ))}
          </g>

          {/* Linee trasversali, piu' fitte verso l'orizzonte per dare profondita' */}
          <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">
            {[6, 16, 30, 50, 78, 116, 168, 238, 330, 450].map((y) => (
              <line key={y} x1="0" y1={y} x2="1200" y2={y} />
            ))}
          </g>

          {/* Mezzeria rossa */}
          <g stroke="#D00020" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round">
            <line x1="600" y1="12" x2="600" y2="34" />
            <line x1="600" y1="52" x2="600" y2="92" />
            <line x1="600" y1="124" x2="600" y2="196" />
            <line x1="600" y1="248" x2="600" y2="372" />
            <line x1="600" y1="430" x2="600" y2="500" strokeWidth="4" />
          </g>
        </g>
      </svg>

      {/* Scie di velocita' */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.5]" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="scia" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D00020" stopOpacity="0" />
            <stop offset="45%" stopColor="#D00020" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff6b5e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sciaChiara" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>
          <rect x="-200" y="150" width="620" height="2" fill="url(#scia)" />
          <rect x="780" y="236" width="560" height="1.5" fill="url(#sciaChiara)" />
          <rect x="-120" y="330" width="420" height="1.5" fill="url(#sciaChiara)" />
          <rect x="860" y="432" width="520" height="2" fill="url(#scia)" />
          <rect x="-160" y="560" width="500" height="1.5" fill="url(#scia)" />
        </g>
      </svg>

      {/* Aloni morbidi del colore del marchio */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[760px] h-[420px] bg-[#D00020]/10 blur-[130px] rounded-full" />
      <div className="absolute -bottom-20 right-[8%] w-[520px] h-[320px] bg-red-900/20 blur-[110px] rounded-full" />
      <div className="absolute top-[10%] left-[6%] w-[380px] h-[260px] bg-slate-500/5 blur-[90px] rounded-full" />

      {/* Vignettatura: scurisce i bordi e porta l'occhio al centro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,7,9,0.85)_100%)]" />

      {/* Sfumatura finale verso la sezione successiva */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#070709]" />
    </div>
  );
};
