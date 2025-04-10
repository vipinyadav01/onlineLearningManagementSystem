const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { courseId, amount } = req.body;

  try {
    // Create a shorter receipt ID that won't exceed 40 characters
    // Use the last 8 chars of courseId + timestamp in seconds instead of milliseconds
    const shortCourseId = courseId.slice(-8);
    const timestamp = Math.floor(Date.now() / 1000);
    const receipt = `rcpt_${shortCourseId}_${timestamp}`;
    
    const options = {
      amount: amount, 
      currency: 'INR',
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    // Save initial order to database
    const newOrder = new Order({
      userId: req.user.id, 
      courseId,
      orderId: order.id,
      amount: amount / 100, 
      status: 'Pending',
    });
    await newOrder.save();

    res.status(200).json({
      success: true,
      id: order.id,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Update order status in database
      const order = await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          status: 'Success',
        },
        { new: true }
      );

      // Optionally enroll user in course
      // await enrollUserInCourse(req.user.id, courseId);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'Failed' }
      );
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'Failed' }
    );
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};
