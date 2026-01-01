import express from 'express';
import { createRoom, getAllRooms, getRoomById, getRoomBySlug } from '../controllers/roomController.js';

const router = express.Router();

// POST /api/rooms - Create a new room
router.post('/', createRoom);

// GET /api/rooms - Get all rooms
router.get('/', getAllRooms);

// GET /api/rooms/id/:id - Get room by ID (must be before :slug route)
router.get('/:id', getRoomById);

// GET /api/rooms/:slug - Get room by slug
router.get('/:slug', getRoomBySlug);

export default router;

