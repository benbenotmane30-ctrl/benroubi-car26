import { Router } from 'express';
import * as health from '../controllers/health.controller.js';

const router = Router();

router.get('/',              health.root);     // GET /
router.get('/api/ping',      health.ping);     // GET /api/ping
router.get('/api/test-mail', health.testMail); // GET /api/test-mail

export default router;
