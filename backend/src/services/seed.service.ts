/**
 * Seed automatique au démarrage — crée le 1er Super Admin si la BDD est vide.
 *
 * Appelé une fois depuis app.ts au boot du serveur.
 * Idempotent : si au moins 1 AdminUser existe, ne fait rien.
 */

import { env } from '../config/env.js';
import { hashPassword } from '../utils/password.utils.js';
import * as usersRepo from './users.repository.js';

export async function seedFirstSuperAdmin(): Promise<void> {
  try {
    const count = await usersRepo.count();
    if (count > 0) {
      console.log(`👥 admin_users : ${count} compte(s) déjà présent(s) — seed skip`);
      return;
    }

    // Validation des vars d'env
    const missing: string[] = [];
    if (!env.ADMIN_USER)           missing.push('ADMIN_USER');
    if (!env.ADMIN_PASS)           missing.push('ADMIN_PASS');
    if (!env.SUPERADMIN_EMAIL)     missing.push('SUPERADMIN_EMAIL');
    if (!env.SUPERADMIN_FIRSTNAME) missing.push('SUPERADMIN_FIRSTNAME');
    if (!env.SUPERADMIN_LASTNAME)  missing.push('SUPERADMIN_LASTNAME');

    if (missing.length > 0) {
      console.warn(`⚠️  Seed Super Admin impossible — variables manquantes : ${missing.join(', ')}`);
      console.warn(`    La table admin_users est vide. Renseignez les vars dans .env et relancez.`);
      return;
    }

    const passwordHash = await hashPassword(env.ADMIN_PASS);
    const user = await usersRepo.create({
      username:     env.ADMIN_USER,
      email:        env.SUPERADMIN_EMAIL,
      passwordHash,
      firstName:    env.SUPERADMIN_FIRSTNAME,
      lastName:     env.SUPERADMIN_LASTNAME,
      role:         'SUPER_ADMIN',
      active:       true,
    });

    console.log(`✨ Super Admin créé automatiquement :`);
    console.log(`   - username : ${user.username}`);
    console.log(`   - email    : ${user.email}`);
    console.log(`   - role     : ${user.role}`);
    console.log(`   - id       : ${user.id}`);
  } catch (err) {
    console.error(`❌ Seed Super Admin échoué :`, (err as Error).message);
  }
}
