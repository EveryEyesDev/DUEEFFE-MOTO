import React from 'react';
import { leggiCatalogo } from '../src/lib/catalogo';
import { CatalogoProvider } from '../src/lib/catalogo-contesto';
import ContenutoHome from '../src/components/ContenutoHome';

/** La home. Vedi app/moto/page.tsx per come viene letto il catalogo. */
// Next vuole qui un numero scritto a mano: deve poterlo leggere senza
// eseguire il file, quindi una costante importata non va bene.
export const revalidate = 60;

export default async function Home() {
  const { nuove, usate } = await leggiCatalogo();
  return (
    <CatalogoProvider nuove={nuove} usate={usate}>
      <ContenutoHome />
    </CatalogoProvider>
  );
}
