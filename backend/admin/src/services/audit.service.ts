/**
 * Service Audit admin — lecture du journal (Super Admin only).
 */

import { api } from './api';
import type { AuditLog, AuditApiResponse, ApiResponse } from '../types';

export interface ListAuditParams {
  limit?:    number;
  offset?:   number;
  userId?:   number;
  action?:   string;
  fromDate?: string;  // ISO date
  toDate?:   string;
}

export async function listLogs(params: ListAuditParams = {}): Promise<{ logs: AuditLog[]; total: number }> {
  const { data } = await api.get<AuditApiResponse>('/api/admin/audit', { params });
  if (!data.success) throw new Error(data.message ?? 'Erreur');
  return { logs: data.logs, total: data.total };
}

export async function purgeAllLogs(): Promise<number> {
  const { data } = await api.delete<ApiResponse & { deletedCount?: number }>('/api/admin/audit', {
    data: { confirm: 'VIDER' },
  });
  if (!data.success) throw new Error(data.message ?? 'Erreur');
  return data.deletedCount ?? 0;
}
