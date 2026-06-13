/**
 * Routes du journal d'audit — Super Admin only.
 *   GET    /api/admin/audit    — liste paginée avec filtres
 *   DELETE /api/admin/audit    — purge totale (avec confirmation)
 */

import { Router } from 'express';
import * as ctrl from '../controllers/audit.controller.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware.js';

const auditRouter = Router();
auditRouter.use(requireAuth, requireSuperAdmin);
auditRouter.get(   '/', ctrl.list);
auditRouter.delete('/', ctrl.purge);

export default auditRouter;
