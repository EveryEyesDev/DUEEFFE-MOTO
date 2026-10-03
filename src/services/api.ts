/**
 * Client API di DUEFFE MOTO.
 *
 * Oggi il sito e' statico e non esiste ancora un backend: queste funzioni
 * ricadono sui dati locali o restituiscono un esito simulato.
 * Quando il backend sara' pronto bastera' far puntare le fetch agli endpoint veri.
 */

import { Motorcycle, ContactRequest } from '../types';
import { MOTORCYCLES } from '../data/motorcycles';

export const DueffeApiService = {
  /** Elenco moto: dal backend se disponibile, altrimenti dal catalogo locale. */
  async getMotorcycles(): Promise<Motorcycle[]> {
    try {
      const res = await fetch('/api/motorcycles');
      if (!res.ok) throw new Error('Backend non disponibile');
      return await res.json();
    } catch {
      return MOTORCYCLES;
    }
  },

  /**
   * Invio di una richiesta di contatto.
   *
   * ATTENZIONE: senza backend la richiesta NON viene recapitata a nessuno.
   * Il valore `delivered` dice se e' stata davvero inviata, cosi' l'interfaccia
   * non puo' promettere all'utente un invio che non e' avvenuto.
   */
  async sendContactRequest(
    data: ContactRequest,
  ): Promise<{ delivered: boolean; reference?: string }> {
    try {
      const res = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Errore del server');
      const body = await res.json();
      return { delivered: true, reference: body?.reference };
    } catch {
      return { delivered: false };
    }
  },
};
