#!/usr/bin/env node

/**
 * Direct test of HuggingFace API to see exactly what it returns
 */

import { InferenceClient } from "@huggingface/inference";
import fs from 'fs';
import https from 'https';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN || "your_huggingface_token_here";

// Download a sample face image for testing
async function downloadTestImage() {
  const testImagePath = path.join(process.cwd(), 'test-happy-face.jpg');
  
  if (fs.existsSync(testImagePath)) {
    console.log('✅ Test image already exists\n');
    return testImagePath;
  }

  console.log('📥 Downloading test image...');
  
  // Use a sample happy face image from the web
  const imageUrl = 'https://raw.githubusercontent.com/dima806/facial_emotions_image_detection/main/happy.jpg';
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(testImagePath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Test image downloaded\n');
        resolve(testImagePath);
      });
    }).on('error', (err) => {
      fs.unlink(testImagePath, () => {});
      console.log('⚠️  Could not download test image. Please add a face photo named "test-happy-face.jpg"\n');
      reject(err);
    });
  });
}

async function testHuggingFace() {
  console.log('🧪 Testing HuggingFace Facial Emotion Detection API\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get test image
    let imagePath;
    try {
      imagePath = await downloadTestImage();
    } catch {
      // If download fails, look for any test image
      imagePath = path.join(process.cwd(), 'test-face.jpg');
      if (!fs.existsSync(imagePath)) {
        console.error('❌ No test image found. Please add "test-face.jpg" or "test-happy-face.jpg"');
        process.exit(1);
      }
    }

    console.log('📤 REQUEST TO HUGGINGFACE:');
    console.log('─────────────────────────────');
    console.log(`Model: dima806/facial_emotions_image_detection`);
    console.log(`Image: ${path.basename(imagePath)}`);
    console.log(`Size: ${fs.statSync(imagePath).size} bytes`);
    console.log('');

    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);

    // Initialize HuggingFace client
    console.log('🔌 Connecting to HuggingFace API...\n');
    const client = new InferenceClient(HF_TOKEN);

    // Call the API
    console.log('⏳ Analyzing image...\n');
    const startTime = Date.now();
    
    const output = await client.imageClassification({
      data: imageBuffer,
      model: "dima806/facial_emotions_image_detection",
    });
    
    const duration = Date.now() - startTime;

    // Show RAW response
    console.log('📥 RAW RESPONSE FROM HUGGINGFACE:');
    console.log('═══════════════════════════════════════════════════');
    console.log(JSON.stringify(output, null, 2));
    console.log('');

    // Show response type
    console.log('📊 RESPONSE ANALYSIS:');
    console.log('─────────────────────────────');
    console.log(`Type: ${Array.isArray(output) ? 'Array' : typeof output}`);
    console.log(`Length: ${output.length} items`);
    console.log(`Processing time: ${duration}ms`);
    console.log('');

    // Show each result
    console.log('🎯 DETECTED EMOTIONS (sorted by confidence):');
    console.log('─────────────────────────────');
    output.forEach((item, index) => {
      const percent = (item.score * 100).toFixed(2);
      const bar = '█'.repeat(Math.round(item.score * 50));
      console.log(`${index + 1}. ${item.label.toUpperCase().padEnd(12)} ${percent}% ${bar}`);
    });
    console.log('');

    // Show what we extract
    const topResult = output[0];
    console.log('✅ WHAT WE USE IN THE APP:');
    console.log('─────────────────────────────');
    console.log(`Top Emotion: ${topResult.label}`);
    console.log(`Confidence: ${(topResult.score * 100).toFixed(1)}%`);
    console.log(`Intensity (1-10): ${Math.max(1, Math.min(10, Math.round(topResult.score * 10)))}`);
    console.log('');

    // Show the mapping
    console.log('🔄 EMOTION MAPPING:');
    console.log('─────────────────────────────');
    const emotionMap = {
      'angry': 'Angry',
      'disgust': 'Disgusted', 
      'fear': 'Worried',
      'happy': 'Happy',
      'sad': 'Sad',
      'surprise': 'Surprised',
      'neutral': 'Neutral'
    };
    console.log('HuggingFace → App:');
    Object.entries(emotionMap).forEach(([hf, app]) => {
      console.log(`  ${hf.padEnd(12)} → ${app}`);
    });
    console.log('');

    console.log('✅ TEST COMPLETE!\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testHuggingFace();
