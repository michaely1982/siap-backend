const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    // Check if admin exists
    const adminExists = await User.findOne({ nip: '1234567890' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      nip: '1234567890',
      fullName: 'A. Fathul',
      title: 'Kepala Bidang Arsip',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('NIP: 1234567890');
    console.log('Password: admin123');
    console.log('PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdminUser();