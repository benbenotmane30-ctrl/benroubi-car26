/**
 * Service admin pour les alertes d'échéance.
 *   - runAlerts() : déclenche manuellement le scan + envoi (tout Admin)
 *   - resetAlertFlags() : RAZ alertSentAt (Super Admin only)
 */

import { api } from './api';
import type { ApiResponse } from '../types';

export interface AlertRunResult {
  insurancesFound: number;
  visitesFound:    number;
  recipientCount:  number;
  emailsSent:      number;
  errors:          string[];
}

export async function runAlerts(): Promise<AlertRunResult> {
  const { data } = await api.post<ApiResponse & { result: AlertRunResult }>('/api/admin/alerts/run');
  if (!data.success) throw new Error(data.message ?? 'Erreur');
  return data.result;
}

export async function resetAlertFlags(): Promise<{ insurances: number; visites: number }> {
  const { data } = await api.post<ApiResponse & { insurances: number; visites: number }>('/api/admin/alerts/reset');
  if (!data.success) throw new Error(data.message ?? 'Erreur');
  return { insurances: data.insurances, visites: data.visites };
}
