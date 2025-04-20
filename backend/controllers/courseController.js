const Course = require('../models/Course');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'courses',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
      await fs.unlink(req.file.path); // Clean up temporary file
    }

    const courseData = {
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      whatYouWillLearn: req.body.whatYouWillLearn
        ? req.body.whatYouWillLearn.split(',').map(item => item.trim())
        : [],
      prerequisites: req.body.prerequisites
        ? req.body.prerequisites.split(',').map(item => item.trim())
        : [],
      curriculum: req.body.curriculum ? JSON.parse(req.body.curriculum) : [],
      image: imageUrl,
      price: parseFloat(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      discount: req.body.discount ? parseFloat(req.body.discount) : undefined,
      isBestseller: req.body.isBestseller === 'true',
      isNew: req.body.isNew === 'true',
    };

    const course = new Course(courseData);
    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      course: savedCourse,
      message: 'Course created successfully',
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'courses',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
      await fs.unlink(req.file.path);
    }

    const courseData = {
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : undefined,
      whatYouWillLearn: req.body.whatYouWillLearn
        ? req.body.whatYouWillLearn.split(',').map(item => item.trim())
        : undefined,
      prerequisites: req.body.prerequisites
        ? req.body.prerequisites.split(',').map(item => item.trim())
        : undefined,
      curriculum: req.body.curriculum ? JSON.parse(req.body.curriculum) : undefined,
      image: imageUrl || undefined,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      discount: req.body.discount ? parseFloat(req.body.discount) : undefined,
      isBestseller: req.body.isBestseller === 'true' ? true : req.body.isBestseller === 'false' ? false : undefined,
      isNew: req.body.isNew === 'true' ? true : req.body.isNew === 'false' ? false : undefined,
    };

    const course = await Course.findByIdAndUpdate(req.params.id, courseData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Optionally delete image from Cloudinary if it exists
    if (course.image) {
      const publicId = course.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`courses/${publicId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};