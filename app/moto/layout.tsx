import type { Metadata } from 'next';
import { SITE } from '../../src/config/site';

const TITLE = `Le nostre moto | ${SITE.brandName}`;
const DESCRIPTION = `Catalogo moto nuove e usate di ${SITE.legalName} a ${SITE.address.city} (${SITE.address.provinceName}). ${SITE.brands.join(', ')}. Il parco usato viene aggiornato ogni mese.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Il canonico dice a Google qual e' l'indirizzo buono di questa pagina.
  // Serve perche' il catalogo si apre anche con il filtro nell'indirizzo,
  // /moto?marca=Suzuki: senza, Google vedrebbe quattro pagine quasi uguali
  // e si dividerebbe fra loro il peso che dovrebbe andare tutto a una.
  alternates: { canonical: '/moto' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'it_IT',
    url: '/moto',
  },
};

export default function LayoutMoto({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
