/**
 * Service Visite Technique admin — CRUD pour les contrôles techniques.
 */

import { api } from './api';
import { expirationStatus } from './insurance.service';
import type { VisiteTechnique, VisitesApiResponse, ApiResponse, ResultatVT } from '../types';

export interface CreateVisitePayload {
  matricule:      string;
  marque:         string;
  modele:         string;
  centre:         string;
  dateVisite:     string;   // YYYY-MM-DD
  dateExpiration: string;
  resultat?:      ResultatVT;
  notes?:         string;
}

export interface UpdateVisitePayload {
  matricule?:      string;
  marque?:         string;
  modele?:         string;
  centre?:         string;
  dateVisite?:     string;
  dateExpiration?: string;
  resultat?:       ResultatVT | null;
  notes?:          string | null;
}

export async function listVisites(): Promise<VisiteTechnique[]> {
  const { data } = await api.get<VisitesApiResponse>('/api/admin/visites');
  if (!data.success) throw new Error(data.message ?? 'Erreur de chargement');
  return data.visites;
}

export async function createVisite(payload: CreateVisitePayload): Promise<VisiteTechnique> {
  const { data } = await api.post<ApiResponse & { visite: VisiteTechnique }>('/api/admin/visites', payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de création');
  return data.visite;
}

export async function updateVisite(id: number, payload: UpdateVisitePayload): Promise<VisiteTechnique> {
  const { data } = await api.put<ApiResponse & { visite: VisiteTechnique }>(`/api/admin/visites/${id}`, payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de mise à jour');
  return data.visite;
}

export async function deleteVisite(id: number): Promise<void> {
  const { data } = await api.delete<ApiResponse>(`/api/admin/visites/${id}`);
  if (!data.success) throw new Error(data.message ?? 'Erreur de suppression');
}

// Helpers (réutilise expirationStatus du service insurance)
export { expirationStatus };

/** Renvoie la plus récente VT par matricule. */
export function latestPerVehicle(items: VisiteTechnique[]): VisiteTechnique[] {
  const map = new Map<string, VisiteTechnique>();
  for (const v of items) {
    const key = v.matricule.toUpperCase();
    const existing = map.get(key);
    if (!existing || new Date(v.dateExpiration) > new Date(existing.dateExpiration)) {
      map.set(key, v);
    }
  }
  return [...map.values()].sort((a, b) => new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime());
}
