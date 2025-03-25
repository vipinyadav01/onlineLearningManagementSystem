const express = require('express');
const router = express.Router();
const { getUserLogins, getUserEnrollments } = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Route to get recent user logins
router.get('/users/logins', adminMiddleware, getUserLogins);

// Route to get user enrollments
router.get('/enrollments', adminMiddleware, getUserEnrollments);

module.exports = router;