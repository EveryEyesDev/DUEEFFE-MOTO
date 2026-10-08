import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE } from '../src/config/site';
import { IntroOverlay } from '../src/components/IntroOverlay';

const TITLE = `${SITE.brandName} | Concessionaria e officina moto a ${SITE.address.city} (${SITE.address.provinceName})`;
const DESCRIPTION = `${SITE.legalName}: concessionaria ${SITE.primaryBrands.join(', ')} a ${SITE.address.city}, ${SITE.address.provinceName}. Vendita moto, officina e assistenza. ${SITE.address.street}. Tel. ${SITE.phone.display}.`;

export const metadata: Metadata = {
  // L'indirizzo di casa del sito. Senza, Next scrive i collegamenti per i
  // social in forma relativa, e WhatsApp o Facebook non sanno da dove
  // prendere l'immagine dell'anteprima: il collegamento condiviso esce
  // nudo, senza titolo ne' figura.
  metadataBase: new URL(SITE.website),
  alternates: { canonical: '/' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'it_IT',
    siteName: SITE.brandName,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#070709',
};

/** Dati strutturati per i motori di ricerca: scheda attivita' locale. */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MotorcycleDealer',
  name: SITE.legalName,
  alternateName: SITE.brandName,
  telephone: SITE.phone.display.replace(/\s/g, ''),
  vatID: `IT${SITE.legal.vatNumber}`,
  brand: SITE.brands.map((name) => ({ '@type': 'Brand', name })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    postalCode: SITE.address.postalCode,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.province,
    addressCountry: SITE.address.country,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="bg-[#070709] text-slate-100 antialiased selection:bg-[#D00020] selection:text-white">
        <IntroOverlay />
        {children}
      </body>
    </html>
  );
}
