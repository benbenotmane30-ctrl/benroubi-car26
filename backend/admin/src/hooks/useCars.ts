/**
 * useCars — Hook central de gestion des voitures pour l'admin.
 *
 * Stockage hybride :
 *   - Source primaire : localStorage (rapide, offline)
 *   - Sync arrière-plan : POST/GET vers backend (multi-navigateur)
 *
 * Expose : { cars, addCar, updateCar, deleteCar, toggleDispo, replaceAll, importDefaults, syncStatus }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Car } from '../types';
import { getLocalCars, setLocalCars, pullFromCloud, pushToCloud, getLastSyncAt } from '../services/cars.service';
import { DEFAULT_CARS } from '../data/defaultCars';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export function useCars() {
  const [cars, setCars]             = useState<Car[]>(getLocalCars());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync]     = useState<number>(getLastSyncAt());
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Pull cloud au démarrage (offline-first : on garde le local en attendant) ─
  useEffect(() => {
    void doPullFromCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doPullFromCloud() {
    setSyncStatus('syncing');
    try {
      const { cars: cloudCars, updatedAt, cloudEnabled } = await pullFromCloud();
      if (!cloudEnabled) { setSyncStatus('offline'); return; }

      const localCars = getLocalCars();
      const localTs = getLastSyncAt();

      // Récupération : cloud vide + local plein → on repousse le local vers le cloud
      if (cloudCars.length === 0 && localCars.length > 0) {
        console.warn(`☁️  Cloud vide détecté, repush de ${localCars.length} voitures locales vers la BDD`);
        try {
          const r = await pushToCloud(localCars);
          if (r.success) {
            setSyncStatus('synced');
            setLastSync(Date.now());
            return;
          }
        } catch { /* fallthrough vers synced */ }
      }

      if (updatedAt && updatedAt > localTs && cloudCars.length > 0) {
        // Cloud est plus récent → on adopte
        // (on conserve les photos locales par id : le cloud ne stocke pas les photos lourdes)
        const localPhotos: Record<number, string[]> = {};
        localCars.forEach(c => {
          if (c.photos && c.photos.length) localPhotos[c.id] = c.photos;
        });
        const merged = cloudCars.map(c => ({ ...c, photos: localPhotos[c.id] ?? c.photos ?? [] }));
        setLocalCars(merged);
        setCars(merged);
        setLastSync(updatedAt);
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }

  /** Push debounced vers le cloud (groupe les saves rapprochées). */
  const schedulePush = useCallback((nextCars: Car[]) => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      // Safety : ne jamais auto-push une liste vide (protège contre wipe BDD accidentel)
      if (nextCars.length === 0) {
        console.warn('⚠️  Push annulé : liste vide. Utilisez "Vider le catalogue" pour confirmer.');
        setSyncStatus('idle');
        return;
      }
      setSyncStatus('syncing');
      try {
        const r = await pushToCloud(nextCars);
        if (r.success) {
          setSyncStatus('synced');
          setLastSync(Date.now());
        } else {
          setSyncStatus('error');
        }
      } catch {
        setSyncStatus('error');
      }
    }, 1500);
  }, []);

  /** Wrapper local + cloud */
  const commit = useCallback((next: Car[]) => {
    setLocalCars(next);
    setCars(next);
    schedulePush(next);
  }, [schedulePush]);

  // ─── Opérations CRUD ──────────────────────────────────
  const addCar = (car: Omit<Car, 'id'>): Car => {
    const id = cars.length ? Math.max(...cars.map(c => c.id), 99) + 1 : 100;
    const newCar: Car = { ...car, id, updatedAt: Date.now() };
    commit([...cars, newCar]);
    return newCar;
  };

  const updateCar = (id: number, patch: Partial<Car>) => {
    const next = cars.map(c => c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c);
    commit(next);
  };

  const deleteCar = (id: number) => {
    commit(cars.filter(c => c.id !== id));
  };

  const toggleDispo = (id: number) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    updateCar(id, { dispo: !car.dispo });
  };

  const replaceAll = (next: Car[]) => {
    commit(next.map(c => ({ ...c, updatedAt: c.updatedAt ?? Date.now() })));
  };

  /** Vide totalement le catalogue (local + cloud) — nécessite confirmEmpty côté backend. */
  const clearAll = async (): Promise<boolean> => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    setLocalCars([]);
    setCars([]);
    setSyncStatus('syncing');
    try {
      const r = await pushToCloud([], true);
      if (r.success) {
        setSyncStatus('synced');
        setLastSync(Date.now());
        return true;
      }
      setSyncStatus('error');
      return false;
    } catch {
      setSyncStatus('error');
      return false;
    }
  };

  const importDefaults = (): number => {
    const existingIds = new Set(cars.map(c => c.id));
    const toAdd = DEFAULT_CARS.filter(c => !existingIds.has(c.id));
    if (toAdd.length === 0) return 0;
    commit([...cars, ...toAdd.map(c => ({ ...c, updatedAt: Date.now() }))]);
    return toAdd.length;
  };

  return {
    cars,
    syncStatus,
    lastSync,
    addCar,
    updateCar,
    deleteCar,
    toggleDispo,
    replaceAll,
    clearAll,
    importDefaults,
    refresh: doPullFromCloud,
  };
}
