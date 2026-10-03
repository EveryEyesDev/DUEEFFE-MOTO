import type { Metadata } from 'next';
import { SITE } from '../../src/config/site';

const TITLE = `Le nostre moto | ${SITE.brandName}`;
const DESCRIPTION = `Catalogo moto nuove e usate di ${SITE.legalName} a ${SITE.address.city} (${SITE.address.provinceName}). ${SITE.brands.join(', ')}. Il parco usato viene aggiornato ogni mese.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', locale: 'it_IT' },
};

export default function LayoutMoto({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
