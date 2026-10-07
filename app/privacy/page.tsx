import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE } from '../../src/config/site';
import { DueffeLogo } from '../../src/components/DueffeLogo';

/**
 * Informativa privacy e cookie.
 *
 * SCRITTA SU QUELLO CHE IL SITO FA DAVVERO
 * Non e' un modello copiato: ogni paragrafo corrisponde a una cosa che
 * succede in questo sito, e se il sito cambia va cambiata anche questa
 * pagina. Le informative generiche elencano analitiche, profilazione e
 * moduli di contatto che qui non esistono, e dire di raccogliere dati che
 * non si raccolgono e' sbagliato quanto tacere quelli veri.
 *
 * IL PUNTO SCOPERTO, DETTO COM'E'
 * La mappa dei contatti e' quella di Google, e si carica da sola con la
 * pagina: Google riceve l'indirizzo IP di chi visita e gli mette dei
 * cookie suoi, prima che la persona abbia detto alcunche'. Quelli non sono
 * cookie tecnici, e per i non tecnici la legge vuole il consenso prima.
 *
 * Il sito la fascia del consenso non ce l'ha. E' una scelta del salone,
 * non una svista, e qui sotto e' scritta apertamente: chi legge deve
 * sapere che aprendo la pagina dei contatti Google lo vede. Tacerlo
 * sarebbe la cosa peggiore - una pagina che dichiara un cookie solo
 * mentre il sito ne fa mettere altri non e' un'informativa, e' una bugia.
 *
 * Vedi src/components/MappaSede.tsx per le tre strade che chiudono il
 * punto. Quando se ne prendera' una, questa pagina va riscritta.
 *
 * DA FAR CONTROLLARE
 * E' scritta con attenzione ma non da un avvocato. Prima di considerarla
 * definitiva va fatta leggere a chi segue la societa'.
 */

const AGGIORNATA = '7 ottobre 2026';

