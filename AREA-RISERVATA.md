# Area riservata — come accenderla

L'area riservata è già nel sito, all'indirizzo **`/entra`**. Per farla
funzionare davvero servono due cose: una password, e un posto dove salvare
quello che il responsabile scrive. Sono una ventina di minuti in tutto, da
fare una volta sola.

---

## 1. La password (2 minuti)

Su **Vercel** → il progetto → **Settings** → **Environment Variables**,
aggiungi:

| Nome | Valore |
|---|---|
| `ADMIN_PASSWORD` | la password che decidi tu |

Scegline una lunga, almeno dodici caratteri. È l'unica chiave di casa: chi
la conosce può modificare il catalogo.

Con questa sola variabile l'area si apre già e puoi girare fra i moduli, ma
quello che salvi non viene conservato. Per quello serve il passo 2.

---

## 2. Il posto dove salvare (15 minuti)

### Crea il progetto

1. Vai su **supabase.com** e registrati (basta un'e-mail, nessuna carta).
2. **New project**. Chiamalo `dueffe-moto`, scegli la regione
   **Frankfurt** — è la più vicina, e le pagine si caricano prima.
3. Segnati la password del database che ti fa scegliere: non serve a noi,
   ma serve a te se un domani vorrai entrare da fuori.

### Prepara le tabelle

Nel menù a sinistra apri **SQL Editor**, incolla questo e premi **Run**:

```sql
-- La tabella dove finisce tutto quello che il salone modifica.
-- I dati della moto stanno in un unico campo JSON: la forma della scheda
-- cambia nel tempo (oggi sei viste, domani magari sette) e cosi' non serve
-- toccare la struttura della tabella ogni volta.
create table moto (
  id text primary key,
  dati jsonb not null,
  nascosta boolean not null default false,
  aggiornata timestamptz not null default now()
);

-- Il catalogo e' pubblico: chiunque puo' leggerlo.
-- Scrivere invece lo puo' fare solo il server, con la chiave di servizio,
-- e solo dopo che il responsabile ha fatto l'accesso.
alter table moto enable row level security;

create policy "chiunque puo' leggere" on moto
  for select using (true);

-- Le impostazioni dell'area riservata. Per ora ne contiene una sola: la
-- password scelta dal responsabile, conservata come impronta e non in
-- chiaro, cosi' nemmeno chi legge il database puo' entrare.
create table impostazioni (
  chiave text primary key,
  valore jsonb not null,
  aggiornata timestamptz not null default now()
);

alter table impostazioni enable row level security;
-- Nessuna regola di lettura pubblica: le impostazioni le tocca solo il
-- server, con la chiave di servizio.
```

### Prepara l'archivio delle fotografie

Nel menù a sinistra apri **Storage** → **New bucket**:

- Nome: **`foto-moto`** — scritto esattamente così
- **Public bucket**: acceso (le fotografie delle moto devono vedersi senza
  password, come tutte le altre immagini del sito)

### Copia le tre chiavi

**Settings** → **API**. Trovi tre valori da riportare su Vercel, sempre in
**Settings → Environment Variables**:

| Su Vercel chiamala | Su Supabase si chiama |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` |

> **L'ultima non va data a nessuno.** Quella chiave può scrivere e
> cancellare tutto senza password. Non va incollata in una chat, in
> un'e-mail o dentro il codice: solo fra le variabili di Vercel. Le prime
> due invece sono innocue, finiscono nel browser di chi visita il sito ed è
> giusto così.

### Ripubblica

Su Vercel, **Deployments** → l'ultimo → **Redeploy**. Le variabili nuove
entrano in funzione solo con una pubblicazione nuova.

---

## Come si entra

L'indirizzo è **`iltuosito/entra`** — per adesso
`dueffemoto.vercel.app/entra`. Non c'è nessun collegamento dal sito: ci si
arriva solo scrivendo l'indirizzo, ed è voluto, perché un pulsante
«Area riservata» in fondo alla pagina è un invito a provare password a
chiunque passi.

**Non serve nessuna e-mail.** C'è una password sola, condivisa: la mette
chi gestisce il sito la prima volta, poi il responsabile se la cambia da
solo dalla voce **Password** in alto a destra. Da quel momento vale la
sua, e quella iniziale non funziona più — quindi nemmeno tu potrai
rientrare senza fartela dire, ed è giusto così.

Conviene che la prima password la cambi lui il giorno stesso.

## Come si usa

1. Vai su **`iltuosito/entra`** e metti la password.
2. Vedi tutto il catalogo: **moto usate** in cima, perché sono quelle che
   cambiano ogni mese, poi le **moto nuove**.
3. **Aggiungi** per inserirne una, oppure clicca una moto per modificarla.
4. **Salva**. Il sito è aggiornato subito.

### Cosa si può fare

- aggiungere, modificare ed eliminare moto usate;
- modificare le moto nuove: prezzo, scheda tecnica, fotografie;
- caricare la **fotografia del catalogo** (quella dell'elenco) e le
  **fotografie della scheda** (fronte, retro, i due profili, le due tre
  quarti), per ogni colore;
- **nascondere** una moto senza cancellarla, per rimetterla quando serve.

### Due cose da sapere

**Le moto nuove non si cancellano davvero.** Quelle importate dai siti dei
costruttori vengono *nascoste*: spariscono dal sito ma restano lì, e si
possono rimettere con un clic. Quelle aggiunte a mano invece si eliminano
sul serio.

**Se Supabase non risponde, il sito resta in piedi.** Mostra il catalogo
così com'era all'ultima pubblicazione. Chi cerca una moto trova sempre
qualcosa: le ultime modifiche semplicemente non si vedono finché il
database non torna.

---

## Quanto costa

Niente. Il piano gratuito di Supabase dà 500 MB di database e 1 GB di
fotografie: il catalogo intero pesa poche decine di megabyte, e una moto
usata con sei fotografie sta in due o tre megabyte. C'è spazio per anni.

L'unica attenzione: un progetto Supabase gratuito va in pausa dopo una
settimana senza nessun accesso. Il sito continua a funzionare lo stesso —
mostra il catalogo pubblicato — ma per risvegliarlo basta aprire la
dashboard di Supabase. Aggiornando l'usato ogni mese non succederà mai.
