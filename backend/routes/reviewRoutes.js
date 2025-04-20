const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user; 
    next();
  });
};

// GET all reviews for a course (with user name & image)
router.get('/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate('userId', 'name profilePic')
      .lean();

    const formattedReviews = reviews.map(r => ({
      ...r,
      userName: r.userId.name,
      userImage: r.userId.profilePic,
    }));

    res.json({ success: true, reviews: formattedReviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE a new review
router.post(
  '/',
  authenticateToken,
  [
    body('courseId').isMongoId().withMessage('Invalid course ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const review = new Review({
        courseId: req.body.courseId,
        userId: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment,
      });

      const newReview = await review.save();

      // Fetch populated user data to return
      const populatedReview = await Review.findById(newReview._id)
        .populate('userId', 'name profilePic')
        .lean();

      const responseReview = {
        ...populatedReview,
        userName: populatedReview.userId.name,
        userImage: populatedReview.userId.profilePic,
      };

      res.status(201).json({ success: true, review: responseReview });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this course',
        });
      }
      console.error('Error creating review:', err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// UPDATE a review
router.put(
  '/:id',
  authenticateToken,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().notEmpty().withMessage('Comment cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      if (review.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this review' });
      }

      const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).populate('userId', 'name profilePic').lean();

      const responseReview = {
        ...updatedReview,
        userName: updatedReview.userId.name,
        userImage: updatedReview.userId.profilePic,
      };

      res.json({ success: true, review: responseReview });
    } catch (err) {
      console.error('Error updating review:', err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// DELETE a review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// INCREMENT helpful count
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.helpfulCount += 1;
    const updatedReview = await review.save();

    const populated = await Review.findById(updatedReview._id)
      .populate('userId', 'name profilePic')
      .lean();

    const responseReview = {
      ...populated,
      userName: populated.userId.name,
      userImage: populated.userId.profilePic,
    };

    res.json({ success: true, review: responseReview });
  } catch (err) {
    console.error('Error incrementing helpful count:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
