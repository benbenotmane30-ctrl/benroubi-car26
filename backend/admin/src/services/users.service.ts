/**
 * Service Users admin — CRUD comptes + endpoints /me.
 *
 * Toutes les routes /api/admin/users/* requièrent SUPER_ADMIN côté backend.
 * Les routes /api/admin/me/* sont accessibles à tout user authentifié.
 */

import { api } from './api';
import type { User, ApiResponse, UsersApiResponse, Role } from '../types';

// ─── Liste / CRUD (Super Admin) ────────────────────

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<UsersApiResponse>('/api/admin/users');
  if (!data.success) throw new Error(data.message ?? 'Erreur de chargement');
  return data.users;
}

export interface CreateUserPayload {
  username:  string;
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  role:      Role;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<ApiResponse & { user: User }>('/api/admin/users', payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de création');
  return data.user;
}

export interface UpdateUserPayload {
  email?:           string;
  firstName?:       string;
  lastName?:        string;
  role?:            Role;
  active?:          boolean;
  phone?:           string | null;
  whatsappApiKey?:  string | null;
  password?:        string;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.put<ApiResponse & { user: User }>(`/api/admin/users/${id}`, payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de mise à jour');
  return data.user;
}

export async function deleteUser(id: number): Promise<void> {
  const { data } = await api.delete<ApiResponse>(`/api/admin/users/${id}`);
  if (!data.success) throw new Error(data.message ?? 'Erreur de suppression');
}

// ─── /me (tout user authentifié) ───────────────────

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<ApiResponse & { user: User }>('/api/admin/me');
  if (!data.success) throw new Error(data.message ?? 'Erreur');
  return data.user;
}

export interface UpdateMyProfilePayload {
  email?:           string;
  firstName?:       string;
  lastName?:        string;
  phone?:           string | null;
  whatsappApiKey?:  string | null;
}

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<User> {
  const { data } = await api.put<ApiResponse & { user: User }>('/api/admin/me', payload);
  if (!data.success) throw new Error(data.message ?? 'Erreur de mise à jour');
  return data.user;
}

export async function changeMyPassword(oldPassword: string, newPassword: string): Promise<void> {
  const { data } = await api.put<ApiResponse>('/api/admin/me/password', { oldPassword, newPassword });
  if (!data.success) throw new Error(data.message ?? 'Erreur');
}

export async function testWhatsApp(): Promise<void> {
  const { data } = await api.post<ApiResponse>('/api/admin/me/whatsapp-test');
  if (!data.success) throw new Error(data.message ?? 'Erreur');
}
