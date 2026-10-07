import type { MetadataRoute } from 'next';
import { SITE } from '../src/config/site';

/**
 * La mappa del sito per i motori di ricerca.
 *
 * Le pagine sono tre, e sono tutte. Le schede delle singole moto non
 * compaiono perche' non sono pagine: si aprono dentro al catalogo, senza
 * un indirizzo proprio. E' una cosa che prima o poi conviene cambiare -
 * una pagina per moto si farebbe trovare da chi cerca il nome del modello,
 * ed e' il modo in cui la gente cerca davvero - ma finche' non c'e', qui
 * non si mette un indirizzo che non esiste.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const adesso = new Date();
  return [
    { url: SITE.website, lastModified: adesso, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.website}/moto`, lastModified: adesso, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.website}/privacy`, lastModified: adesso, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
