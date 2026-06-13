/**
 * Instance Axios pour l'admin — avec intercepteur qui ajoute auto le Bearer token.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : ajoute le token JWT à chaque requête sortante
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bc_admin_token') ?? sessionStorage.getItem('bc_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cold-start ping
api.get('/api/ping').catch(() => {});
