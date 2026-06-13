/**
 * Service Voitures — Wraps les appels API liés au catalogue.
 */

import { api } from './api';
import type { Car, CarsApiResponse } from '../types/car';

export async function fetchCars(): Promise<Car[]> {
  const { data } = await api.get<CarsApiResponse>('/api/cars');
  if (!data.success || !Array.isArray(data.cars)) {
    throw new Error(data.message ?? 'Réponse invalide du serveur');
  }
  return data.cars;
}
