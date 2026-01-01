import express from 'express';
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/verify-email - Verify user email
router.post('/verify-email', verifyEmail);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password using token
router.post('/reset-password', resetPassword);

// GET /api/auth/me - Get current user data (authenticated)
router.get('/me', authenticate, getMe);

// POST /api/auth/change-password - Change password (authenticated)
router.post('/change-password', authenticate, changePassword);

export default router;

