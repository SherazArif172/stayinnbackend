import { z } from 'zod';

export const createResidentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  assignedRoom: z.string().min(1, 'Assigned room is required'),
  checkInDate: z.coerce.date(),
  status: z.enum(['active', 'left']).optional(),
  notes: z.string().optional(),
});

export const updateResidentSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(5).optional(),
  assignedRoom: z.string().min(1).optional(),
  checkInDate: z.coerce.date().optional(),
  status: z.enum(['active', 'left']).optional(),
  notes: z.string().optional(),
});

