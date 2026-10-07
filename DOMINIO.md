# Portare dueeffemoto.it sul sito nuovo

Guida da seguire col pannello Aruba aperto. Serve una ventina di minuti,
piu' il tempo che il cambio si propaghi.

---

## Prima di cominciare: due cose da sapere

### Sull'indirizzo c'e' gia' un sito, e non e' questo

Oggi `www.dueeffemoto.it` risponde e mostra un sito fatto in Joomla da
Studio SELT & Associati. Nel titolo c'e' scritto:

> Concessionaria Piaggio, Vespa, Moto Guzzi, Aprilia, scarabeo, Derbi

Sono marchi **diversi** da quelli del sito nuovo, che parla di Moto
Morini, Voge e Suzuki.

Appena si sposta il DNS, quel sito **sparisce dall'indirizzo**. Non viene
cancellato — i file restano dove sono, sul server Aruba — ma chi scrive
dueeffemoto.it vede il nostro.

Due domande da sciogliere prima, non dopo:

1. Quei marchi si trattano ancora? Se si', nel catalogo nuovo mancano del
   tutto, ed e' meglio aggiungerli prima di sostituire il sito.
2. C'e' qualcosa da salvare dal vecchio? Pagine, testi, fotografie del
   salone, recensioni. Una volta spostato il DNS il sito non si raggiunge
   piu' dall'indirizzo pubblico, e per recuperare roba bisogna entrare nel
   pannello Aruba.

### La posta non si tocca

Le mail di `info@dueeffemoto.it` passano da Aruba: il record MX punta a
`mx.dueeffemoto.it`, che risponde sui server di posta Aruba.

Nel pannello DNS **non si toccano**:

- il record **MX**
- il record **A** del nome `mx`
- eventuali record **TXT** che cominciano con `v=spf1` o che si chiamano
  `_dmarc` o `default._domainkey`

Cambiano solo il record del dominio nudo e quello di `www`. Se per sbaglio
si cancella un MX, la posta smette di arrivare e chi scrive al salone si
prende un errore: e' l'unico errore davvero costoso di questa procedura.

---

## 1. Dire a Vercel qual e' il dominio

1. Vercel, il progetto, **Settings** -> **Domains**.
2. **Add**, scrivi `dueeffemoto.it`, conferma.
3. Vercel chiede se vuoi che `dueeffemoto.it` rimandi a
   `www.dueeffemoto.it` o il contrario. Scegli **www come principale**:
   oggi il vecchio sito manda gia' tutti su www, quindi i collegamenti che
   girano in rete e quello che Google ha in archivio puntano li'.
4. Aggiungi anche `www.dueeffemoto.it`.

Vercel mostra ora i valori da copiare, con accanto una spia rossa
"Invalid Configuration" finche' il DNS non e' a posto. **Usa i valori che
vedi nel pannello**, non quelli scritti qui: sono questi da anni, ma se un
giorno cambiassero il pannello avrebbe ragione lui.

Di solito sono:

| Nome | Tipo | Valore |
|---|---|---|
| `@` (il dominio nudo) | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

---

## 2. Cambiare i record su Aruba

Pannello Aruba -> **Gestione DNS e Email** del dominio -> **Gestione
record DNS**.

**Il record A del dominio.** Cerca la riga con nome vuoto o `@`, tipo
**A**, che oggi vale `89.46.105.58`. Modificala mettendo il valore che ti
ha dato Vercel. Non aggiungerne una seconda: ne deve restare una sola.

**Il record di www.** Cerca la riga `www`. Oggi e' un **A** verso lo
stesso indirizzo. Va sostituita con un **CNAME** verso
`cname.vercel-dns.com`. Su Aruba spesso bisogna cancellare la riga A e poi
crearne una CNAME: un nome non puo' avere tutti e due.

**Il resto si lascia dov'e'.** MX, `mx`, SPF, DKIM, DMARC: non si toccano.

Se Aruba chiede il TTL, metti il valore piu' basso che offre (3600, cioe'
un'ora). Si puo' rialzare dopo.

---

## 3. Aspettare, e controllare

Il cambio non e' istantaneo: i server DNS in giro per il mondo tengono in
memoria la risposta vecchia finche' non scade. In genere bastano una o due
ore, a volte serve mezza giornata.

Per vedere a che punto siamo, da terminale:

```bash
nslookup www.dueeffemoto.it
```

Finche' risponde `89.46.105.58` sei ancora sul vecchio. Quando cambia, su
Vercel la spia diventa verde e il certificato HTTPS viene emesso da solo,
nel giro di qualche minuto.

**Da provare appena e' verde:**

- `https://dueeffemoto.it` porta a `https://www.dueeffemoto.it`
- il lucchetto del certificato c'e' e non da' avvisi
- manda una mail di prova a `info@dueeffemoto.it` e controlla che arrivi

---

## 4. Dopo il passaggio

**Il sito deve sapere come si chiama.** In `src/config/site.ts` il campo
`website` dice gia' `https://www.dueeffemoto.it`: da li' nascono la mappa
del sito, i collegamenti canonici e le anteprime sui social. Se si sceglie
il dominio nudo invece di www, va cambiato li' e ripubblicato.

**Google Search Console.** Registra la proprieta' e manda
`https://www.dueeffemoto.it/sitemap.xml`. E' il modo piu' rapido per farsi
riguardare: senza, Google ci mette settimane ad accorgersi che il sito e'
cambiato.

**La scheda Google dell'attivita'.** Va aggiornato l'indirizzo del sito,
se punta a qualcosa d'altro. E' la prima cosa che vede chi cerca il nome
del salone.

**Il vecchio sito.** Finche' l'abbonamento Aruba e' attivo resta
raggiungibile dal pannello. Prima di disdire, scarica una copia: i testi e
le fotografie potrebbero servire.
