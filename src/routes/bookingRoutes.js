import express from 'express';
import { createBooking, getBookings, getBookingById, updateBooking } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id', updateBooking);

export default router;
