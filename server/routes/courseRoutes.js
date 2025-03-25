const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createCourse);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCourse);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCourse);

// New route to enroll a user in a course
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const courseId = req.params.id;

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.enrollments.some(enrollment => enrollment.courseId.toString() === courseId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    user.enrollments.push({ courseId });
    await user.save();

    res.json({ message: 'Successfully enrolled', enrollment: { courseId, date: new Date() } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;