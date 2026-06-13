import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { signSession, verifySession } from '../utils/crypto.utils.js';
import { verifyPassword } from '../utils/password.utils.js';
import { asTrimmedString } from '../utils/validation.utils.js';
import * as usersRepo from '../services/users.repository.js';
import { logAction } from '../services/audit.service.js';

/**
 * POST /api/auth/login
 * Body : { username: string, password: string }
 * Renvoie { token, expiresAt, user } en cas de succès.
 *
 * Cherche le user dans la table admin_users (bcrypt). Refuse les comptes inactifs.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const username = asTrimmedString(req.body?.username).toLowerCase();
  const password = asTrimmedString(req.body?.password);

  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Identifiant et mot de passe requis.' });
    return;
  }

  if (!env.SESSION_SECRET) {
    console.error('❌ /api/auth/login : SESSION_SECRET manquant');
    res.status(500).json({ success: false, message: 'Authentification non configurée sur le serveur.' });
    return;
  }

  // Délai aléatoire pour ralentir le brute-force (appliqué en cas d'échec)
  const fail = (message: string, reason: string, knownUser?: { id: number; username: string }) => {
    void logAction({
      userId:   knownUser?.id ?? null,
      username: knownUser?.username ?? username,
      action:   'auth.login_failed',
      details:  { reason },
      req,
    });
    setTimeout(
      () => res.status(401).json({ success: false, message }),
      250 + Math.random() * 250,
    );
  };

  const user = await usersRepo.findByUsername(username);
  if (!user) { fail('Identifiants incorrects.', 'unknown_user'); return; }
  if (!user.active) { fail('Compte désactivé. Contactez un Super Admin.', 'account_disabled', user); return; }

  const passOk = await verifyPassword(password, user.passwordHash);
  if (!passOk) { fail('Identifiants incorrects.', 'wrong_password', user); return; }

  // Met à jour lastLoginAt (fire-and-forget)
  void usersRepo.touchLastLogin(user.id);

  const now = Date.now();
  const exp = now + env.SESSION_TTL_HOURS * 60 * 60 * 1000;
  const token = signSession({ id: user.id, u: user.username, role: user.role, exp, iat: now });

  console.log(`✅ Login OK — ${user.username} (${user.role}) — IP ${req.ip}`);
  res.json({
    success:   true,
    token,
    expiresAt: exp,
    user: {
      id:        user.id,
      username:  user.username,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      role:      user.role,
    },
  });
};

/**
 * GET /api/auth/verify
 * Header : Authorization: Bearer <token>
 * Renvoie le payload si valide, ou 401.
 */
export const verify = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = verifySession(token);
  if (!payload) {
    res.status(401).json({ success: false });
    return;
  }
  res.json({
    success:   true,
    user:      payload.u,
    role:      payload.role,
    expiresAt: payload.exp,
  });
};
