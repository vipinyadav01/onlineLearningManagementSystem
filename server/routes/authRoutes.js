const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  verifyToken,
  updateProfile,
  resetPassword,
} = require('../controllers/authController');

const { authMiddleware } = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup', signup);
router.post('/login', login);

// Protected Routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.get('/verify-token', authMiddleware, verifyToken);
router.put('/profile', authMiddleware, updateProfile);
router.post('/reset-password', authMiddleware, resetPassword);

module.exports = router;
