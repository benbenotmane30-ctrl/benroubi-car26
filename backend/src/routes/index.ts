/**
 * Point de montage central de toutes les routes API.
 * `app.ts` n'importe que ce fichier.
 */

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import carsRoutes, { carsAdminRouter } from './cars.routes.js';
import bookingsRoutes from './bookings.routes.js';
import contactRoutes from './contact.routes.js';
import { meRouter, usersRouter } from './users.routes.js';
import auditRouter from './audit.routes.js';
import insuranceRouter from './insurance.routes.js';
import visiteRouter from './visite.routes.js';
import alertsRouter from './alerts.routes.js';

const router = Router();

// Public
router.use('/',              healthRoutes);   // /, /api/ping, /api/test-mail
router.use('/api/cars',      carsRoutes);     // GET /api/cars
router.use('/api/bookings',  bookingsRoutes); // POST /api/bookings
router.use('/api/contact',   contactRoutes);  // POST /api/contact

// Admin
router.use('/api/auth',        authRoutes);       // POST /api/auth/login, GET /api/auth/verify
router.use('/api/admin/cars',  carsAdminRouter);  // PUT /api/admin/cars
router.use('/api/admin/me',    meRouter);         // GET/PUT /api/admin/me, PUT /me/password
router.use('/api/admin/users', usersRouter);      // CRUD users (Super Admin)
router.use('/api/admin/audit', auditRouter);      // GET/DELETE journal d'audit (Super Admin)
router.use('/api/admin/insurances', insuranceRouter); // CRUD polices d'assurance
router.use('/api/admin/visites',    visiteRouter);    // CRUD visites techniques
router.use('/api/admin/alerts',     alertsRouter);    // Run / Reset alertes échéances

export default router;
