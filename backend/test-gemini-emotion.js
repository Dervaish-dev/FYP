#!/usr/bin/env node
/**
 * Test Gemini API directly to verify it's working
 * Run: node test-gemini-emotion.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('\n🧪 GEMINI API EMOTION ANALYSIS TEST\n');

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file!');
  console.error('   Please set GEMINI_API_KEY in /backend/.env');
  process.exit(1);
}

console.log('✅ API Key found:', API_KEY.substring(0, 20) + '...\n');

const testAnalyzeEmotion = async () => {
  try {
    console.log('🔄 Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Model initialized: gemini-2.0-flash\n');

    const testEntries = [
      {
        text: "I'm so happy and excited! Had an amazing day with wonderful friends.",
        expectedMood: 'happy'
      },
      {
        text: "Feeling really stressed and overwhelmed with everything. Nothing seems to be working out.",
        expectedMood: 'stressed/anxious'
      },
      {
        text: "Just a regular day, nothing special happened. Same routine.",
        expectedMood: 'neutral'
      }
    ];

    for (const test of testEntries) {
      console.log(`\n📝 Testing: "${test.text.substring(0, 50)}..."`);
      console.log(`Expected mood: ${test.expectedMood}`);
      console.log('---');

      const prompt = `
Analyze this journal entry and provide a detailed psychological and emotional analysis.

Journal Entry: "${test.text}"

Provide your analysis in the following JSON format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "sentimentConfidence": 0.0-1.0,
  "mood": "happy" | "sad" | "anxious" | "calm" | "angry" | "peaceful" | "excited" | "worried" | "confused" | "depressed" | "stressed" | "neutral",
  "stressLevel": "low" | "medium" | "high",
  "stressScore": 0-10,
  "emotionalIntensity": 0-10,
  "topics": ["topic1", "topic2", "topic3"],
  "keywords": [{"word": "keyword", "relevance": 0.0-1.0}],
  "stressTriggers": ["trigger1", "trigger2"],
  "summary": "Brief summary"
}

Return ONLY the JSON object, no additional text.`;

      try {
        console.log('📡 Sending to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('📄 Raw response:', text.substring(0, 150) + '...');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed successfully:');
          console.log(`   Mood: ${parsed.mood}`);
          console.log(`   Sentiment: ${parsed.sentiment} (confidence: ${parsed.sentimentConfidence})`);
          console.log(`   Stress Score: ${parsed.stressScore}/10`);
          console.log(`   Emotional Intensity: ${parsed.emotionalIntensity}/10`);
          console.log(`   Topics: ${parsed.topics.join(', ')}`);
        } else {
          console.error('❌ Could not extract JSON from response');
          console.error('Response:', text);
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    }

    console.log('\n✅ TEST COMPLETE\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

testAnalyzeEmotion();
