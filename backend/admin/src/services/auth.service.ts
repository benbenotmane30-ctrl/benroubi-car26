/**
 * Service d'authentification admin — gère login, vérification, déconnexion.
 */
import { api } from './api';
import type { LoginResponse, AuthUser } from '../types';

export const TOKEN_KEY = 'bc_admin_token';
export const EXP_KEY   = 'bc_admin_exp';
export const USER_KEY  = 'bc_admin_user';

export async function login(username: string, password: string, remember: boolean): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { username, password });
  if (data.success && data.token && data.expiresAt) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, data.token);
    store.setItem(EXP_KEY,   String(data.expiresAt));
    if (data.user) store.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export function logout(): void {
  [sessionStorage, localStorage].forEach(s => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(EXP_KEY);
    s.removeItem(USER_KEY);
  });
}

export function getStoredToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? '';
}

export function getStoredExp(): number {
  const e = sessionStorage.getItem(EXP_KEY) ?? localStorage.getItem(EXP_KEY) ?? '0';
  return parseInt(e, 10) || 0;
}

export function getStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

/** Vérifie l'auth locale (token présent + non expiré). */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  const exp = getStoredExp();
  if (!token || !exp) return false;
  if (exp < Date.now()) { logout(); return false; }
  return true;
}
