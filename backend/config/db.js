import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue running without database connection');
    console.log('📝 Emotion analysis will work, but user authentication features will be limited');
    throw error; // Re-throw so server can handle it
  }
};

export default connectDB;
