import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createJournalFromCallReport } from './controllers/voiceJournalController.js';
import CallReport from './models/CallReport.js';

dotenv.config();

async function testVoiceJournalCreation() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the most recent call report
    const callReport = await CallReport.findOne().sort({ created_at: -1 });
    
    if (!callReport) {
      console.log('❌ No call reports found in database');
      process.exit(0);
    }

    console.log('📞 Found call report:', callReport.call_id);
    console.log('📝 Summary:', callReport.summary?.substring(0, 100) + '...');
    console.log('👤 User ID:', callReport.user_id);

    // Reset processed flag for testing
    callReport.processed = false;
    await callReport.save();

    console.log('\n🧪 Testing journal creation...\n');
    
    // Try to create journal
    await createJournalFromCallReport(callReport._id);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testVoiceJournalCreation();
