/**
 * Service Insurance admin — CRUD pour les polices d'assurance.
 */

import { api } from './api';
import type { Insurance, InsurancesApiResponse, ApiResponse } from '../types';

export interface CreateInsurancePayload {
  matricule:   string;
  marque:      string;
  modele:      string;
  compagnie:   string;
  dateDebut:   string;     // YYYY-MM-DD
  dateFin:     string;
  montantMad?: number;
  notes?:      string;
}

export interface UpdateInsurancePayload {
  matricule?:  string;
  marque?:     string;
  modele?:     string;
  compagnie?:  string;
  dateDebut?:  string;
  dateFin?:    string;
  montantMad?: number | null;
  notes?:      string | null;
}

export async function listInsurances(): Promise<Insurance[]> {
  const { data } = await api.get<InsurancesApiResponse>('/api/admin/insurances');
  if (!data.success) throw new Error(data.message ?? 'Erreur de chargement');
  return data.insurances;
}

export async function createInsurance(payload: CreateInsurancePayload): Promise<Insurance> {
  const { data } = await api.post<ApiResponse & { insurance: Insurance }>('/api/admin/insurances', payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de création');
  return data.insurance;
}

export async function updateInsurance(id: number, payload: UpdateInsurancePayload): Promise<Insurance> {
  const { data } = await api.put<ApiResponse & { insurance: Insurance }>(`/api/admin/insurances/${id}`, payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de mise à jour');
  return data.insurance;
}

export async function deleteInsurance(id: number): Promise<void> {
  const { data } = await api.delete<ApiResponse>(`/api/admin/insurances/${id}`);
  if (!data.success) throw new Error(data.message ?? 'Erreur de suppression');
}

// ─── Helpers échéance ──────────────────────────────

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const now = new Date();
  // On normalise à minuit pour éviter les effets d'heure
  target.setHours(0, 0, 0, 0); now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export interface ExpirationStatus {
  level: 'expired' | 'urgent' | 'soon' | 'ok';
  label: string;
  bg:    string;
  color: string;
}

export function expirationStatus(isoDate: string): ExpirationStatus {
  const d = daysUntil(isoDate);
  if (d < 0)    return { level: 'expired', label: `Expirée depuis ${Math.abs(d)} j`, bg: 'rgba(239,68,68,.15)',  color: 'var(--rouge-dark, #b91c1c)' };
  if (d === 0)  return { level: 'expired', label: `Expire aujourd'hui`,              bg: 'rgba(239,68,68,.15)',  color: 'var(--rouge-dark, #b91c1c)' };
  if (d <= 7)   return { level: 'urgent',  label: `Dans ${d} j`,                     bg: 'rgba(249,115,22,.18)', color: '#c2410c' };
  if (d <= 30)  return { level: 'soon',    label: `Dans ${d} j`,                     bg: 'rgba(234,179,8,.18)',  color: '#a16207' };
  return                { level: 'ok',     label: `Dans ${d} j`,                     bg: 'rgba(16,185,129,.15)', color: 'var(--vert-dark, #047857)' };
}

/** Renvoie la plus récente assurance par matricule (par dateFin desc). */
export function latestPerVehicle(items: Insurance[]): Insurance[] {
  const map = new Map<string, Insurance>();
  for (const ins of items) {
    const key = ins.matricule.toUpperCase();
    const existing = map.get(key);
    if (!existing || new Date(ins.dateFin) > new Date(existing.dateFin)) {
      map.set(key, ins);
    }
  }
  return [...map.values()].sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime());
}
