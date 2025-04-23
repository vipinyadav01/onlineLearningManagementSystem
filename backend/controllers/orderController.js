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

    const transformedOrders = orders.map(order => {
      if (!order.courseId) {
        console.warn(`Orphaned order found: ${order._id} with missing courseId`);
      }
      return {
        ...order,
        courseTitle: order.courseId?.title || 'Unknown Course',
        courseThumbnail: order.courseId?.thumbnail,
        courseInstructor: order.courseId?.instructor,
        courseId: order.courseId?._id || order.courseId,
      };
    });

    res.status(200).json({
      success: true,
      count: transformedOrders.length,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', { message: error.message, stack: error.stack });
    let errorMessage = 'Error fetching orders';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid user ID format';
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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'courseId',
        select: 'title thumbnail price instructor',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      })
      .sort({ createdAt: -1 })
      .lean();

    const transformedOrders = orders.map(order => {
      if (!order.courseId) {
        console.warn(`Orphaned order found: ${order._id} with missing courseId`);
      }
      if (!order.userId) {
        console.warn(`Orphaned order found: ${order._id} with missing userId`);
      }
      return {
        ...order,
        courseTitle: order.courseId?.title || 'Unknown Course',
        courseThumbnail: order.courseId?.thumbnail,
        courseInstructor: order.courseId?.instructor,
        courseId: order.courseId?._id || order.courseId,
        userName: order.userId?.name || 'Unknown User',
        userEmail: order.userId?.email || 'Unknown Email',
        userId: order.userId?._id || order.userId,
      };
    });

    res.status(200).json({
      success: true,
      count: transformedOrders.length,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching all orders:', { message: error.message, stack: error.stack });
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

exports.getSingleOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
    }

    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id })
      .populate({
        path: 'courseId',
        select: 'title thumbnail price instructor',
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized',
      });
    }

    if (!order.courseId) {
      console.warn(`Orphaned order found: ${order._id} with missing courseId`);
    }

    const transformedOrder = {
      ...order,
      courseTitle: order.courseId?.title || 'Unknown Course',
      courseThumbnail: order.courseId?.thumbnail,
      courseInstructor: order.courseId?.instructor,
      courseId: order.courseId?._id || order.courseId,
    };

    res.status(200).json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error('Error fetching single order:', { message: error.message, stack: error.stack });
    let errorMessage = 'Error fetching order';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid order ID';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getOrderWithPayment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
      paymentId: req.params.paymentId,
    })
      .populate({
        path: 'courseId',
        select: 'title thumbnail price instructor',
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order or payment not found',
      });
    }

    if (!order.courseId) {
      console.warn(`Orphaned order found: ${order._id} with missing courseId`);
    }

    const transformedOrder = {
      ...order,
      courseTitle: order.courseId?.title || 'Unknown Course',
      courseThumbnail: order.courseId?.thumbnail,
      courseInstructor: order.courseId?.instructor,
      courseId: order.courseId?._id || order.courseId,
    };

    res.status(200).json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error('Error fetching order with payment:', { message: error.message, stack: error.stack });
    let errorMessage = 'Error fetching order';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid order or payment ID';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};