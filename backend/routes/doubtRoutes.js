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
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
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
  authMiddleware, 
  upload.array('attachments', 5), 
  multerErrorHandler, 
  createDoubt
);

router.get(
  '/my-doubts', 
  authMiddleware, 
  getUserDoubts
);

// Admin routes
router.get(
  '/admin',
  authMiddleware,
  adminMiddleware,
  getAllDoubtsAdmin
);

router.get(
  '/admin/single/:id',  
  authMiddleware,
  adminMiddleware,
  getSingleDoubtAdmin
);

router.put(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  updateDoubtAdmin
);

router.get(
  '/admin/stats', 
  authMiddleware,
  adminMiddleware,
  getDoubtStatsAdmin
);

// General error handling
router.use((err, req, res, next) => {
  console.error('Doubt route error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

module.exports = router;