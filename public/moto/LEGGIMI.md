# Fotografie delle moto

Qui dentro vanno le immagini dei modelli. Una cartella per moto, già pronte.

```
public/moto/
├── x-cape-700/
│   ├── scheda-principale.jpg      <- la foto grande, la prima che si vede
│   ├── tre-quarti-anteriore.jpg
│   ├── tre-quarti-posteriore.jpg
│   └── frontale.jpg
├── x-cape-1200/
├── alltrhike/
├── seiemmezzo-str/
├── calibro-cruiser/
└── calibro-bagger/
```

---

## Quante ne servono

Da **quattro a sei per moto** bastano e avanzano. Le più utili, in ordine:

1. **Profilo laterale** destro, la più leggibile di tutte
2. **Tre quarti anteriore**, quella che fa innamorare
3. **Tre quarti posteriore**
4. **Frontale**
5. Un dettaglio del cruscotto, se la moto ne ha uno bello
6. La sella, utile a chi è basso di statura

---

## Da dove prenderle

**Kit stampa ufficiale.** È la via più semplice e non costa niente. Come
concessionari avete accesso all'area dealer delle case madri: le immagini sono
professionali, in alta risoluzione e fatte apposta perché voi le usiate.
Una telefonata al referente di zona e arrivano.

**Fotografie vostre.** Vanno benissimo anche col telefono. Moto pulita, fondo
uniforme, luce diffusa senza sole diretto, e la moto che riempie bene
l'inquadratura.

**Non dal web e non da Google Maps.** Quelle immagini appartengono a chi le ha
fatte e non si possono riutilizzare su un sito commerciale.

---

## Come collegarle al sito

Metti i file nella cartella del modello, poi apri `src/data/motorcycles.ts`,
trova la moto e scrivi:

```ts
image: '/moto/x-cape-700/scheda-principale.jpg',
gallery: [
  '/moto/x-cape-700/scheda-principale.jpg',
  '/moto/x-cape-700/tre-quarti-anteriore.jpg',
  '/moto/x-cape-700/tre-quarti-posteriore.jpg',
  '/moto/x-cape-700/frontale.jpg',
],
```

`image` è la foto che compare nella scheda del catalogo.
`gallery` è l'elenco sfogliabile nel dettaglio, con le miniature sotto.
Se metti solo `image`, la galleria mostra quella.

---

## Dimensioni

Lato lungo intorno ai **1600 pixel** va benissimo. Più grandi rallentano solo
il caricamento senza che si veda la differenza. Se le tue sono più grandi,
dimmelo e le riduco io.

Dove manca la fotografia il sito non lascia un buco: mostra un riquadro che
dice che le immagini sono in arrivo e invita a passare in salone.
