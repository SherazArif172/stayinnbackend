import express from 'express';
import { getDashboardStats, getUsers } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/dashboard - Get admin dashboard stats (protected, admin only)
router.get('/dashboard', authenticateAdmin, getDashboardStats);

// GET /api/admin/users - Get all registered users (protected, admin only)
router.get('/users', authenticateAdmin, getUsers);

export default router;

