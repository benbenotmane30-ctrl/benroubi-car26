/**
 * Hook useSeason — Toggle entre la haute et la basse saison.
 * Haute saison : Juin-Août (mois 6, 7, 8).
 * Basse saison : Septembre-Mai (le reste).
 */

import { useState } from 'react';
import type { Season } from '../types/car';

export const SEASON_LABELS: Record<Season, string> = {
  haut: 'Juin – Août',
  bas:  'Septembre – Mai',
};

export function useSeason(initial: Season = 'haut') {
  const [season, setSeason] = useState<Season>(initial);
  return {
    season,
    setSeason,
    label: SEASON_LABELS[season],
  };
}

/** Détermine si une date donnée tombe en haute saison. */
export function isHauteSaison(date: Date): boolean {
  const m = date.getMonth() + 1; // 1-12
  return m >= 6 && m <= 8;
}
