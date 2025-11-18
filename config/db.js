const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected Successfully!');
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    console.error('Please check your connection string and network access settings');
    process.exit(1);
  }
};

module.exports = connectDB;