'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Motorcycle } from '../types';
import { MOTO_NUOVE, MOTO_USATE } from '../data/motorcycles';

/**
 * Il catalogo come lo vedono i componenti della pagina.
 *
 * PERCHE' UN CONTESTO E NON UN IMPORT
 * Prima ogni componente leggeva direttamente le liste scritte nel codice.
 * Andava bene finche' il catalogo era fisso. Adesso che il responsabile lo
 * modifica dall'area riservata, quelle liste sono solo il punto di
 * partenza: la verita' arriva dal server, che le unisce con il database.
 *
 * Con un contesto il cambiamento costa una riga per componente invece di
 * far passare le liste di mano in mano attraverso cinque livelli di
 * proprieta'.
 *
 * IL VALORE DI RIPIEGO
 * Se un componente finisse fuori dal contesto, invece di rompersi legge il
 * catalogo scritto nel codice. Male che vada mostra dati un po' vecchi,
 * che e' sempre meglio di una pagina che non si apre.
 */

interface Catalogo {
  nuove: Motorcycle[];
  usate: Motorcycle[];
  tutte: Motorcycle[];
}

const Contesto = createContext<Catalogo | null>(null);

export const CatalogoProvider: React.FC<{
  nuove: Motorcycle[];
  usate: Motorcycle[];
  children: React.ReactNode;
}> = ({ nuove, usate, children }) => {
  const valore = useMemo(
    () => ({ nuove, usate, tutte: [...nuove, ...usate] }),
    [nuove, usate],
  );
  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>;
};

export function useCatalogo(): Catalogo {
  const valore = useContext(Contesto);
  if (valore) return valore;
  return { nuove: MOTO_NUOVE, usate: MOTO_USATE, tutte: [...MOTO_NUOVE, ...MOTO_USATE] };
}

/**
 * Le moto da mettere in vetrina: una per marca.
 *
 * Stava in src/data/motorcycles.ts quando il catalogo era fisso. Adesso
 * deve ragionare su quello che c'e' davvero, percio' vive qui.
 */
export function vetrina(nuove: Motorcycle[], preferite: string[]): Motorcycle[] {
  const marche = Array.from(new Set(nuove.map((m) => m.brand)));
  return marche
    .map((marca) => {
      const dellaMarca = nuove.filter((m) => m.brand === marca);
      // In vetrina ci va solo chi ha la fotografia su strada. Senza, il
      // riquadro mostra "Foto in arrivo": va benissimo in mezzo al
      // catalogo, dove si capisce che e' un modello appena uscito, ma in
      // evidenza no - la' ci sono tre moto in tutto e una e' un quadrato
      // grigio. La moto resta a catalogo come le altre.
      const conFoto = dellaMarca.filter((m) => m.roadImage);
      const fra = conFoto.length > 0 ? conFoto : dellaMarca;
      return (
        fra.find((m) => preferite.includes(m.id)) ??
        fra.find((m) => m.specs.displacementCc !== undefined) ??
        fra[0]
      );
    })
    .filter((m): m is Motorcycle => m !== undefined);
}
