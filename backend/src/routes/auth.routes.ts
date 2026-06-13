import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/login',  loginLimiter, auth.login);
router.get( '/verify',               auth.verify);

export default router;
