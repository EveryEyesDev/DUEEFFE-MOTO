'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Logo ufficiale DUE EFFE MOTO.
 *
 * DOVE METTERE IL FILE
 * Salva il logo in: /public/brand/dueffe-logo.png
 * Se hai il vettoriale, salvalo come dueffe-logo.svg e cambia LOGO_SRC qui sotto.
 *
 * SFONDO
 * Il file in uso e' gia' con lo sfondo trasparente, ricavato dall'originale
 * su fondo nero conservato qui accanto come dueffe-logo-originale.jpeg.
 * Per questo FONDO_NERO e' false: il logo viene disegnato cosi' com'e' e
 * funziona su qualunque fondo, chiaro o scuro.
 *
 * Se un giorno sostituirai il file con uno su fondo nero pieno, rimetti
 * FONDO_NERO a true: i pixel neri verranno fusi e spariranno.
 */
const LOGO_SRC = '/brand/dueffe-logo.png';
const FONDO_NERO = false;

interface DueffeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Testo alternativo per i lettori di schermo. */
  alt?: string;
}

/** Altezze in pixel. La larghezza si adatta da sola per non deformare il marchio. */
const HEIGHT_MAP: Record<NonNullable<DueffeLogoProps['size']>, number> = {
  sm: 38,
  md: 60,
  lg: 96,
  xl: 215,
};

export const DueffeLogo: React.FC<DueffeLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DUEFFE MOTO',
}) => {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const height = HEIGHT_MAP[size];

  // L'immagine puo' fallire PRIMA che React agganci onError (durante l'idratazione).
  // Al montaggio ricontrolliamo lo stato reale dell'elemento.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return <DueffeWordmarkFallback size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={LOGO_SRC}
      alt={alt}
      height={height}
      style={{
        height,
        width: 'auto',
        ...(FONDO_NERO ? { mixBlendMode: 'screen' as const } : {}),
      }}
      className={`block select-none ${className}`}
      onError={() => setFailed(true)}
    />
  );
};

/**
 * Marchio testuale di ripiego, usato solo se il file del logo manca.
 * Rispetta i colori del marchio: bianco con le due effe e "moto" in rosso.
 */
const DueffeWordmarkFallback: React.FC<{
  size: NonNullable<DueffeLogoProps['size']>;
  className?: string;
}> = ({ size, className = '' }) => {
  const scale: Record<string, string> = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  return (
    <span
      className={`inline-flex flex-col leading-none font-display font-extrabold tracking-tight select-none ${scale[size]} ${className}`}
      aria-label="DUEFFE MOTO"
    >
      <span className="text-white">
        due<span className="text-[#D00020]">ff</span>e
      </span>
      <span className="text-[#D00020] italic">moto</span>
    </span>
  );
};
