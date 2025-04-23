const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create JWT Token with consistent expiration time
const createToken = (userId, role = 'admin') => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } 
  );
};

// Admin Login Controller
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Use createToken for consistency and include an admin ID
    const token = createToken('admin-user', 'admin');

    // Set token expiry time for frontend reference
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    return res.status(200).json({ 
      success: true, 
      token,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('💥 Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a token verification endpoint
exports.verifyToken = async (req, res) => {
  try {
    // The adminMiddleware already verified the token, so we can just return success
    return res.status(200).json({ 
      success: true, 
      message: 'Token is valid',
      user: { role: req.user.role }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Dashboard Statistics Controller
// [Rest of your controller code remains the same]
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, recentUsers, userEnrollments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([
        { $unwind: { path: '$enrollments', preserveNullAndEmptyArrays: true } },
        { $match: { 'enrollments.courseId': { $ne: null } } },
        { $group: {
          _id: '$enrollments.courseId',
          totalEnrollments: { $sum: 1 }
        }},
        { $sort: { totalEnrollments: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        recentUsers,
        topCourses: userEnrollments
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics"
    });
  }
};

// User Management Controllers
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ createdAt: -1 }),
      User.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};

// User Deletion Controller
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting user"
    });
  }
};

// Logout Controller
exports.adminLogout = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
};

// Get Enrollments Controller
exports.getEnrollments = async (req, res) => {
  try {
    const users = await User.find().select('email enrollments').populate('enrollments.courseId', 'title');
    const enrollments = users.flatMap(user =>
      user.enrollments.map(enrollment => ({
        username: user.email,
        course: enrollment.courseId?.title || 'Unknown Course',
        date: enrollment.date || new Date()
      }))
    );
    res.status(200).json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Get Enrollments Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollments"
    });
  }
};

module.exports = exports;