import React from 'react';
import { redirect } from 'next/navigation';
import { haFattoAccesso, accessoConfigurato } from '../../src/lib/accesso';

/**
 * Il recinto dell'area riservata.
 *
 * Tutto quello che sta sotto /admin passa di qui, e chi non ha fatto
 * l'accesso finisce alla pagina di entrata, che sta apposta fuori da
 * /admin: se stesse dentro, il recinto rimanderebbe a se stesso
 * all'infinito e bisognerebbe ritagliare un'eccezione. Senza eccezioni non
 * esiste il rischio di aggiungere domani una pagina qui dentro e
 * dimenticarsi di proteggerla: nasce protetta.
 */
export const dynamic = 'force-dynamic';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  if (!accessoConfigurato) {
    return (
      <main className="min-h-screen bg-[#070709] text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-bold uppercase tracking-wider">Area riservata non attiva</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Manca la password. Va impostata una volta sola fra le variabili del sito, con il
            nome <code className="text-[#D00020]">ADMIN_PASSWORD</code>.
          </p>
        </div>
      </main>
    );
  }

  if (!(await haFattoAccesso())) {
    redirect('/entra');
  }

  return <>{children}</>;
}
