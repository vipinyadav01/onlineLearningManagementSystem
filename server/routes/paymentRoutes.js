const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Debugging middleware
router.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Fix incorrect route path
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify-payment', authMiddleware, paymentController.verifyPayment);

module.exports = router;
