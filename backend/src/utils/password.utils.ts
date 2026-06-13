/**
 * Utilitaires de hashing de mot de passe — bcrypt.
 *
 * Pourquoi bcrypt et pas SHA-256 :
 *   - Salt automatique par hash (résiste aux rainbow tables)
 *   - Coût ajustable (workFactor) → résistant aux GPU/ASIC
 *   - Standard industriel pour les mots de passe utilisateurs
 *
 * Note : le password admin .env est encore en SHA-256 (legacy phase 5).
 *        À partir de la phase 7.2 (multi-comptes), tous les nouveaux passwords
 *        sont bcryptés et stockés dans la table admin_users.
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Hash un mot de passe en clair → string bcrypt (60 chars). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compare un mot de passe en clair au hash bcrypt stocké. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
