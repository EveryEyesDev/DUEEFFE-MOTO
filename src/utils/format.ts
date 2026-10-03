/**
 * Formattazione dei numeri per il sito, in stile italiano:
 * punto per le migliaia, virgola per i decimali.
 *
 * Non usiamo Intl perche' l'italiano, per impostazione predefinita, non
 * raggruppa i numeri di quattro cifre: 7190 resterebbe "7190" accanto a
 * "12.990", e in un elenco di prezzi la differenza si nota. Qui il
 * raggruppamento vale sempre, da mille in su.
 */

/** Inserisce il punto ogni tre cifre: 7190 diventa "7.190". */
function raggruppaMigliaia(intero: string): string {
  return intero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Numero con separatore delle migliaia e, se serve, i decimali.
 * `decimali` indica quante cifre tenere al massimo dopo la virgola.
 */
export function formatNumero(valore: number, decimali = 0): string {
  const negativo = valore < 0;
  const assoluto = Math.abs(valore);

  const arrotondato = decimali > 0 ? assoluto.toFixed(decimali) : String(Math.round(assoluto));
  const [intero, parteDecimale] = arrotondato.split('.');

  let risultato = raggruppaMigliaia(intero);

  // Togliamo gli zeri inutili in coda: 24,50 diventa 24,5 e 24,0 diventa 24.
  if (parteDecimale) {
    const ripulita = parteDecimale.replace(/0+$/, '');
    if (ripulita) risultato += `,${ripulita}`;
  }

  return negativo ? `-${risultato}` : risultato;
}

/** Prezzo in euro, arrotondato all'unita': "€ 7.190". */
export const formatEuro = (valore: number): string => `€ ${formatNumero(valore)}`;

/** Chilometraggio: "12.400 km". */
export const formatKm = (valore: number): string => `${formatNumero(valore)} km`;
