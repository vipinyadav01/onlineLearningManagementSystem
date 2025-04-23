const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/my-orders', authMiddleware, orderController.getUserOrders);

router.get('/my-orders/:orderId', authMiddleware, orderController.getSingleOrder);

router.get('/my-orders/:orderId/:paymentId', authMiddleware, orderController.getOrderWithPayment);

router.get('/all-orders', adminMiddleware, orderController.getAllOrders);

module.exports = router;