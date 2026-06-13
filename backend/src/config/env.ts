/**
 * Centralise toutes les variables d'environnement.
 * Validation au démarrage : si une var requise manque, le serveur refuse de démarrer.
 */

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante : ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Serveur
  PORT: parseInt(optional('PORT', '3000'), 10),
  NODE_ENV: optional('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173,http://localhost:5174'),
  ADMIN_URL: optional('ADMIN_URL', 'http://localhost:5174'),

  // Base de données
  DATABASE_URL: optional('DATABASE_URL', ''),

  // Auth admin (legacy SHA-256 — encore utilisé pour le seed initial uniquement)
  ADMIN_USER:      optional('ADMIN_USER', '').toLowerCase(),
  ADMIN_PASS:      optional('ADMIN_PASS', ''),        // En clair (utilisé pour seed)
  ADMIN_PASS_HASH: optional('ADMIN_PASS_HASH', '').toLowerCase(),
  SESSION_SECRET:  optional('SESSION_SECRET', ''),
  SESSION_TTL_HOURS: parseInt(optional('SESSION_TTL_HOURS', '8'), 10),

  // Seed du 1er Super Admin (utilisé une seule fois au démarrage si BDD vide)
  SUPERADMIN_EMAIL:     optional('SUPERADMIN_EMAIL',     'admin@benroubi-car.local'),
  SUPERADMIN_FIRSTNAME: optional('SUPERADMIN_FIRSTNAME', 'Youssef'),
  SUPERADMIN_LASTNAME:  optional('SUPERADMIN_LASTNAME',  'Benroubi'),

  // Brevo
  BREVO_API_KEY: optional('BREVO_API_KEY', ''),
  SENDER_EMAIL: optional('SENDER_EMAIL', ''),
  SENDER_NAME: optional('SENDER_NAME', 'Benroubi Car'),
  DEST_EMAIL: optional('DEST_EMAIL', ''),
};

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
