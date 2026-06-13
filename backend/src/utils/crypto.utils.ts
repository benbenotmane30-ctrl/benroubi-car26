import crypto from 'node:crypto';
import { env } from '../config/env.js';
import type { AdminPayload } from '../types/index.js';

/**
 * Hash SHA-256 d'une chaîne (hex).
 * Utilisé pour comparer le mot de passe admin reçu au hash stocké en env.
 */
export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(String(input), 'utf8').digest('hex');
}

/**
 * Comparaison à temps constant de 2 chaînes — résiste aux attaques par timing.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Encodage Base64URL (RFC 4648). */
function b64urlEncode(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** Décodage Base64URL. */
function b64urlDecode(s: string): Buffer {
  let str = s.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

/**
 * Signe un payload en token JWT-like : `base64url(json).base64url(hmac256)`.
 * Beaucoup plus simple qu'une dépendance jsonwebtoken pour notre usage.
 */
export function signSession(payload: AdminPayload): string {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET manquant');
  const body = b64urlEncode(JSON.stringify(payload));
  const sig  = b64urlEncode(
    crypto.createHmac('sha256', env.SESSION_SECRET).update(body).digest()
  );
  return `${body}.${sig}`;
}

/**
 * Vérifie un token et renvoie son payload, ou null si invalide / expiré.
 */
export function verifySession(token: string | undefined): AdminPayload | null {
  if (!token || typeof token !== 'string' || !env.SESSION_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expected = b64urlEncode(
    crypto.createHmac('sha256', env.SESSION_SECRET).update(body).digest()
  );
  if (!timingSafeStringEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as AdminPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
