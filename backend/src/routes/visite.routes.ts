/**
 * Routes des visites techniques — accès tous Admin connectés.
 */

import { Router } from 'express';
import * as ctrl from '../controllers/visite.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get(   '/',     ctrl.list);
router.post(  '/',     ctrl.create);
router.put(   '/:id',  ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
