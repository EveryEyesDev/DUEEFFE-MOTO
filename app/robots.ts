import type { MetadataRoute } from 'next';
import { SITE } from '../src/config/site';

/**
 * Le regole per i motori di ricerca.
 *
 * L'area riservata e la pagina di accesso restano fuori dall'indice. Non
 * e' una misura di sicurezza - chi vuole entrare non passa certo da
 * Google - ma due pagine che non servono a nessun cliente: se finissero
 * nei risultati, chi cerca "dueffe moto" si troverebbe davanti una casella
 * per la password. Fuori anche le API, che non sono pagine.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/entra', '/api/'],
    },
    sitemap: `${SITE.website}/sitemap.xml`,
  };
}
