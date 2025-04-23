const mongoose = require('mongoose');
const Doubt = require('../models/Doubt');
const Order = require('../models/Order');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new doubt
const createDoubt = async (req, res) => {
  try {
    const { title, description, orderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate input
    if (!title || !description || !orderId) {
      return res.status(400).json({ success: false, message: 'Title, description, and orderId are required' });
    }

    // Validate orderId
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // Verify the order belongs to the user
    const order = await Order.findOne({ _id: orderId, user: userId }).select('_id');
    if (!order) {
      return res.status(400).json({ success: false, message: 'Invalid or unauthorized order ID' });
    }

    // Process attachments with Cloudinary
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'doubts',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        attachments.push({
          filename: file.originalname,
          url: result.secure_url,
          mimetype: file.mimetype,
          public_id: result.public_id,
        });
      }
    }

    const doubt = new Doubt({
      title,
      description,
      order: orderId,
      user: userId,
      attachments,
      status: 'pending',
    });

    await doubt.save();
    res.status(201).json({ success: true, data: doubt });
  } catch (error) {
    console.error('Error creating doubt:', { message: error.message, stack: error.stack });
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get user's doubts
const getUserDoubts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const doubts = await Doubt.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber productName')
      .select('title description status createdAt order attachments response');
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error('Error fetching doubts:', { message: error.message, stack: error.stack });
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Admin: Get all doubts
const getAllDoubtsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};

    const doubts = await Doubt.find(query)
      .sort({ createdAt: -1 })
      .populate([
        { path: 'user', select: 'name email', options: { lean: true } },
        { path: 'order', select: 'orderNumber productName', options: { lean: true } },
      ])
      .lean();

    // Clean up null references
    const cleanedDoubts = doubts.map((doubt) => ({
      ...doubt,
      user: doubt.user || { name: 'Unknown', email: 'N/A' },
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
    }));

    res.json({ success: true, data: cleanedDoubts });
  } catch (error) {
    console.error('Error fetching doubts:', { message: error.message, stack: error.stack });
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Admin: Get single doubt
const getSingleDoubtAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doubt ID format' });
    }

    const doubt = await Doubt.findById(id)
      .populate([
        { path: 'user', select: 'name email', options: { lean: true } },
        { path: 'order', select: 'orderNumber productName', options: { lean: true } },
      ])
      .lean();

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Clean up null references
    const cleanedDoubt = {
      ...doubt,
      user: doubt.user || { name: 'Unknown', email: 'N/A' },
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
    };

    res.json({ success: true, data: cleanedDoubt });
  } catch (error) {
    console.error('Error fetching doubt:', { message: error.message, stack: error.stack });
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid doubt ID' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Admin: Update doubt status/response
const updateDoubtAdmin = async (req, res) => {
  try {
    const { status, response } = req.body;
    const { id } = req.params;

    // Validate input
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doubt ID format' });
    }

    const doubt = await Doubt.findByIdAndUpdate(
      id,
      {
        status,
        response,
        resolvedAt: status === 'resolved' ? Date.now() : null,
      },
      { new: true }
    )
      .populate([
        { path: 'user', select: 'name email', options: { lean: true } },
        { path: 'order', select: 'orderNumber productName', options: { lean: true } },
      ])
      .lean();

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Clean up null references
    const cleanedDoubt = {
      ...doubt,
      user: doubt.user || { name: 'Unknown', email: 'N/A' },
      order: doubt.order || { orderNumber: 'N/A', productName: 'N/A' },
    };

    res.json({ success: true, data: cleanedDoubt });
  } catch (error) {
    console.error('Error updating doubt:', { message: error.message, stack: error.stack });
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid doubt ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Admin: Get doubt statistics
const getDoubtStatsAdmin = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const dateFilter = {};

    if (timeRange) {
      const now = new Date();
      if (timeRange === 'week') {
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      } else if (timeRange === 'month') {
        dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      } else if (timeRange === 'year') {
        dateFilter.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
      } else {
        return res.status(400).json({ success: false, message: 'Invalid timeRange value' });
      }
    }

    const [stats, total, resolved, pending, inProgress] = await Promise.all([
      Doubt.aggregate([
        dateFilter.createdAt ? { $match: dateFilter } : {},
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Doubt.countDocuments(dateFilter),
      Doubt.countDocuments({ ...dateFilter, status: 'resolved' }),
      Doubt.countDocuments({ ...dateFilter, status: 'pending' }),
      Doubt.countDocuments({ ...dateFilter, status: 'in_progress' }),
    ]);

    res.json({
      success: true,
      data: {
        stats,
        total,
        resolved,
        pending,
        inProgress,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching doubt stats:', { message: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message || 'Server error' });
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