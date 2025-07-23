const mongoose = require('mongoose');
const Doubt = require('../models/Doubt');
const Order = require('../models/Order');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to clean up uploaded files on error
const cleanupUploads = async (attachments) => {
  if (!attachments || attachments.length === 0) return;
  
  await Promise.all(
    attachments.map(attachment => 
      cloudinary.uploader.destroy(attachment.public_id)
        .catch(error => 
          console.error('Cleanup error:', error)
        )
    )
  );
};

// Create a new doubt
const createDoubt = async (req, res) => {
  try {
    const { title, description, orderId } = req.body;
    const userId = req.user?.id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated',
        code: 'UNAUTHENTICATED'
      });
    }

    // Validate required fields
    if (!title || !description || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, and order ID are required',
        code: 'MISSING_FIELDS',
        missingFields: {
          title: !title,
          description: !description,
          orderId: !orderId
        }
      });
    }

    // Validate field lengths
    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or less',
        code: 'TITLE_TOO_LONG',
        maxLength: 100,
        currentLength: title.length
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 1000 characters or less',
        code: 'DESCRIPTION_TOO_LONG',
        maxLength: 1000,
        currentLength: description.length
      });
    }

    // Validate order ID format
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order ID format',
        code: 'INVALID_ORDER_ID'
      });
    }

    // Verify the order exists and belongs to the user
    console.log('Validating order:', { orderId, userId });
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: userId
    }).select('status orderNumber productName').lean();

    if (!order) {
      const anyOrder = await Order.findById(orderId).lean();
      if (anyOrder) {
        console.log('Order ownership error:', { orderId, userId, orderOwner: anyOrder.userId });
        return res.status(403).json({
          success: false,
          message: 'Order does not belong to you',
          code: 'ORDER_OWNERSHIP_ERROR',
          suggestion: 'Please select an order from your account'
        });
      }

      console.log('Order not found:', { orderId, userId });
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found in system',
        code: 'ORDER_NOT_FOUND',
        suggestion: 'Please check the order ID and try again'
      });
    }

    // Verify order status
    if (order.status !== 'Success') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is not completed yet',
        code: 'ORDER_NOT_COMPLETED',
        orderStatus: order.status,
        requiredStatus: 'Success',
        orderDetails: {
          orderNumber: order.orderNumber,
          productName: order.productName
        },
        suggestion: 'Please wait until your order is marked as completed'
      });
    }

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      // Validate file count
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 files allowed',
          code: 'TOO_MANY_FILES',
          maxFiles: 5,
          receivedFiles: req.files.length
        });
      }

      // Process each file
      for (const file of req.files) {
        try {
          // Log file info for debugging
          console.log('Uploading file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });

          // Validate file size
          if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              success: false,
              message: `File ${file.originalname} exceeds 5MB limit`,
              code: 'FILE_TOO_LARGE',
              maxSize: '5MB',
              fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
              fileName: file.originalname
            });
          }

          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'auto',
                folder: 'doubts',
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  return reject(error);
                }
                console.log('Cloudinary upload result:', result);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });

          if (result && result.secure_url) {
            attachments.push({
              filename: file.originalname,
              url: result.secure_url,
              mimetype: file.mimetype,
              public_id: result.public_id,
              size: file.size,
            });
          } else {
            console.error('Cloudinary upload did not return a secure_url:', result);
          }
        } catch (uploadError) {
          console.error('Cloudinary upload error (catch):', uploadError);
          await cleanupUploads(attachments);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload attachments',
            code: 'UPLOAD_FAILED',
            fileName: file.originalname,
            error: uploadError.message
          });
        }
      }
    }

    // Create the doubt
    const doubt = new Doubt({
      title: title.trim(),
      description: description.trim(),
      order: orderId,
      user: userId,
      attachments,
      status: 'pending',
    });

    // Save to database
    await doubt.save();

    // Format the response
    const responseData = {
      _id: doubt._id,
      title: doubt.title,
      description: doubt.description,
      status: doubt.status,
      createdAt: doubt.createdAt,
      user: userId,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        productName: order.productName
      },
      attachments: doubt.attachments.map(att => ({
        url: att.url,
        filename: att.filename,
        type: att.mimetype.split('/')[0] || 'file',
        size: att.size
      }))
    };

    return res.status(201).json({ 
      success: true, 
      message: 'Doubt submitted successfully',
      doubt: responseData
    });

  } catch (error) {
    console.error('Error creating doubt:', { 
      message: error.message, 
      stack: error.stack,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format',
        code: 'INVALID_DATA_FORMAT',
        errorDetails: error.message
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errorDetails: error.errors
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      code: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Get user's doubts
const getUserDoubts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated',
        code: 'UNAUTHENTICATED'
      });
    }

    const { status } = req.query;
    const query = { user: userId };
    
    if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
      query.status = status;
    }

    const doubts = await Doubt.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'order',
        select: 'orderNumber productName courseId',
        populate: {
          path: 'courseId',
          select: 'title',
          options: { lean: true }
        },
        options: { lean: true }
      })
      .select('title description status createdAt attachments response resolvedAt')
      .lean();

    const formattedDoubts = doubts.map(doubt => ({
      ...doubt,
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
      courseTitle: doubt.order && doubt.order.courseId && doubt.order.courseId.title ? doubt.order.courseId.title : 'N/A',
      attachments: (doubt.attachments || []).filter(att => att && att.url && typeof att.url === 'string' && att.url.startsWith('http'))
        .map(att => ({
          url: att.url,
          filename: att.filename,
          type: att.mimetype?.split('/')[0] || 'file'
        })) || []
    }));

    res.json({ 
      success: true, 
      data: formattedDoubts,
      count: formattedDoubts.length
    });
  } catch (error) {
    console.error('Error fetching doubts:', { 
      message: error.message, 
      stack: error.stack,
      userId: req.user?.id 
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID',
        code: 'INVALID_USER_ID'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin: Get all doubts
const getAllDoubtsAdmin = async (req, res) => {
  try {
    const { status, userId, orderId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
      query.status = status;
    }

    if (userId && mongoose.isValidObjectId(userId)) {
      query.user = userId;
    }

    if (orderId && mongoose.isValidObjectId(orderId)) {
      query.order = orderId;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { 
          path: 'user', 
          select: 'name email', 
          options: { lean: true } 
        },
        { 
          path: 'order', 
          select: 'orderNumber productName courseId', 
          populate: {
            path: 'courseId',
            select: 'title',
            options: { lean: true }
          },
          options: { lean: true } 
        }
      ],
      lean: true
    };

    const doubts = await Doubt.paginate(query, options);

    const formattedDoubts = {
      ...doubts,
      docs: doubts.docs.map(doubt => ({
        ...doubt,
        user: doubt.user || { name: 'Unknown', email: 'N/A' },
        order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
        // Add courseTitle for admin panel display
        courseTitle: doubt.order && doubt.order.courseId && doubt.order.courseId.title ? doubt.order.courseId.title : 'N/A',
        attachments: (doubt.attachments || []).filter(att => att && att.url && typeof att.url === 'string' && att.url.startsWith('http'))
          .map(att => ({
            url: att.url,
            filename: att.filename,
            type: att.mimetype?.split('/')[0] || 'file',
            size: att.size
          })) || []
      }))
    };

    res.json({ 
      success: true, 
      data: formattedDoubts
    });
  } catch (error) {
    console.error('Error fetching doubts:', { 
      message: error.message, 
      stack: error.stack 
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid query parameters',
        code: 'INVALID_QUERY'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin: Get single doubt
const getSingleDoubtAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doubt ID format',
        code: 'INVALID_DOUBT_ID'
      });
    }

    const doubt = await Doubt.findById(id)
      .populate([
        { 
          path: 'user', 
          select: 'name email', 
          options: { lean: true } 
        },
        { 
          path: 'order', 
          select: 'orderNumber productName courseId', 
          populate: {
            path: 'courseId',
            select: 'title',
            options: { lean: true }
          },
          options: { lean: true } 
        }
      ])
      .lean();

    if (!doubt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    const formattedDoubt = {
      ...doubt,
      user: doubt.user || { name: 'Unknown', email: 'N/A' },
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
      courseTitle: doubt.order && doubt.order.courseId && doubt.order.courseId.title ? doubt.order.courseId.title : 'N/A',
      attachments: (doubt.attachments || []).filter(att => att && att.url && typeof att.url === 'string' && att.url.startsWith('http'))
        .map(att => ({
          url: att.url,
          filename: att.filename,
          type: att.mimetype?.split('/')[0] || 'file',
          size: att.size
        })) || []
    };

    res.json({ 
      success: true, 
      data: formattedDoubt
    });
  } catch (error) {
    console.error('Error fetching doubt:', { 
      message: error.message, 
      stack: error.stack 
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doubt ID',
        code: 'INVALID_DOUBT_ID'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin: Update doubt status/response
const updateDoubtAdmin = async (req, res) => {
  try {
    const { status, response } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required',
        code: 'MISSING_STATUS'
      });
    }

    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value',
        code: 'INVALID_STATUS'
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doubt ID format',
        code: 'INVALID_DOUBT_ID'
      });
    }

    const updateData = {
      status,
      resolvedAt: status === 'resolved' ? Date.now() : undefined
    };

    if (response !== undefined) {
      updateData.response = response;
    }

    const doubt = await Doubt.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate([
        { 
          path: 'user', 
          select: 'name email', 
          options: { lean: true } 
        },
        { 
          path: 'order', 
          select: 'orderNumber productName courseTitle', 
          options: { lean: true } 
        }
      ])
      .lean();

    if (!doubt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    const formattedDoubt = {
      ...doubt,
      user: doubt.user || { name: 'Unknown', email: 'N/A' },
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
      attachments: doubt.attachments?.map(att => ({
        url: att.url,
        filename: att.filename,
        type: att.mimetype?.split('/')[0] || 'file'
      })) || []
    };

    res.json({ 
      success: true, 
      data: formattedDoubt,
      message: 'Doubt updated successfully'
    });
  } catch (error) {
    console.error('Error updating doubt:', { 
      message: error.message, 
      stack: error.stack 
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doubt ID',
        code: 'INVALID_DOUBT_ID'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin: Get doubt statistics
const getDoubtStatsAdmin = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const validTimeRanges = ['week', 'month', 'year', 'all'];
    
    if (timeRange && !validTimeRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time range. Use: week, month, year, or all',
        code: 'INVALID_TIME_RANGE'
      });
    }

    let dateFilter = {};
    if (timeRange === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === 'year') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
    }

    const stats = await Doubt.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = await Doubt.countDocuments(dateFilter);
    const resolved = stats.find(s => s._id === 'resolved')?.count || 0;
    const pending = stats.find(s => s._id === 'pending')?.count || 0;
    const inProgress = stats.find(s => s._id === 'in_progress')?.count || 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: { stats, total, resolved, pending, inProgress, resolutionRate }
    });
  } catch (error) {
    console.error('Error in getDoubtStatsAdmin:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  createDoubt,
  getUserDoubts,
  getAllDoubtsAdmin,
  getSingleDoubtAdmin,
  updateDoubtAdmin,
  getDoubtStatsAdmin,
};