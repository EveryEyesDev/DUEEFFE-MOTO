import type { MetadataRoute } from 'next';
import { SITE } from '../src/config/site';
import { MOTO_NUOVE, MOTO_USATE } from '../src/data/motorcycles';

/**
 * La mappa del sito per i motori di ricerca.
 *
 * Ci sono le tre pagine fisse e una riga per ogni moto a catalogo. Le
 * schede delle moto contano piu' delle altre messe insieme: la gente
 * cerca "Suzuki GSX-8S", non "concessionaria a Cavallino", e sono quelle
 * pagine a poter rispondere.
 *
 * L'elenco si legge dal catalogo scritto nel codice e non dal database,
 * perche' questo file viene calcolato anche in fase di pubblicazione: se
 * Supabase non rispondesse, la mappa non deve uscire vuota.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const adesso = new Date();
  return [
    { url: SITE.website, lastModified: adesso, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.website}/moto`, lastModified: adesso, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.website}/privacy`, lastModified: adesso, changeFrequency: 'yearly', priority: 0.2 },
    ...[...MOTO_NUOVE, ...MOTO_USATE].map((moto) => ({
      url: `${SITE.website}/moto/${encodeURIComponent(moto.id)}`,
      lastModified: adesso,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
