require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

mongoose.connect(process.env.ATLAS_URI).then(async () => {
  const admin = new User({
    name: 'China Gate Admin',
    email: 'admin@chinagate.com', 
    password: 'Admin@123',
    phone: '+961123456789',
    role: 'admin'
  });
  await admin.save();
  console.log('✅ Admin created: admin@chinagate.com / Admin@123');
  process.exit();
});
