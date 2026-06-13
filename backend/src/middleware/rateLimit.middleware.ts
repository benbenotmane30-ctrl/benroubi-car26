import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isDev ? 2000 : 300,
  message:  { success: false, message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isDev ? 50 : 15,
  skipSuccessfulRequests: true,
  message:  { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
