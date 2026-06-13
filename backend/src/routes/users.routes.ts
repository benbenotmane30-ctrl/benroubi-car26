/**
 * Routes pour la gestion des utilisateurs admin.
 *
 * Bases :
 *   /api/admin/me        — profil du user connecté (require auth)
 *   /api/admin/users     — CRUD comptes (require SUPER_ADMIN)
 */

import { Router } from 'express';
import * as ctrl from '../controllers/users.controller.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.middleware.js';

const meRouter    = Router();
const usersRouter = Router();

// ─── /api/admin/me — tout user authentifié ────────────
meRouter.use(requireAuth);
meRouter.get( '/',               ctrl.me);
meRouter.put( '/',               ctrl.updateMe);
meRouter.put( '/password',       ctrl.updateMyPassword);
meRouter.post('/whatsapp-test',  ctrl.testWhatsApp);

// ─── /api/admin/users — Super Admin only ──────────────
usersRouter.use(requireAuth, requireSuperAdmin);
usersRouter.get(   '/',     ctrl.list);
usersRouter.post(  '/',     ctrl.create);
usersRouter.put(   '/:id',  ctrl.updateUser);
usersRouter.delete('/:id',  ctrl.remove);

export { meRouter, usersRouter };
