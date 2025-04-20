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
  refreshToken,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
});

// Public Routes
router.post('/signup', upload.single('profilePic'), signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected Routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.get('/verify-token', authMiddleware, verifyToken);
router.put('/profile', authMiddleware, upload.single('profilePic'), updateProfile);
router.post('/reset-password', authMiddleware, resetPassword);

module.exports = router;