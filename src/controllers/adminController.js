import User from '../models/User.js';

/**
 * Get all registered users (admin only)
 * GET /api/admin/users
 * Returns user list without password; optional pagination via query params
 */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (role && (role === 'user' || role === 'admin')) filter.role = role;
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { fullName: new RegExp(term, 'i') },
        { email: new RegExp(term, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerifyToken -emailVerifyTokenExpiry -resetPasswordToken -resetPasswordExpiry -cnicFront -cnicBack')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    res.json({
      success: true,
      users,
      total,
      page: pageNum,
      pages: totalPages,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message,
    });
  }
};

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

