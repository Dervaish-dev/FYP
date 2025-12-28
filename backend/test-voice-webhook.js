#!/usr/bin/env node

/**
 * Test Voice Journal Webhook
 * Simulates n8n calling our webhook after a voice call completes
 */

import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'http://16.171.134.228:5005';

async function testVoiceWebhook() {
  console.log('🧪 Testing Voice Journal Webhook\n');

  // Test data - simulate what n8n should send
  const testData = {
    userId: '6766b0e2cdc66f4caac9daf8', // Replace with actual test user ID
    callId: 'test-call-' + Date.now(),
    transcript: 'Today I had a good day. I felt happy and accomplished some tasks.',
    duration: 45,
    status: 'completed'
  };

  console.log('📤 Sending webhook data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    const response = await fetch(`${BACKEND_URL}/api/journal/voice/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log(`📥 Response status: ${response.status}`);
    console.log('📥 Response body:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.success) {
      console.log('✅ Webhook test PASSED');
      console.log(`Entry ID: ${result.data?.entryId}`);
      
      // Test status endpoint
      console.log('\n🔍 Testing status endpoint...');
      const statusResponse = await fetch(`${BACKEND_URL}/api/journal/voice/status/${testData.callId}`);
      const statusResult = await statusResponse.json();
      
      console.log('Status response:');
      console.log(JSON.stringify(statusResult, null, 2));
      
      if (statusResult.status === 'completed') {
        console.log('✅ Status endpoint working correctly');
      } else {
        console.log('❌ Status should be "completed" but got:', statusResult.status);
      }
    } else {
      console.log('❌ Webhook test FAILED');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testVoiceWebhook();
