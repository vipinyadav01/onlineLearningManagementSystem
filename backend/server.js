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

console.log('API Base URL:', process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes')); 

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the API server of TechBits-Academy ' });
});


app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI) // Removed deprecated options
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});