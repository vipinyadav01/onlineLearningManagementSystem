const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { courseId, amount, idempotencyKey } = req.body;

  // Validate input
  if (!courseId || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: courseId, amount, or idempotencyKey'
    });
  }

  try {
    // Check if course exists and get title
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check for duplicate request using idempotency key
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already exists',
        order: existingOrder
      });
    }

    const shortCourseId = courseId.slice(-8);
    const timestamp = Math.floor(Date.now() / 1000);
    const receipt = `rcpt_${shortCourseId}_${timestamp}`;

    // Create Razorpay order
    const options = {
      amount: amount, // in paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        courseId: courseId,
        userId: req.user.id,
        idempotencyKey: idempotencyKey
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create our database order
    const newOrder = new Order({
      userId: req.user.id,
      courseId: courseId,
      courseTitle: course.title,
      orderId: razorpayOrder.id,
      amount: amount / 100, // convert to rupees
      status: 'Pending',
      idempotencyKey: idempotencyKey,
      receipt: receipt
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      databaseOrder: {
        id: newOrder._id,
        status: newOrder.status
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, idempotencyKey } = req.body;

  try {
    // 1. Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;
    
    // 2. Find the order in our database
    const order = await Order.findOne({ 
      orderId: razorpay_order_id,
      idempotencyKey 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 3. Update based on verification result
    if (isSignatureValid) {
      // Payment successful - update order and add course to user
      const [updatedOrder, updatedUser] = await Promise.all([
        Order.findOneAndUpdate(
          { orderId: razorpay_order_id },
          {
            paymentId: razorpay_payment_id,
            status: 'Success',
            completedAt: new Date()
          },
          { new: true }
        ),
        User.findByIdAndUpdate(
          req.user.id,
          { $addToSet: { courses: courseId } },
          { new: true }
        )
      ]);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder
      });
    } else {
      // Payment failed - update order status
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: 'Failed',
          error: 'Invalid payment signature',
          completedAt: new Date()
        },
        { new: true }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
        order: updatedOrder
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Update order as failed if error occurs
    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: 'Failed',
        error: error.message,
        completedAt: new Date()
      }
    );

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};