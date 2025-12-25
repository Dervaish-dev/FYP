import { InferenceClient } from "@huggingface/inference";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('✅ Testing HuggingFace InferenceClient with trpakov/vit-face-expression\n');

const token = process.env.HF_TOKEN;
console.log('Token:', token ? `EXISTS (${token.length} chars)` : 'NOT FOUND\n');

if (!token) {
  console.error('❌ HF_TOKEN not found');
  process.exit(1);
}

try {
  // Create client
  const client = new InferenceClient(token);
  console.log('✓ InferenceClient created\n');

  // Create minimal test image (1x1 PNG)
  const data = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x62, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  
  console.log('📤 Calling imageClassification...');
  console.log('   Model: trpakov/vit-face-expression');
  console.log('   Provider: hf-inference');
  console.log('   Image size:', data.length, 'bytes\n');
  
  const output = await client.imageClassification({
    data,
    model: "trpakov/vit-face-expression",
    provider: "hf-inference",
  });
  
  console.log('✅ SUCCESS!\n');
  console.log('Results:');
  console.log(JSON.stringify(output, null, 2));
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}
