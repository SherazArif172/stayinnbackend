import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { adminLoginSchema } from '../validations/authValidation.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Admin login
 * POST /api/admin/login
 * Only admins can login through this endpoint
 */
export const adminLogin = async (req, res) => {
  try {
    // Validate request body
    const validationResult = adminLoginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in.',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token with admin role
    const token = generateToken({ 
      userId: user._id.toString(),
      role: user.role 
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin login failed. Please try again.',
      message: error.message,
    });
  }
};

/**
 * Get admin dashboard stats
 * GET /api/admin/dashboard
 * Protected route - admin only
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ 
      role: 'user', 
      isEmailVerified: true 
    });
    const unverifiedUsers = await User.countDocuments({ 
      role: 'user', 
      isEmailVerified: false 
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          unverified: unverifiedUsers,
        },
        admins: {
          total: totalAdmins,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message,
    });
  }
};

