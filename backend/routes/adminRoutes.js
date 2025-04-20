const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Authentication Routes
router.post('/login', adminController.adminLogin);
router.post('/logout', adminMiddleware, adminController.adminLogout);

// Protected Admin Routes
router.get('/dashboard-stats', adminMiddleware, adminController.getDashboardStats);
router.get('/users', adminMiddleware, adminController.getAllUsers);
router.delete('/users/:userId', adminMiddleware, adminController.deleteUser);
router.get('/enrollments', adminMiddleware, adminController.getEnrollments);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

module.exports = router;