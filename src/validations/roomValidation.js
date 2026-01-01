import { z } from 'zod';

// Room creation validation schema
export const createRoomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .trim(),
  
  roomType: z
    .enum(['single', 'double', 'triple', 'dorm'], {
      errorMap: () => ({ message: 'Room type must be one of: single, double, triple, dorm' })
    }),
  
  totalBeds: z
    .number()
    .int('Total beds must be an integer')
    .min(1, 'Total beds must be at least 1'),
  
  availableBeds: z
    .number()
    .int('Available beds must be an integer')
    .min(0, 'Available beds cannot be negative'),
  
  pricePerBed: z
    .number()
    .positive('Price per bed must be a positive number'),
  
  floor: z
    .number()
    .int('Floor must be an integer')
    .optional(),
  
  amenities: z
    .array(z.string())
    .default([]),
  
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .default([]),
  
  title: z
    .string()
    .min(1, 'Title is required')
    .trim(),
  
  description: z
    .string()
    .optional(),
  
  status: z
    .enum(['available', 'full', 'maintenance'], {
      errorMap: () => ({ message: 'Status must be one of: available, full, maintenance' })
    })
    .default('available'),
  
  isActive: z
    .boolean()
    .default(true)
}).refine(
  (data) => data.availableBeds <= data.totalBeds,
  {
    message: 'Available beds cannot exceed total beds',
    path: ['availableBeds']
  }
);

