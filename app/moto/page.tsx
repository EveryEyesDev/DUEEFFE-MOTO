import React from 'react';
import { draftMode } from 'next/headers';
import { leggiCatalogo } from '../../src/lib/catalogo';
import { BarraAnteprima } from '../../src/components/BarraAnteprima';
import { CatalogoProvider } from '../../src/lib/catalogo-contesto';
import ContenutoMoto from '../../src/components/ContenutoMoto';

/**
 * La pagina del catalogo.
 *
 * Qui, sul server, si legge il catalogo unendo quello scritto nel codice
 * con le modifiche fatte dall'area riservata. Il risultato scende poi a
 * tutta la pagina attraverso il contesto.
 *
 * La copia resta buona un minuto: abbastanza da non interrogare il
 * database ad ogni visita, abbastanza poco da far vedere subito una moto
 * appena inserita. Dopo un salvataggio, comunque, la copia viene buttata
 * dal server stesso, quindi il responsabile vede il risultato all'istante.
 */
// Next vuole qui un numero scritto a mano: deve poterlo leggere senza
// eseguire il file, quindi una costante importata non va bene.
export const revalidate = 60;

export default async function PaginaMoto() {
  const { isEnabled: anteprima } = await draftMode();
  const { nuove, usate } = await leggiCatalogo(anteprima);
  return (
    <CatalogoProvider nuove={nuove} usate={usate}>
      {anteprima && <BarraAnteprima />}
      <ContenutoMoto />
    </CatalogoProvider>
  );
}
