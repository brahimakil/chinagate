require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

// IMPORTANT: Set these environment variables before running this script
// ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE

mongoose.connect(process.env.ATLAS_URI).then(async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('❌ Error: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    process.exit(1);
  }
  
  const admin = new User({
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    phone: process.env.ADMIN_PHONE || '',
    role: 'admin'
  });
  await admin.save();
  console.log('✅ Admin created successfully');
  process.exit();
});
