import User from '../models/User.js';

/**
 * Get admin dashboard stats
 * GET /api/admin/dashboard
 * Protected route - admin only (uses authenticateAdmin middleware)
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

