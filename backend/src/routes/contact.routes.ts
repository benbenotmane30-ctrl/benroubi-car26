import { Router } from 'express';
import * as contact from '../controllers/contact.controller.js';

const router = Router();

router.post('/', contact.createContact);

export default router;
