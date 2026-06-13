/**
 * Hook useCars — Charge la liste des voitures depuis le backend.
 *
 * Synchronisation auto avec l'admin :
 *   - Polling toutes les 10 secondes (silencieux, sans flash UI)
 *   - Refresh immédiat quand l'onglet redevient visible (visibilitychange + focus)
 *   - Le polling s'arrête quand l'onglet est en arrière-plan (économie de requêtes)
 *
 * Renvoie { cars, loading, error, refetch }.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCars } from '../services/cars.service';
import type { Car } from '../types/car';

const POLL_INTERVAL_MS = 10_000;

export function useCars() {
  const [cars,    setCars]    = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Refetch initial / manuel — affiche "loading"
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCars();
      if (mountedRef.current) setCars(data);
    } catch (e) {
      if (mountedRef.current) setError((e as Error).message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Refetch silencieux — pas de "loading", pas de flash UI. Utilisé par polling/focus.
  const silentRefetch = useCallback(async () => {
    try {
      const data = await fetchCars();
      if (mountedRef.current) {
        setCars(data);
        setError(null);
      }
    } catch {
      // On garde les voitures actuelles en cas d'erreur réseau temporaire
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refetch();

    const tick = () => {
      if (document.visibilityState === 'visible') void silentRefetch();
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [refetch, silentRefetch]);

  return { cars, loading, error, refetch };
}
