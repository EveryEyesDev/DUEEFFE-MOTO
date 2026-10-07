import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { leggiCatalogo } from '../../../src/lib/catalogo';
import { MOTO_NUOVE, MOTO_USATE } from '../../../src/data/motorcycles';
import { SchedaMoto } from '../../../src/components/SchedaMoto';
import { SITE } from '../../../src/config/site';

/**
 * La pagina di una singola moto.
 *
 * PERCHE' ESISTE
 * Chi cerca una moto non cerca "concessionaria a Cavallino": cerca
 * "Suzuki GSX-8S" e poi guarda chi ce l'ha vicino. Finche' le schede si
 * aprivano dentro al catalogo, senza un indirizzo proprio, quella ricerca
 * non poteva portare qui: per Google esisteva una pagina sola, /moto, e
 * cinquantadue moto dentro che non poteva nominare.
 *
 * Adesso ogni moto ha il suo indirizzo, il suo titolo, la sua descrizione
 * e i suoi dati strutturati con il prezzo. E' anche un collegamento che si
 * puo' mandare su WhatsApp a un cliente, cosa che prima non si poteva
 * fare.
 *
 * COME SONO FATTE
 * Pagine statiche, generate una volta in fase di pubblicazione: sono
 * cinquantadue schede che cambiano di rado, e farle calcolare a ogni
 * visita sarebbe lavoro sprecato. Il minuto di rinfresco vale anche qui,
 * cosi' una moto modificata dall'area riservata si aggiorna da sola.
 *
 * Il catalogo /moto resta com'era, con la scheda che si apre li' dentro:
 * chi sta sfogliando non deve cambiare pagina ad ogni moto che guarda.
 * Queste pagine servono a chi arriva da fuori.
 */

// Next vuole qui un numero scritto a mano: deve poterlo leggere senza
// eseguire il file, quindi una costante importata non va bene.
export const revalidate = 60;

// Una moto aggiunta dall'area riservata dopo la pubblicazione non ha la
// sua pagina gia' pronta: questa la fa calcolare al primo che la chiede.
export const dynamicParams = true;

/**
 * Gli indirizzi da preparare in anticipo.
 *
 * Si leggono dal catalogo scritto nel codice e non dal database: qui siamo
 * in fase di pubblicazione, e se Supabase non risponde la pubblicazione
 * non deve fallire. Le moto che stanno solo nel database se la fanno
 * calcolare alla prima visita, grazie a dynamicParams.
 */
export function generateStaticParams() {
  return [...MOTO_NUOVE, ...MOTO_USATE].map((moto) => ({ id: moto.id }));
}

async function trovaMoto(id: string) {
  const { nuove, usate } = await leggiCatalogo();
  return [...nuove, ...usate].find((m) => m.id === decodeURIComponent(id));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const moto = await trovaMoto(id);
  if (!moto) return { title: `Moto non trovata | ${SITE.brandName}` };

  const titolo = `${moto.brand} ${moto.name} | ${SITE.brandName}`;
  const prezzo = moto.price
    ? ` Da ${moto.price.toLocaleString('it-IT')} euro.`
    : '';
  const descrizione =
    `${moto.brand} ${moto.name} da ${SITE.legalName}, ${SITE.address.city} ` +
    `(${SITE.address.provinceName}).${prezzo} ${moto.tagline}`.slice(0, 300);

  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: `/moto/${moto.id}` },
    openGraph: {
      title: titolo,
      description: descrizione,
      type: 'website',
      locale: 'it_IT',
      url: `/moto/${moto.id}`,
      // La fotografia su strada e' quella che fa fermare lo sguardo quando
      // il collegamento viene incollato in chat. Dove manca si ripiega
      // sulla vista studio, che e' sempre presente.
      images: moto.roadImage ?? moto.image ? [moto.roadImage ?? (moto.image as string)] : undefined,
    },
  };
}

export default async function PaginaSingolaMoto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const moto = await trovaMoto(id);
  if (!moto) notFound();

  /**
   * I dati strutturati, cioe' la scheda che Google legge a macchina.
   *
   * Sono quelli che fanno comparire il prezzo e la disponibilita' sotto al
   * risultato di ricerca, invece della sola riga di testo. Il prezzo si
   * dichiara solo se c'e': dichiararne uno finto o a zero e' peggio che
   * tacerlo, perche' Google se ne accorge e toglie la scheda.
   */
  const datiStrutturati = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${moto.brand} ${moto.name}`,
    brand: { '@type': 'Brand', name: moto.brand },
    description: moto.description,
    category: moto.categoryLabel,
    itemCondition:
      moto.condition === 'usato'
        ? 'https://schema.org/UsedCondition'
        : 'https://schema.org/NewCondition',
    ...(moto.roadImage || moto.image
      ? { image: `${SITE.website}${moto.roadImage ?? moto.image}` }
      : {}),
    ...(moto.price
      ? {
          offers: {
            '@type': 'Offer',
            price: moto.price,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'MotorcycleDealer', name: SITE.legalName },
            url: `${SITE.website}/moto/${moto.id}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datiStrutturati) }}
      />
      <SchedaMoto moto={moto} />
    </>
  );
}
