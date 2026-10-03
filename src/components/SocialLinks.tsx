'use client';

import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { SITE } from '../config/site';

/** I profili attivi, nell'ordine in cui vanno mostrati. */
const PROFILI = [
  { chiave: 'instagram', url: SITE.social.instagram, nome: 'Instagram', icona: Instagram },
  { chiave: 'facebook', url: SITE.social.facebook, nome: 'Facebook', icona: Facebook },
  { chiave: 'youtube', url: SITE.social.youtube, nome: 'YouTube', icona: Youtube },
].filter((p) => p.url);

interface SocialLinksProps {
  /**
   * `pill`  pulsanti con il nome scritto, per quando vanno notati
   * `icon`  solo le icone, per gli spazi stretti come il footer
   */
  variante?: 'pill' | 'icon';
  /** Riga sopra i pulsanti. Metti null per non mostrarla. */
  invito?: string | null;
  className?: string;
  /** Allinea al centro invece che a sinistra. */
  centrato?: boolean;
}

/**
 * Collegamenti ai profili social.
 *
 * I profili senza indirizzo in `site.ts` non vengono mostrati, e se non ce
 * n'e' nessuno il componente sparisce del tutto invece di lasciare un vuoto.
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({
  variante = 'pill',
  invito = 'Ci trovi anche qui',
  className = '',
  centrato = false,
}) => {
  if (PROFILI.length === 0) return null;

  const allineamento = centrato ? 'items-center text-center' : 'items-start';

  return (
    <div className={`flex flex-col gap-2.5 ${allineamento} ${className}`}>
      {invito && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {invito}
        </span>
      )}

      <div className={`flex flex-wrap gap-2 ${centrato ? 'justify-center' : ''}`}>
        {PROFILI.map((p) => {
          const Icona = p.icona;

          if (variante === 'icon') {
            return (
              <a
                key={p.chiave}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Seguici su ${p.nome}`}
                className="p-2 rounded-lg bg-white/5 text-slate-300 hover:bg-[#D00020] hover:text-white transition-colors"
              >
                <Icona className="w-4 h-4" />
              </a>
            );
          }

          return (
            <a
              key={p.chiave}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-200 bg-white/5 hover:bg-[#D00020] hover:text-white border border-white/10 hover:border-[#D00020] rounded-xl transition-colors"
            >
              <Icona className="w-4 h-4" />
              <span>{p.nome}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
