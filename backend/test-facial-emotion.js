#!/usr/bin/env node

/**
 * Test Hugging Face Facial Emotion Detection
 */

import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testFacialEmotion() {
  console.log('🧪 Testing Hugging Face Facial Emotion Detection\n');

  // Check if test image exists, if not, download a sample
  const testImagePath = path.join(process.cwd(), 'test-face.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️  No test-face.jpg found. Please add a test image with a face.');
    console.log('You can use any facial photo for testing.\n');
    return;
  }

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    console.log('📤 Sending image to /api/emotion/analyze-face...');

    const response = await fetch(`${BACKEND_URL}/api/emotion/analyze-face`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();

    console.log(`📥 Response status: ${response.status}\n`);

    if (response.ok) {
      console.log('✅ Facial emotion detection SUCCESS!\n');
      console.log('🎯 Top Result:');
      console.log(`   Emotion: ${result.emotion}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Intensity: ${result.intensity}/10`);
      
      if (result.allResults && result.allResults.length > 1) {
        console.log('\n📊 All detected emotions:');
        result.allResults.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.emotion}: ${(r.confidence * 100).toFixed(1)}%`);
        });
      }
    } else {
      console.log('❌ Detection FAILED');
      console.log('Error:', result.message || result.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testFacialEmotion();
