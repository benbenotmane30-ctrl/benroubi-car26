/**
 * Routes des polices d'assurance — accès tous Admin connectés.
 */

import { Router } from 'express';
import * as ctrl from '../controllers/insurance.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get(   '/',     ctrl.list);
router.get(   '/:id',  ctrl.getOne);
router.post(  '/',     ctrl.create);
router.put(   '/:id',  ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
