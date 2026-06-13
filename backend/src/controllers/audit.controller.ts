/**
 * Audit Controller — Endpoints de lecture du journal d'audit.
 * Réservé au Super Admin (route protégée par requireSuperAdmin).
 */

import type { Request, Response } from 'express';
import * as auditService from '../services/audit.service.js';

/**
 * GET /api/admin/audit
 * Query params : limit, offset, userId, action, fromDate, toDate
 */
export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit    = req.query.limit    ? parseInt(String(req.query.limit), 10) : 100;
    const offset   = req.query.offset   ? parseInt(String(req.query.offset), 10) : 0;
    const userId   = req.query.userId   ? parseInt(String(req.query.userId), 10) : undefined;
    const action   = req.query.action   ? String(req.query.action) : undefined;
    const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
    const toDate   = req.query.toDate   ? new Date(String(req.query.toDate))   : undefined;

    const { logs, total } = await auditService.listLogs({ limit, offset, userId, action, fromDate, toDate });

    res.json({ success: true, logs, total, limit, offset });
  } catch (err) {
    console.error('❌ /api/admin/audit GET :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de lecture du journal.' });
  }
};

/**
 * DELETE /api/admin/audit — Vide tout le journal d'audit (purge manuelle).
 * Body : { confirm: "VIDER" }
 */
export const purge = async (req: Request, res: Response): Promise<void> => {
  if (req.body?.confirm !== 'VIDER') {
    res.status(409).json({ success: false, message: 'Confirmation manquante. Envoyez { confirm: "VIDER" }.' });
    return;
  }
  try {
    const count = await auditService.deleteAllLogs();
    console.log(`🗑️  Journal d'audit purgé — ${count} entrées supprimées par ${req.admin?.u}`);
    res.json({ success: true, deletedCount: count });
  } catch (err) {
    console.error('❌ /api/admin/audit DELETE :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de purge.' });
  }
};
