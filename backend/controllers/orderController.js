const Order = require('../models/Order');
const Course = require('../models/Course');

exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
    }

    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: 'courseId',
        select: 'title thumbnail price instructor',
      })
      .sort({ createdAt: -1 })
      .lean();

    const transformedOrders = orders.map(order => ({
      ...order,
      courseTitle: order.courseId?.title || order.courseTitle || 'Unknown Course',
      courseThumbnail: order.courseId?.thumbnail,
      courseInstructor: order.courseId?.instructor,
      courseId: order.courseId?._id || order.courseId, 
    }));

    res.status(200).json({
      success: true,
      count: transformedOrders.length,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    let errorMessage = 'Error fetching orders';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Data validation failed';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};