/**
 * Audit Service — Journal d'audit des actions admin.
 *
 * Helper unique `logAction()` à appeler depuis les controllers.
 * Toutes les écritures sont fire-and-forget (n'interrompent jamais la requête principale).
 *
 * Liste des actions normalisée :
 *   car.replaceAll      — push complet du catalogue (count: N)
 *   car.clear           — vidage explicite du catalogue
 *   user.create         — création d'un compte
 *   user.update         — modification d'un compte (email/firstName/lastName/password)
 *   user.delete         — suppression d'un compte
 *   user.toggle_active  — activation/désactivation d'un compte
 *   user.change_role    — changement de rôle ADMIN ↔ SUPER_ADMIN
 *   auth.login_failed   — tentative de connexion échouée
 */

import type { Request } from 'express';
import { prisma } from './prisma.service.js';

export interface LogActionParams {
  userId?:   number | null;
  username?: string | null;
  action:    string;
  entity?:   string;
  entityId?: number;
  details?:  Record<string, unknown>;
  req?:      Request;
}

/** Enregistre une entrée d'audit. Ne throw jamais — silence sur erreur. */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId:    params.userId ?? null,
        username:  params.username ?? null,
        action:    params.action,
        entity:    params.entity ?? null,
        entityId:  params.entityId ?? null,
        details:   params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.req?.ip ?? null,
      },
    });
  } catch (err) {
    // On ne casse jamais la requête principale à cause d'un log
    console.error('⚠️  Audit log failed :', (err as Error).message);
  }
}

// ─── Lecture (utilisé par audit.controller) ──────────

export interface ListAuditParams {
  limit?:    number;
  offset?:   number;
  userId?:   number;
  action?:   string;
  fromDate?: Date;
  toDate?:   Date;
}

export async function listLogs(params: ListAuditParams = {}) {
  const where: Record<string, unknown> = {};
  if (params.userId   !== undefined) where.userId    = params.userId;
  if (params.action   !== undefined) where.action    = { contains: params.action };
  if (params.fromDate || params.toDate) {
    const range: { gte?: Date; lte?: Date } = {};
    if (params.fromDate) range.gte = params.fromDate;
    if (params.toDate)   range.lte = params.toDate;
    where.createdAt = range;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    Math.min(params.limit ?? 100, 500),
      skip:    params.offset ?? 0,
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true, role: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

export async function deleteAllLogs(): Promise<number> {
  const r = await prisma.auditLog.deleteMany();
  return r.count;
}
