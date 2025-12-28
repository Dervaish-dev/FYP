#!/usr/bin/env node
/**
 * Get user ID for test user
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function getUserId(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    const user = await User.findOne({ email });
    if (user) {
      console.log(user._id.toString());
    } else {
      console.error('User not found');
      process.exit(1);
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getUserId('dervaishabbas@gmail.com');
