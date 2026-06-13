import { Router } from 'express';
import * as bookings from '../controllers/bookings.controller.js';
import { bookingUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', bookingUpload, bookings.createBooking);

export default router;
