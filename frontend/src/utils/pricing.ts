/**
 * Calcul du prix de location avec tarification saisonnière.
 * Haute saison : Juin–Août. Basse saison : Septembre–Mai.
 */

import { isHauteSaison } from '../hooks/useSeason';
import type { Car, PriceBreakdown } from '../types/car';

/**
 * Compte les jours entre 2 dates en distinguant haute et basse saison.
 * Retourne null si dates invalides ou si la fin est avant le début.
 */
export function computePrice(
  car: Pick<Car, 'prix_haut' | 'prix_bas'>,
  debut: string,
  fin: string,
): PriceBreakdown | null {
  if (!debut || !fin) return null;
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime()) || d2 <= d1) return null;

  let joursHaut = 0;
  let joursBas  = 0;
  const cur = new Date(d1);
  while (cur < d2) {
    if (isHauteSaison(cur)) joursHaut++;
    else joursBas++;
    cur.setDate(cur.getDate() + 1);
  }

  const montantHaut = joursHaut * car.prix_haut;
  const montantBas  = joursBas  * car.prix_bas;

  return {
    joursHaut,
    joursBas,
    montantHaut,
    montantBas,
    total: montantHaut + montantBas,
    totalJours: joursHaut + joursBas,
  };
}

/** Format français du prix en MAD avec séparateur de milliers. */
export function formatMad(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' MAD';
}

/** Format date FR court (ex: "12 juin 2026"). */
export function formatDateFr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Construit le label saison à insérer dans l'email envoyé au gérant. */
export function getSeasonLabel(debut: string, fin: string): string {
  const breakdown = computePrice({ prix_haut: 0, prix_bas: 0 }, debut, fin);
  if (!breakdown) return '';
  const { joursHaut, joursBas } = breakdown;
  if (joursHaut > 0 && joursBas > 0)
    return `☀️ Haute saison : ${joursHaut}j + 🍂 Basse saison : ${joursBas}j`;
  if (joursHaut > 0) return '☀️ Haute saison (Juin – Août)';
  return '🍂 Basse saison (Septembre – Mai)';
}
