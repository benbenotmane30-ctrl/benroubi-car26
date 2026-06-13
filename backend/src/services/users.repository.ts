/**
 * Users Repository — Couche d'accès aux données pour les AdminUser.
 *
 * Pattern : DAO (Data Access Object) — encapsule toutes les requêtes Prisma
 * liées aux users et expose une API métier propre aux controllers.
 */

import { prisma } from './prisma.service.js';
import type { AdminUser, Role } from '@prisma/client';

/** Forme renvoyée à l'API (sans le passwordHash, jamais exposé). */
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  phone: string | null;
  whatsappApiKey: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Sanitize : exclut le hash du password de la réponse API. */
function toPublic(u: AdminUser): PublicUser {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}

// ─── Lecture ──────────────────────────────────────────

export async function findAll(): Promise<PublicUser[]> {
  const users = await prisma.adminUser.findMany({ orderBy: { id: 'asc' } });
  return users.map(toPublic);
}

export async function findById(id: number): Promise<PublicUser | null> {
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user ? toPublic(user) : null;
}

export async function findByUsername(username: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { username: username.toLowerCase() } });
}

export async function findByEmail(email: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
}

export async function count(): Promise<number> {
  return prisma.adminUser.count();
}

// ─── Création / mise à jour ───────────────────────────

export interface CreateUserInput {
  username:     string;
  email:        string;
  passwordHash: string;
  firstName:    string;
  lastName:     string;
  role?:        Role;
  active?:      boolean;
}

export async function create(input: CreateUserInput): Promise<PublicUser> {
  const created = await prisma.adminUser.create({
    data: {
      username:     input.username.toLowerCase(),
      email:        input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName:    input.firstName.trim(),
      lastName:     input.lastName.trim(),
      role:         input.role   ?? 'ADMIN',
      active:       input.active ?? true,
    },
  });
  return toPublic(created);
}

export interface UpdateUserInput {
  email?:          string;
  passwordHash?:   string;
  firstName?:      string;
  lastName?:       string;
  role?:           Role;
  active?:         boolean;
  phone?:          string | null;
  whatsappApiKey?: string | null;
}

export async function update(id: number, input: UpdateUserInput): Promise<PublicUser | null> {
  try {
    const data: Record<string, unknown> = {};
    if (input.email          !== undefined) data.email          = input.email.toLowerCase();
    if (input.passwordHash   !== undefined) data.passwordHash   = input.passwordHash;
    if (input.firstName      !== undefined) data.firstName      = input.firstName.trim();
    if (input.lastName       !== undefined) data.lastName       = input.lastName.trim();
    if (input.role           !== undefined) data.role           = input.role;
    if (input.active         !== undefined) data.active         = input.active;
    if (input.phone          !== undefined) data.phone          = input.phone?.trim() || null;
    if (input.whatsappApiKey !== undefined) data.whatsappApiKey = input.whatsappApiKey?.trim() || null;

    const updated = await prisma.adminUser.update({ where: { id }, data });
    return toPublic(updated);
  } catch {
    return null;
  }
}

export async function touchLastLogin(id: number): Promise<void> {
  try {
    await prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
  } catch { /* ignore — pas critique */ }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.adminUser.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
