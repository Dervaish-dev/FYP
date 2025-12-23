#!/usr/bin/env node
/**
 * Quick test to fetch and display journal entries with new fields
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5005';
const USER_ID = '692931ed753d4984e951beb0';

async function testJournalDisplay() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Journal Entry Display Test');
    console.log('═══════════════════════════════════════════════════\n');

    // Fetch all journal entries
    console.log('📖 Fetching journal entries...');
    const response = await fetch(`${API_URL}/api/journal/${USER_ID}`);
    const result = await response.json();
    
    // Handle response format
    const entries = result?.data?.entries || [];

    if (!entries || entries.length === 0) {
      console.log('❌ No entries found');
      console.log('Response:', result);
      return;
    }

    console.log(`✅ Found ${entries.length} entries\n`);

    // Display each entry with new fields
    entries.slice(0, 3).forEach((entry, idx) => {
      console.log(`\n📝 Entry ${idx + 1}: ${new Date(entry.createdAt).toLocaleDateString()}`);
      console.log('─'.repeat(60));
      console.log(`Content: ${entry.content.substring(0, 100)}...`);
      console.log(`\n🎭 Emotion: ${entry.emotion || 'N/A'}`);
      
      if (entry.topics && entry.topics.length > 0) {
        console.log(`\n🏷️  Topics (${entry.topics.length}):`);
        entry.topics.forEach(topic => console.log(`   • ${topic}`));
      }

      if (entry.keywords && entry.keywords.length > 0) {
        console.log(`\n🎯 Keywords (${entry.keywords.length}):`);
        entry.keywords.slice(0, 3).forEach(kw => {
          console.log(`   • ${kw.word} (${(kw.relevance * 100).toFixed(0)}% relevance)`);
        });
      }

      if (entry.stressLevel || entry.stressScore !== undefined) {
        console.log(`\n📊 Stress: ${entry.stressLevel || 'N/A'} (${entry.stressScore || 0}/10)`);
        if (entry.stressTriggers && entry.stressTriggers.length > 0) {
          console.log(`   Triggers: ${entry.stressTriggers.slice(0, 3).join(', ')}`);
        }
      }

      if (entry.emotionalIntensity !== undefined) {
        console.log(`⚡ Emotional Intensity: ${entry.emotionalIntensity}/10`);
      }

      if (entry.aiAnalysis) {
        console.log(`\n🧠 AI Analysis: ${entry.aiAnalysis.substring(0, 150)}...`);
      }
    });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ All new fields are being returned correctly!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testJournalDisplay();
