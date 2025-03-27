const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Admin routes
router.post('/', adminMiddleware, upload.single('image'), createCourse);
router.put('/:id', adminMiddleware, upload.single('image'), updateCourse);
router.delete('/:id', adminMiddleware, deleteCourse);

// Enrollment route
router.post('/:id/enroll', adminMiddleware, async (req, res) => {
  // ... existing enrollment logic ...
});

module.exports = router;