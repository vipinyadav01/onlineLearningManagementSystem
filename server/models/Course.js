const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  instructor: {
    type: String,
    required: [true, 'Instructor is required'],
  },
  instructorTitle: String,
  instructorBio: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  students: {
    type: Number,
    default: 0,
  },
  duration: String,
  lastUpdated: String,
  level: String,
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  originalPrice: Number,
  discount: Number,
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  tags: [String],
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isNewCourse: { // Renamed from isNew
    type: Boolean,
    default: false,
  },
  whatYouWillLearn: [String],
  prerequisites: [String],
  curriculum: [{
    section: String,
    lectures: Number,
    duration: String,
    content: [{
      title: String,
      duration: String,
      isFree: Boolean,
    }],
  }],
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', courseSchema);