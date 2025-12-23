import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Missing Mongo connection string. Set MONGO_URI or MONGODB_URI.');
    }

    const conn = await mongoose.connect(mongoUri);
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
