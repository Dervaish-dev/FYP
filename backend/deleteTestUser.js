const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function deleteTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete the test user
    const result = await User.deleteOne({ email: 'dervaishabbas@gmail.com' });
    
    if (result.deletedCount > 0) {
      console.log('Test user deleted successfully!');
    } else {
      console.log('Test user not found.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteTestUser();</content>
<parameter name="filePath">e:\fyp\FYP\backend\deleteTestUser.js