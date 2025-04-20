const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('API Base URL:', process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`);

// Routes

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/admin/courses', require('./routes/courseRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/reviews', require('./routes/reviewRoutes'));
  app.use('/api/doubts', require('./routes/doubtRoutes')); 

  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
  }
  );
// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});