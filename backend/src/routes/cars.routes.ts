import { Router } from 'express';
import * as cars from '../controllers/cars.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public — lecture
router.get('/', cars.listCars);

export default router;

// Admin — écriture (montée séparément avec /admin/cars dans index.ts)
const adminRouter = Router();
adminRouter.put('/', requireAuth, cars.saveAllCars);
export { adminRouter as carsAdminRouter };
