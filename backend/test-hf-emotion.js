import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error('❌ HF_TOKEN not found in .env file');
  process.exit(1);
}

const client = new InferenceClient(HF_TOKEN);

// Test cases with different emotions
const testCases = [
  {
    name: "Happy Entry",
    text: "Today was an amazing day! I finally got the promotion I've been working towards. I feel so grateful and excited about the future. Everything is going perfectly!"
  },
  {
    name: "Sad Entry",
    text: "I'm feeling really down today. Nothing seems to be going right and I miss my family. I feel lonely and unmotivated."
  },
  {
    name: "Anxious Entry",
    text: "I'm so worried about the presentation tomorrow. My heart is racing and I can't stop thinking about all the things that could go wrong. What if I mess up?"
  },
  {
    name: "Angry Entry",
    text: "I'm so frustrated! My boss completely dismissed my ideas in the meeting today. It's infuriating how they never listen to anyone else's opinions."
  },
  {
    name: "Neutral Entry",
    text: "Today was a regular day. I went to work, had lunch, and came back home. Nothing special happened."
  },
  {
    name: "Mixed Emotions",
    text: "I'm excited about the new project but also nervous about the tight deadline. It's a great opportunity but I'm scared I might not be ready for it."
  }
];

async function testEmotionAnalysis() {
  console.log('🤗 Testing Hugging Face Emotion Analysis');
  console.log('=' .repeat(60));
  console.log('');

  for (const testCase of testCases) {
    console.log(`📝 ${testCase.name}`);
    console.log(`Text: "${testCase.text.substring(0, 100)}..."`);
    console.log('');

    try {
      const output = await client.textClassification({
        model: "j-hartmann/emotion-english-distilroberta-base",
        inputs: testCase.text,
      });

      console.log('✅ Results:');
      output.slice(0, 3).forEach((result, idx) => {
        const percentage = (result.score * 100).toFixed(1);
        const bar = '█'.repeat(Math.floor(result.score * 20));
        console.log(`   ${idx + 1}. ${result.label.padEnd(10)} ${percentage}% ${bar}`);
      });
      
      console.log('');
      console.log(`🎯 Top emotion: ${output[0].label} (${(output[0].score * 100).toFixed(1)}% confidence)`);
      
      // Show mapping to our system
      const emotionMap = {
        'joy': { mood: 'happy', sentiment: 'positive' },
        'sadness': { mood: 'sad', sentiment: 'negative' },
        'anger': { mood: 'angry', sentiment: 'negative' },
        'fear': { mood: 'anxious', sentiment: 'negative' },
        'surprise': { mood: 'excited', sentiment: 'positive' },
        'disgust': { mood: 'angry', sentiment: 'negative' },
        'neutral': { mood: 'neutral', sentiment: 'neutral' }
      };
      
      const mapped = emotionMap[output[0].label];
      console.log(`📊 Mapped to system: mood="${mapped.mood}", sentiment="${mapped.sentiment}"`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('');
    console.log('-'.repeat(60));
    console.log('');
  }

  console.log('✅ All tests completed!');
}

// Run tests
testEmotionAnalysis().catch(console.error);
