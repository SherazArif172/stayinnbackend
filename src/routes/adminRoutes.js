import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/dashboard - Get admin dashboard stats (protected, admin only)
router.get('/dashboard', authenticateAdmin, getDashboardStats);

export default router;

