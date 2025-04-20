const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images, PDFs, and Word documents are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Create a new doubt
router.post('/', authenticate, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, orderId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!title || !description || !orderId) {
      return res.status(400).json({ success: false, message: 'Title, description, and orderId are required' });
    }

    // Verify the order belongs to the user
    const order = await Order.findOne({ _id: orderId, user: userId }).select('_id');
    if (!order) {
      return res.status(400).json({ success: false, message: 'Invalid or unauthorized order ID' });
    }

    // Process attachments
    const attachments = req.files?.map((file) => ({
      filename: file.originalname,
      url: `/Uploads/${file.filename}`,
      mimetype: file.mimetype,
    })) || [];

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
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Get user's doubts
router.get('/my-doubts', authenticate, async (req, res) => {
  try {
    console.log('Fetching doubts for user:', req.user.id);
    const doubts = await Doubt.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber productName')
      .select('title description status createdAt order attachments');
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error('Error fetching doubts:', { message: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Get all doubts
router.get('/admin-doubt', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('Fetching admin doubts with query:', req.query);
    const { status } = req.query;
    const query = status ? { status } : {};

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

    console.log('Doubts fetched successfully:', cleanedDoubts.length);
    res.json({ success: true, data: cleanedDoubts });
  } catch (error) {
    console.error('Error fetching doubts:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Get single doubt
router.get('/admin/:id', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('Fetching doubt with ID:', req.params.id);
    const doubt = await Doubt.findById(req.params.id)
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
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Update doubt status/response
router.put('/admin/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, response } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    console.log('Updating doubt:', { id: req.params.id, status, response });
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
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
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Get doubt statistics
router.get('/admin-stats', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('Fetching admin doubt stats');
    const [stats, total, resolved, pending] = await Promise.all([
      Doubt.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Doubt.countDocuments(),
      Doubt.countDocuments({ status: 'resolved' }),
      Doubt.countDocuments({ status: 'pending' }),
    ]);

    console.log('Stats fetched:', { stats, total, resolved, pending });
    res.json({
      success: true,
      data: {
        stats,
        total,
        resolved,
        pending,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching doubt stats:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;