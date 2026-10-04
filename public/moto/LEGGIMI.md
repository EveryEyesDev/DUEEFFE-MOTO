# Fotografie delle moto

## Cosa serve, in breve

**Cinque fotografie per modello**, sempre le stesse cinque:

| File | Cosa inquadra |
| --- | --- |
| `fronte.jpg` | La moto vista davanti, in asse |
| `retro.jpg` | La moto vista da dietro, in asse |
| `lato-sinistro.jpg` | Profilo sinistro, moto perfettamente di lato |
| `lato-destro.jpg` | Profilo destro, moto perfettamente di lato |
| `in-strada.jpg` | La moto in ambiente: strada, sterrato, panorama |

Le prime quattro su **fondo chiaro e uniforme**, meglio se bianco.
L'ultima è quella che fa innamorare: moto intera, ambiente riconoscibile,
luce bella.

---

## I sei modelli e le loro cartelle

```
public/moto/
├── x-cape-700/
├── x-cape-1200/
├── alltrhike-450/
├── seiemmezzo-str/
├── calibro-custom/
└── calibro-bagger/
```

Trenta fotografie in tutto, cinque per cartella.

---

## Cosa c'è già e cosa manca davvero

Per **tutti e sei** i modelli abbiamo già, prese dal sito ufficiale:

- il **profilo sinistro** su fondo bianco
- una **fotografia su strada**

Quindi, se vuoi fare il minimo indispensabile, mancano **tre viste per
modello**, diciotto fotografie in tutto:

- `fronte.jpg`
- `retro.jpg`
- `lato-destro.jpg`

Se però il kit stampa ti dà tutte e cinque le viste nello stesso stile,
**mandale tutte**: una galleria dove le cinque foto hanno la stessa luce e
lo stesso fondo rende molto meglio di una dove quattro vengono da una
fonte e una da un'altra.

---

## Come mandarmele

Il modo più semplice: una cartella sola, tutte le foto dentro, con il nome
che dica modello e vista. Per esempio:

```
x-cape-700-fronte.jpg
x-cape-700-retro.jpg
x-cape-1200-lato-destro.jpg
calibro-bagger-in-strada.jpg
```

Al resto penso io: ridimensionamento, conversione in WebP, compressione,
nomi definitivi e collegamento alle schede del sito.

In alternativa, se ti viene comodo, crea direttamente le sei sottocartelle
con i nomi qui sopra e metti dentro i cinque file già nominati.

---

## Requisiti tecnici

**Dimensione**: lato lungo da 1600 pixel in su. Se sono più grandi le
riduco io, non sprecare tempo a ritoccarle.

**Formato**: JPG o PNG vanno benissimo. Converto io in WebP.

**Cosa evitare**: ritagli tondi o sagomati, scritte e loghi sovrapposti,
moto tagliata ai bordi, accessori aftermarket se la moto a listino non li
ha. Niente immagini prese dal web o da schede Google: appartengono a chi
le ha scattate.

---

## Dove prenderle

**Area dealer e kit stampa ufficiali.** È la via giusta e non costa
niente: le case madri mettono a disposizione dei concessionari fotografie
professionali, in alta risoluzione, fatte apposta per questo uso. I kit
contengono quasi sempre più angolazioni di quelle pubblicate sul sito
pubblico. Una telefonata al referente di zona.

**Fotografie vostre**, per le moto che avete fisicamente in salone. Vanno
bene anche col telefono: moto pulita, fondo uniforme, luce diffusa senza
sole diretto, moto che riempie l'inquadratura, stessa altezza di ripresa
per tutte e quattro le viste.

---

## Come si collegano al sito

Quando le foto sono nelle cartelle, in `src/data/motorcycles.ts` ogni
modello punta alle sue immagini:

```ts
image: '/moto/x-cape-700/lato-sinistro.webp',
gallery: [
  '/moto/x-cape-700/lato-sinistro.webp',
  '/moto/x-cape-700/lato-destro.webp',
  '/moto/x-cape-700/fronte.webp',
  '/moto/x-cape-700/retro.webp',
  '/moto/x-cape-700/in-strada.webp',
],
```

`image` è la foto che compare nella scheda del catalogo e nello showcase a
tutto schermo: deve essere un profilo, è la più leggibile.
`gallery` è l'elenco sfogliabile nel dettaglio, con le miniature sotto.

Dove manca la fotografia il sito non lascia un buco: mostra un riquadro
che dice che le immagini sono in arrivo e invita a passare in salone.
