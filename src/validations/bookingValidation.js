import { z } from 'zod';

export const createBookingSchema = z.object({
  room: z.string().min(1, 'Room is required'),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  notes: z.string().optional(),
  userId: z.string().optional(), // admin only: create on behalf of user
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOutDate'],
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled']).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(['unpaid', 'paid']).optional(),
});
