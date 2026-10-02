import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dueffe Moto | Concessionaria Ufficiale & Showroom 3D',
  description: 'Concessionaria ufficiale moto d\'eccellenza. Scopri la gamma, configura le moto con visualizzatore interattivo 3D a 360°, prenota test ride e calcola il finanziamento.',
  openGraph: {
    title: 'Dueffe Moto | Concessionaria Ufficiale & Showroom 3D',
    description: 'Concessionaria ufficiale moto d\'eccellenza. Scopri la gamma, configura le moto con visualizzatore interattivo 3D a 360°, prenota test ride e calcola il finanziamento.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070709] text-slate-100 antialiased selection:bg-[#E10600] selection:text-white">
        {children}
      </body>
    </html>
  );
}
