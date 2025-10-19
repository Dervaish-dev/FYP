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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'dervaishabbas@gmail.com' });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      console.log('You can now login with:');
      console.log('Email: dervaishabbas@gmail.com');
      console.log('Password: 1224E4bd');
    } else {
      // Create new user
      const user = new User({
        name: 'Dervaish Abbas',
        email: 'dervaishabbas@gmail.com',
        password: '1224E4bd'
      });

      await user.save();
      console.log('Test user created successfully!');
      console.log('Email: dervaishabbas@gmail.com');
      console.log('Password: 1224E4bd');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();
