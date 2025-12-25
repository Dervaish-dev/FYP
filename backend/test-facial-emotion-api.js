import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5005/api/emotion/analyze-face';

async function testFacialEmotion() {
  console.log('🧪 Testing HuggingFace Facial Emotion Detection API\n');
  console.log('API Endpoint:', API_URL);
  console.log('─'.repeat(60));

  // Create a simple test image (1x1 pixel PNG - just for testing structure)
  const testImagePath = path.join(__dirname, 'test-emotion-image.png');
  
  // Create a minimal valid PNG file
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixels
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // ...
    0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x62, 0x00, 0x01, 0x00, 0x00, // ...
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // ...
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND
    0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(testImagePath, pngBuffer);
  console.log('✓ Created test image:', testImagePath);

  try {
    // Prepare form data
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    console.log('\n📤 Sending request to API...\n');

    // Send request
    const response = await fetch(API_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    console.log('Status Code:', response.status, response.statusText);
    console.log('─'.repeat(60));

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS! Emotion detected:\n');
      console.log('📊 Results:');
      console.log('  Emotion:', data.emotion);
      console.log('  Confidence:', (data.confidence * 100).toFixed(2) + '%');
      console.log('  Intensity:', data.intensity + '/10');
      console.log('  Timestamp:', data.timestamp);
      
      if (data.allResults && data.allResults.length > 0) {
        console.log('\n📈 All detected emotions:');
        data.allResults.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.emotion}: ${(result.confidence * 100).toFixed(2)}%`);
        });
      }

      console.log('\n✓ Test PASSED - API is working correctly!');
    } else {
      console.log('\n❌ FAILED - API returned an error:\n');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n✗ Test FAILED');
    }

  } catch (error) {
    console.error('\n❌ ERROR during test:\n');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n✗ Test FAILED - Could not connect to API');
    console.log('\nMake sure:');
    console.log('  1. Backend server is running on port 5005');
    console.log('  2. HF_TOKEN is set in backend/.env');
    console.log('  3. @huggingface/inference package is installed');
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🗑️  Cleaned up test image');
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Test completed at:', new Date().toISOString());
}

// Run the test
testFacialEmotion().catch(console.error);
