// Run this once in your backend (e.g., in a setup script or console)
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  const admin = new User({
    name: 'Vipin Yadav Admin',
    email: 'admin@example.com',
    password: 'adminpassword123', 
    isAdmin: true,
  });
  
  await admin.save();
  console.log('Admin user created');
  mongoose.connection.close();
}

createAdmin().catch(console.error);