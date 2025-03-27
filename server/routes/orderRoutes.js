const express = require('express');
const router = express.Router();
const { getUserOrders } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/my-orders', authMiddleware, getUserOrders);

module.exports = router;