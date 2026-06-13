/**
 * Instance Axios centralisée.
 * Toutes les requêtes API passent par ici → 1 seul endroit pour gérer baseURL,
 * intercepteurs, timeouts, etc.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60_000, // 60s — large pour gérer les cold-starts Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Réveille le backend Render en arrière-plan dès le chargement
// (cold-start gratuit ≈ 30-50s, autant le lancer tôt)
api.get('/api/ping').catch(() => {
  // Silencieux : si pas de connexion, on laisse les fetch suivants gérer l'erreur
});
