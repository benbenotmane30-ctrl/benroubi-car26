/**
 * Context Saison — partage l'état "haute / basse saison" entre toute l'app.
 * Le toggle dans SeasonBar met à jour, et toutes les CarCard réagissent.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Season } from '../types/car';
import { SEASON_LABELS } from '../hooks/useSeason';

interface SeasonCtx {
  season: Season;
  setSeason: (s: Season) => void;
  label: string;
}

const SeasonContext = createContext<SeasonCtx | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>('haut');
  return (
    <SeasonContext.Provider value={{ season, setSeason, label: SEASON_LABELS[season] }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeasonContext(): SeasonCtx {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeasonContext doit être utilisé dans un SeasonProvider');
  return ctx;
}
