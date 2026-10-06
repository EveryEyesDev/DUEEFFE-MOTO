import React from 'react';
import { draftMode } from 'next/headers';
import { leggiCatalogo } from '../src/lib/catalogo';
import { BarraAnteprima } from '../src/components/BarraAnteprima';
import { CatalogoProvider } from '../src/lib/catalogo-contesto';
import ContenutoHome from '../src/components/ContenutoHome';

/** La home. Vedi app/moto/page.tsx per come viene letto il catalogo. */
// Next vuole qui un numero scritto a mano: deve poterlo leggere senza
// eseguire il file, quindi una costante importata non va bene.
export const revalidate = 60;

export default async function Home() {
  const { isEnabled: anteprima } = await draftMode();
  const { nuove, usate } = await leggiCatalogo(anteprima);
  return (
    <CatalogoProvider nuove={nuove} usate={usate}>
      {anteprima && <BarraAnteprima />}
      <ContenutoHome />
    </CatalogoProvider>
  );
}
