/**
 * Alerts Controller — Endpoints manuels pour le système d'alertes.
 *   POST /api/admin/alerts/run    — déclenche le check immédiat (pour démo)
 *   POST /api/admin/alerts/reset  — RAZ des alertSentAt (Super Admin only — pour démo aussi)
 */

import type { Request, Response } from 'express';
import { runDailyAlerts, resetAllAlertFlags } from '../services/alerts.service.js';

export const run = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await runDailyAlerts();
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ /api/admin/alerts/run :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur d\'exécution.' });
  }
};

export const reset = async (_req: Request, res: Response): Promise<void> => {
  try {
    const r = await resetAllAlertFlags();
    res.json({ success: true, ...r });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
