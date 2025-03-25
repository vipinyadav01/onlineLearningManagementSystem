const Course = require('../models/Course');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const courseData = {
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      whatYouWillLearn: req.body.whatYouWillLearn ? req.body.whatYouWillLearn.split(',') : [],
      prerequisites: req.body.prerequisites ? req.body.prerequisites.split(',') : [],
      curriculum: JSON.parse(req.body.curriculum || '[]'),
      image: imageUrl,
    };

    const course = new Course(courseData);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const courseData = {
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',') : undefined,
      whatYouWillLearn: req.body.whatYouWillLearn ? req.body.whatYouWillLearn.split(',') : undefined,
      prerequisites: req.body.prerequisites ? req.body.prerequisites.split(',') : undefined,
      curriculum: req.body.curriculum ? JSON.parse(req.body.curriculum) : undefined,
      image: imageUrl || undefined,
    };

    const course = await Course.findByIdAndUpdate(req.params.id, courseData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};