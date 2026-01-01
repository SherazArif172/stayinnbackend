import express from 'express';
import { adminLogin, getDashboardStats } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', adminLogin);

// GET /api/admin/dashboard - Get admin dashboard stats (protected)
router.get('/dashboard', authenticateAdmin, getDashboardStats);

export default router;

