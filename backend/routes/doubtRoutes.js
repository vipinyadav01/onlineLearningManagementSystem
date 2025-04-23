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
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    
    if (allowedTypes.includes(mimetype)) {
      return cb(null, true);
    }
    
    cb(new Error('Only images (JPEG/PNG), PDFs, and Word documents are allowed'));
  },
});

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds 5MB limit',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 5 files allowed',
        code: 'TOO_MANY_FILES'
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `File upload error: ${err.message}`,
      code: 'UPLOAD_ERROR'
    });
  }
  if (err.message === 'Only images (JPEG/PNG), PDFs, and Word documents are allowed') {
    return res.status(400).json({ 
      success: false, 
      message: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  next(err);
};

// User routes
router.post(
  '/create', 
  authenticate, 
  upload.array('attachments', 5), 
  multerErrorHandler, 
  createDoubt
);

router.get(
  '/my-doubts', 
  authenticate, 
  getUserDoubts
);

// Admin routes
router.get(
  '/admin/doubts', 
  authenticate, 
  isAdmin, 
  getAllDoubtsAdmin
);

router.get(
  '/admin/:id', 
  authenticate, 
  isAdmin, 
  getSingleDoubtAdmin
);

router.put(
  '/admin/:id', 
  authenticate, 
  isAdmin, 
  updateDoubtAdmin
);

router.get(
  '/admin/stats', 
  authenticate, 
  isAdmin, 
  getDoubtStatsAdmin
);

// General error handling
router.use((err, req, res, next) => {
  console.error('Doubt route error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

module.exports = router;