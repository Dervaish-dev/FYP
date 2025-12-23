import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function checkEmotions() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get total count
    const count = await db.collection('emotionhistories').countDocuments();
    console.log(`📊 Total emotions in DB: ${count}\n`);
    
    // Get last 5 entries
    const emotions = await db.collection('emotionhistories').find({}).sort({ timestamp: -1 }).limit(5).toArray();
    
    console.log('=== Last 5 Emotion Entries ===');
    if (emotions.length === 0) {
      console.log('❌ No emotions found in database');
    } else {
      emotions.forEach((e, i) => {
        console.log(`${i+1}. ${e.emotion} (intensity: ${e.intensity}/10)`);
        console.log(`   User: ${e.userId}`);
        console.log(`   Source: ${e.source}`);
        console.log(`   Confidence: ${e.confidence}`);
        console.log(`   Time: ${new Date(e.timestamp).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check by mock patient userId
    const mockPatientId = '6946df27a8cbe7339319cd79';
    const userEmotions = await db.collection('emotionhistories').countDocuments({ userId: mockPatientId });
    console.log(`🧪 Emotions for mock patient (${mockPatientId}): ${userEmotions}`);
    
    // Get all unique userIds
    const uniqueUsers = await db.collection('emotionhistories').distinct('userId');
    console.log(`\n👥 Unique users with emotions: ${uniqueUsers.length}`);
    uniqueUsers.forEach(uid => console.log(`   - ${uid}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEmotions();