export const metadata: Metadata = {
  title: `Privacy e cookie | ${SITE.brandName}`,
  description: `Come ${SITE.legalName} tratta i dati di chi visita il sito: cosa raccoglie, perche', per quanto, e i diritti di chi naviga.`,
  robots: { index: true, follow: true },
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#070709] text-slate-300">
      <header className="border-b border-white/10 bg-[#050507]">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link href="/" aria-label={`Torna alla home di ${SITE.brandName}`}>
            <DueffeLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Torna al sito
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display uppercase tracking-tight text-white">
          Privacy e cookie
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Ultimo aggiornamento: {AGGIORNATA}
        </p>

        <p className="mt-8 text-sm leading-relaxed">
          Questo sito &egrave; una vetrina: mostra le moto che trattiamo e dice come
          raggiungerci. Non ha moduli da compilare, non ha un&rsquo;area clienti e non
          misura chi lo visita. Di conseguenza i dati che raccoglie sono pochi, e qui
          sotto ci sono tutti.
        </p>

        <Sezione titolo="Chi tratta i dati">
          <p>
            Il titolare del trattamento &egrave; <strong className="text-white">{SITE.legalName}</strong>,
            {' '}{SITE.address.full}, P.IVA {SITE.legal.vatNumber}.
          </p>
          <p className="mt-3">
            Per qualsiasi cosa riguardi i tuoi dati scrivi a{' '}
            <a href={`mailto:${SITE.email}`} className="text-white underline hover:no-underline">
              {SITE.email}
            </a>{' '}
            oppure chiama il{' '}
            <a href={SITE.phone.href} className="text-white underline hover:no-underline">
              {SITE.phone.display}
            </a>.
          </p>
        </Sezione>

        <Sezione titolo="Cosa raccoglie il sito">
          <p>
            <strong className="text-white">I dati di navigazione.</strong> Come ogni sito,
            il server registra per ogni pagina aperta l&rsquo;indirizzo IP di chi la chiede,
            la data e l&rsquo;ora, la pagina richiesta e il tipo di browser. Servono a far
            funzionare il sito e ad accorgersi di attacchi o guasti: &egrave; un nostro
            legittimo interesse (art. 6.1.f del Regolamento). Non li usiamo per
            riconoscere le persone e non li incrociamo con altro. Li conserva il
            fornitore dell&rsquo;hosting per il tempo tecnico necessario, nell&rsquo;ordine di
            qualche settimana.
          </p>
          <p className="mt-3">
            <strong className="text-white">Nient&rsquo;altro.</strong> Non ci sono moduli di
            contatto, non c&rsquo;&egrave; iscrizione a newsletter, non c&rsquo;&egrave;
            Google Analytics n&eacute; alcun altro strumento di misurazione o di
            pubblicit&agrave;. Se ci scrivi per e-mail o ci chiami, quei dati li trattiamo
            per risponderti, come faremmo se entrassi in salone.
          </p>
        </Sezione>

        <Sezione titolo="Cookie" id="cookie">
          <p>
            Il sito usa <strong className="text-white">un solo cookie</strong>, e la maggior
            parte delle persone non lo riceve mai.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border border-white/10 rounded-lg">
              <thead className="bg-white/[0.04] text-slate-400">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Nome</th>
                  <th className="text-left font-semibold px-3 py-2">A cosa serve</th>
                  <th className="text-left font-semibold px-3 py-2">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
                  <td className="px-3 py-2 font-mono text-slate-200">dueffe-accesso</td>
                  <td className="px-3 py-2">
                    Tiene l&rsquo;accesso di chi gestisce il catalogo dall&rsquo;area
                    riservata. Lo riceve solo chi fa quell&rsquo;accesso: chi visita il
                    sito per guardare le moto non lo vede mai.
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">7 giorni</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            &Egrave; un cookie tecnico: senza non si potrebbe restare dentro all&rsquo;area
            riservata. Per i cookie tecnici la legge non chiede il consenso.
          </p>
          <p className="mt-3">
            <strong className="text-white">
              La mappa di Google, invece, dei cookie te li mette.
            </strong>{' '}
            Nella pagina dei contatti c&rsquo;&egrave; la mappa della sede, ed &egrave; un
            pezzo di sito di Google dentro al nostro. Si carica insieme alla pagina: da
            quel momento Google conosce il tuo indirizzo IP e pu&ograve; scrivere sul tuo
            browser dei cookie suoi, su cui noi non abbiamo voce. Succede anche se la mappa
            non la guardi. Per sapere cosa ci fa, vale l&rsquo;informativa di Google.
          </p>
          <p className="mt-3">
            Se non li vuoi, puoi bloccare i cookie di terze parti dalle impostazioni del
            browser: la mappa smetter&agrave; di funzionare, il resto del sito no.
          </p>
          <p className="mt-3">
            I collegamenti ai social e alle indicazioni stradali sono normali collegamenti:
            finch&eacute; non ci clicchi, quei siti non sanno che sei passato di qui.
          </p>
        </Sezione>

        <Sezione titolo="Chi altro vede i dati">
          <p>
            Nessuno a cui non servano per far funzionare il sito. I fornitori che
            trattano dati per nostro conto sono:
          </p>
          <ul className="mt-3 space-y-2 list-disc pl-5">
            <li>
              <strong className="text-white">Vercel</strong>, che ospita il sito e tiene i
              registri di cui sopra.
            </li>
            <li>
              <strong className="text-white">Supabase</strong>, dove sono conservati i dati
              delle moto. Contiene schede e fotografie di motociclette, non dati di chi
              visita il sito.
            </li>
            <li>
              <strong className="text-white">Google</strong>, che serve la mappa nella
              pagina dei contatti.
            </li>
          </ul>
          <p className="mt-3">
            Alcuni di questi fornitori sono societ&agrave; statunitensi e possono trattare i
            dati anche fuori dall&rsquo;Unione Europea. Avviene sulla base delle garanzie
            previste dal Regolamento, cio&egrave; clausole contrattuali standard o la
            decisione di adeguatezza per gli Stati Uniti.
          </p>
          <p className="mt-3">
            Non vendiamo i dati e non li diamo a nessuno per farci pubblicit&agrave;.
          </p>
        </Sezione>

        <Sezione titolo="I tuoi diritti">
          <p>
            Puoi chiedere quali dati abbiamo su di te, farli correggere o cancellare,
            chiederne la limitazione, opporti al trattamento e chiederne una copia in
            formato leggibile (artt. 15&ndash;22 del Regolamento). Basta scrivere a{' '}
            <a href={`mailto:${SITE.email}`} className="text-white underline hover:no-underline">
              {SITE.email}
            </a>
            : rispondiamo entro un mese.
          </p>
          <p className="mt-3">
            Se pensi che qualcosa non vada puoi rivolgerti al{' '}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:no-underline"
            >
              Garante per la protezione dei dati personali
            </a>
            .
          </p>
        </Sezione>

        <Sezione titolo="Se questa pagina cambia">
          <p>
            Se cambiamo il sito in modo che tratti dati diversi &ndash; per esempio
            aggiungendo un modulo di contatto &ndash; aggiorniamo questa pagina e la data
            in cima. Vale sempre la versione che leggi qui.
          </p>
        </Sezione>
      </article>
    </main>
  );
}

const Sezione: React.FC<{ titolo: string; id?: string; children: React.ReactNode }> = ({
  titolo,
  id,
  children,
}) => (
  <section id={id} className="mt-10 scroll-mt-24">
    <h2 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-3">
      {titolo}
    </h2>
    <div className="text-sm leading-relaxed">{children}</div>
  </section>
);
