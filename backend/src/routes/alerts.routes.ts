/**
 * Routes pour le système d'alertes :
 *   POST /api/admin/alerts/run    — déclenche manuellement (tout Admin connecté)
 *   POST /api/admin/alerts/reset  — RAZ alertSentAt (Super Admin only, pour démo)
 */

import { Router } from 'express';
import * as ctrl from '../controllers/alerts.controller.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/run',   ctrl.run);
router.post('/reset', requireSuperAdmin, ctrl.reset);

export default router;
