const mongoose = require('mongoose');
require('dotenv').config();

const dropOldIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the old username index
    try {
      await usersCollection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (err) {
      console.log('Index username_1 does not exist or already dropped');
    }

    // Drop email index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Successfully dropped email_1 index');
    } catch (err) {
      console.log('Index email_1 does not exist or already dropped');
    }

    console.log('Done! You can now restart your server.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

dropOldIndexes();