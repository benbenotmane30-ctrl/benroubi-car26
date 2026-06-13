import type { Request, Response, NextFunction } from 'express';
import { verifySession } from '../utils/crypto.utils.js';

/**
 * Middleware Express qui exige un token admin valide.
 * Lit l'en-tête `Authorization: Bearer <token>`, vérifie la signature et l'expiration.
 * En cas de succès, attache le payload à `req.admin`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = verifySession(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Session invalide ou expirée. Reconnectez-vous.',
    });
    return;
  }
  req.admin = payload;
  next();
}

/**
 * Middleware Express qui exige le rôle SUPER_ADMIN.
 * À chaîner APRÈS requireAuth.
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.admin) {
    res.status(401).json({ success: false, message: 'Authentification requise.' });
    return;
  }
  if (req.admin.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Accès refusé — réservé aux Super Admins.',
    });
    return;
  }
  next();
}
