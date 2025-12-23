#!/usr/bin/env node
/**
 * Diagnostic script to check emotion distribution in journal entries
 * Run: node check-emotion-distribution.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health';

async function checkEmotionDistribution() {
  try {
    console.log('\n📊 JOURNAL EMOTION DISTRIBUTION DIAGNOSTIC\n');
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('✅ Connected\n');
    
    // Count total entries
    const totalCount = await db.collection('journalentries').countDocuments();
    console.log(`📊 Total Journal Entries: ${totalCount}\n`);
    
    if (totalCount === 0) {
      console.log('⚠️  No journal entries found. Create some entries first!');
      await mongoose.disconnect();
      return;
    }
    
    // Get emotion distribution
    console.log('📈 Emotion Distribution:');
    const emotions = await db.collection('journalentries')
      .aggregate([
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 },
            percentage: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      .toArray();
    
    if (emotions.length === 0) {
      console.log('  ⚠️  No emotions found (all entries may be corrupted)');
    } else {
      emotions.forEach(e => {
        const percentage = ((e.count / totalCount) * 100).toFixed(1);
        const emotion = e._id || 'NULL';
        console.log(`  ${emotion.padEnd(15)} : ${e.count} entries (${percentage}%)`);
      });
    }
    
    // Categorize emotions
    console.log('\n📊 Categorized Distribution:');
    const positiveEmotions = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic'];
    const negativeEmotions = ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'worried', 'confused', 'lonely', 'frustrated', 'overwhelmed', 'nervous', 'pessimistic'];
    
    const positiveDocs = await db.collection('journalentries')
      .countDocuments({ emotion: { $in: positiveEmotions } });
    const negativeDocs = await db.collection('journalentries')
      .countDocuments({ emotion: { $in: negativeEmotions } });
    const neutralDocs = await db.collection('journalentries')
      .countDocuments({ emotion: 'neutral' });
    
    const posPercent = ((positiveDocs / totalCount) * 100).toFixed(1);
    const negPercent = ((negativeDocs / totalCount) * 100).toFixed(1);
    const neuPercent = ((neutralDocs / totalCount) * 100).toFixed(1);
    
    console.log(`  Positive  : ${positiveDocs} entries (${posPercent}%) ✅`);
    console.log(`  Negative  : ${negativeDocs} entries (${negPercent}%) ❌`);
    console.log(`  Neutral   : ${neutralDocs} entries (${neuPercent}%) ⚪`);
    
    // Check for issues
    console.log('\n🔍 Diagnostic Checks:');
    
    if (neutralDocs === totalCount) {
      console.log('  ❌ ALL ENTRIES ARE NEUTRAL - Emotion detection is failing!');
      console.log('     Check if:');
      console.log('     - Gemini API key is configured');
      console.log('     - Frontend is properly analyzing emotions');
      console.log('     - Keyword fallback is working');
    } else if (neutralDocs > (totalCount * 0.5)) {
      console.log('  ⚠️  MOST ENTRIES ARE NEUTRAL - Emotion detection may be failing');
    } else {
      console.log('  ✅ Good emotion distribution');
    }
    
    // Show sample entries
    console.log('\n📄 Sample Entries:');
    const samples = await db.collection('journalentries')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    samples.forEach((entry, idx) => {
      console.log(`\n  Entry ${idx + 1}:`);
      console.log(`    Emotion: ${entry.emotion}`);
      console.log(`    Content: "${entry.content?.substring(0, 50)}..."`);
      console.log(`    Created: ${entry.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkEmotionDistribution();
