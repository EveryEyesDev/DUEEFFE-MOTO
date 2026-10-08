/**
 * Rigenera lo stemma Suzuki a colori.
 *
 * PERCHE' ESISTE
 * Il file public/brand/marchi/suzuki.webp era interamente verde scuro:
 * una sola tinta, #246B15, su tutta l'immagine. Non era un problema di
 * CSS - nessun punto del sito applica filtri che possano fare questo - ma
 * del file. Veniva da logo-cliente.png di moto.suzuki.it, che e' la
 * versione monocromatica usata nella pagina "energy saver" del sito
 * Suzuki, non lo stemma del marchio.
 *
 * Il verde e' rimasto in pagina per giorni senza che nessuno lo notasse,
 * ed e' il motivo per cui questo strumento esiste invece di una
 * sostituzione fatta a mano: cosi' si sa da dove viene il file, e
 * rifarlo e' un comando.
 *
 * DA DOVE VIENE IL DISEGNO
 * E' l'SVG che Suzuki Italia pubblica nella propria home, preso tale e
 * quale il 7 ottobre 2026. I colori sono quelli dichiarati nel suo foglio
 * di stile interno, non scelti da noi:
 *
 *     emblema "S"     #df013a
 *     scritta SUZUKI  #003790
 *
 * Il disegno non va ritoccato. Un marchio ridisegnato, anche di poco, si
 * nota e fa sembrare il sito improvvisato.
 *
 * LA MISURA
 * Alta 120 pixel come gli altri due stemmi in public/brand/marchi/, cosi'
 * in fila nella striscia della home risultano della stessa misura senza
 * doverli ritoccare uno per uno. La larghezza viene da se', dalle
 * proporzioni del disegno: 179 pixel.
 *
 * COME SI USA
 *     node strumenti/stemma-suzuki.mjs
 */

import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

/** Altezza comune a tutti gli stemmi, vedi LoghiMarchi.tsx. */
const ALTEZZA = 120;

const DESTINAZIONE = 'public/brand/marchi/suzuki.webp';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 254.98 170.86"><defs><style>.cls-logo-suzuki-1 {fill: #df013a;}.cls-logo-suzuki-2 {fill: #003790;}</style></defs><g><g><rect class="cls-logo-suzuki-2" x="241.24" y="132.31" width="13.75" height="37.13"></rect><polygon class="cls-logo-suzuki-2" points="218.92 169.44 204.63 155.85 204.63 169.44 190.87 169.44 190.87 132.31 204.63 132.31 204.63 145.5 220 132.31 238.02 132.31 216.85 150.39 237.38 169.44 218.92 169.44"></polygon><path class="cls-logo-suzuki-2" d="M164.79,170.86c-18.92,0-21.19-7.9-21.25-13.84-.03-3.3-.07-9.4-.07-11.25v-13.47h13.17v21.46c0,5.46,2.52,7.89,8.16,7.89s8.16-2.43,8.16-7.89v-21.46h13.17v13.47c0,1.82-.04,7.91-.07,11.25-.06,5.94-2.33,13.84-21.26,13.84Z"></path><polygon class="cls-logo-suzuki-2" points="95.65 169.44 95.65 161.75 117.43 141.42 96.38 141.42 96.38 132.31 138.86 132.31 138.86 140 116.79 160.29 138.79 160.29 138.79 169.44 95.65 169.44"></polygon><path class="cls-logo-suzuki-2" d="M70.45,170.86c-18.93,0-21.2-7.9-21.26-13.84-.03-3.29-.07-9.38-.07-11.25v-13.47h13.17v21.46c0,5.46,2.52,7.89,8.16,7.89s8.16-2.43,8.16-7.89v-21.46h13.17v13.47c0,1.87-.04,7.96-.07,11.25-.06,5.94-2.33,13.84-21.26,13.84Z"></path><path class="cls-logo-suzuki-2" d="M23.79,170.34c-19.69,0-23.14-6.03-23.79-12.61h16.66c1.51,4.4,5.96,4.4,7.43,4.4,1.78,0,5.88-.31,5.88-3.17,0-2.5-2.79-2.77-7.02-3.18-.55-.05-1.13-.11-1.74-.17-13.55-1.42-20.42-3.69-20.42-12.14,0-3.68,2.02-12.25,20.74-12.25h.17c14.32.04,22.59,4.51,22.73,12.28h-15.31c-1.03-3.68-5.12-4.24-7.48-4.24-.91,0-4,.11-5.34,1.55-.46.49-.67,1.09-.63,1.78.12,2.02,3.96,2.46,8.82,3.01,1,.11,2.04.23,3.11.37,12.17,1.56,18.09,5.53,18.09,12.16,0,2.85-1.56,12.16-21.62,12.22h-.29Z"></path></g><path class="cls-logo-suzuki-1" d="M114.93,25.22l24.14,16.22c5,3.36,10.12,6.64,18.94,6.64,13.73,0,25.97-9.99,25.97-9.99L127.29,0s-6.19,6.81-25.6,18.9c-20.39,12.7-31.07,16.39-31.07,16.39l73.17,49.21-4.81,3.15-23.47-15.77c-4.98-3.34-10.12-6.64-18.94-6.64-13.73,0-25.94,10.01-25.94,10.01l56.7,38.1s6.19-6.81,25.6-18.9c20.38-12.7,31.07-16.39,31.07-16.39L110.13,28.37l4.8-3.16Z"></path></g></svg>`;

const immagine = sharp(Buffer.from(SVG), { density: 600 })
  .resize({ height: ALTEZZA, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

const dati = await immagine.webp({ quality: 95, effort: 6 }).toBuffer();
await writeFile(DESTINAZIONE, dati);

const { width, height } = await sharp(dati).metadata();
console.log(`Scritto ${DESTINAZIONE} — ${width}x${height}`);
