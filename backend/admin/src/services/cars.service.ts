/**
 * Service voitures admin — stockage hybride localStorage + cloud API.
 *
 * Stratégie :
 *   - localStorage = source primaire (rapide, offline-first)
 *   - API backend = synchronisation cloud (multi-navigateur)
 *   - Sur save() : write localStorage IMMÉDIAT + push cloud en arrière-plan
 *   - Sur init() : pull cloud → si plus récent que local → adopte le cloud
 */

import { api } from './api';
import type { Car, CarsApiResponse, ApiResponse } from '../types';

const CARS_KEY     = 'bc_cars';
const LAST_SYNC_KEY = 'bc_last_sync_at';
const MANAGED_KEY   = 'bc_admin_managed';

// ─── localStorage helpers ──────────────────────────────
export function getLocalCars(): Car[] {
  try { return JSON.parse(localStorage.getItem(CARS_KEY) ?? '[]'); }
  catch { return []; }
}

export function setLocalCars(cars: Car[]): void {
  localStorage.setItem(CARS_KEY, JSON.stringify(cars));
  localStorage.setItem(MANAGED_KEY, '1');
}

export function getLastSyncAt(): number {
  return parseInt(localStorage.getItem(LAST_SYNC_KEY) ?? '0', 10) || 0;
}

// ─── API cloud ────────────────────────────────────────
export async function pullFromCloud(): Promise<{ cars: Car[]; updatedAt: number | null; cloudEnabled: boolean }> {
  const { data } = await api.get<CarsApiResponse>('/api/cars');
  return { cars: data.cars ?? [], updatedAt: data.updatedAt ?? null, cloudEnabled: data.cloudEnabled };
}

export async function pushToCloud(cars: Car[], confirmEmpty = false): Promise<ApiResponse> {
  const body = confirmEmpty ? { cars, confirmEmpty: true } : { cars };
  const { data } = await api.put<ApiResponse>('/api/admin/cars', body);
  if (data.success) {
    const ts = (data as ApiResponse & { updatedAt?: number }).updatedAt ?? Date.now();
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
  }
  return data;
}
