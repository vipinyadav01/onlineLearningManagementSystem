const express = require('express');
const router = express.Router();
const {
  createDoubt,
  getUserDoubts,
  getAllDoubtsAdmin,
  getSingleDoubtAdmin,
  updateDoubtAdmin,
  getDoubtStatsAdmin,
} = require('../controllers/doubtController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup for memory storage (files will be uploaded to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and Word documents are allowed'));
  },
});

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  }
  if (err.message === 'Only images, PDFs, and Word documents are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

// Routes
router.post('/', authenticate, upload.array('attachments', 5), multerErrorHandler, createDoubt);
router.get('/my-doubts', authenticate, getUserDoubts);
router.get('/admin/doubts', authenticate, isAdmin, getAllDoubtsAdmin);
router.get('/admin/:id', authenticate, isAdmin, getSingleDoubtAdmin);
router.put('/admin/:id', authenticate, isAdmin, updateDoubtAdmin);
router.get('/admin/stats', authenticate, isAdmin, getDoubtStatsAdmin);

// General error handling
router.use((err, req, res, next) => {
  console.error('Doubt route error:', err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

module.exports = router;