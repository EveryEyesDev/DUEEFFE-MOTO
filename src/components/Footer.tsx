import React from 'react';
import { DueffeLogo } from './DueffeLogo';
import { Phone, Mail, MapPin, Instagram, Youtube, Facebook, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050507] border-t border-white/10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <DueffeLogo size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Concessionaria Ufficiale e Reparto Corse d'eccellenza. Vendita moto nuove e usate garantite,
              configuratore 3D in tempo reale, officina certificata e ricambi originali.
            </p>
            <div className="flex items-center gap-3 text-slate-300">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-[#E10600] hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-[#E10600] hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-[#E10600] hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Gamma Moto 2026
            </h4>
            <ul className="space-y-2">
              <li><a href="#gamma" className="hover:text-white transition-colors">Dueffe Corse V4R (SuperSport)</a></li>
              <li><a href="#gamma" className="hover:text-white transition-colors">Dueffe Diablo 1200 (HyperNaked)</a></li>
              <li><a href="#gamma" className="hover:text-white transition-colors">Dueffe Overland 950 Rally (Adventure)</a></li>
              <li><a href="#gamma" className="hover:text-white transition-colors">Dueffe Nero 1260 (Power Cruiser)</a></li>
              <li><a href="#gamma" className="hover:text-white transition-colors">Dueffe Heritage 800 (Café Racer)</a></li>
            </ul>
          </div>

          {/* Col 3: Services & Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Servizi Concessionaria
            </h4>
            <ul className="space-y-2">
              <li><a href="#visualizzatore-3d" className="hover:text-white transition-colors">Showroom 3D a 360°</a></li>
              <li><a href="#finanziamento" className="hover:text-white transition-colors">Calcolatore Rata Finanziamento</a></li>
              <li><a href="#officina" className="hover:text-white transition-colors">Banco Prova Dyno & Centraline</a></li>
              <li><a href="#officina" className="hover:text-white transition-colors">Tagliandi & Manutenzione Ufficiale</a></li>
              <li><a href="#officina" className="hover:text-white transition-colors">Ricambi & Accessori Racing</a></li>
            </ul>
          </div>

          {/* Col 4: Contacts & Official Headquarter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Sede & Contatti Ufficiali
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <span>Via Aurelia Km 14.500, Roma (RM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E10600] shrink-0" />
                <span className="font-mono text-white">06.8994512</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E10600] shrink-0" />
                <span>info@dueffemoto.it</span>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[#E10600] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Concessionaria Certificata ISO 9001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Tech architecture */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Dueffe Moto S.r.l. · P.IVA 14892011004 · Tutti i diritti riservati.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Architettura: React 19 + Three.js 3D Engine · Pronto per API Laravel</span>
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
