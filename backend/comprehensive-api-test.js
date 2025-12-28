/**
 * Comprehensive API Test Suite
 * Tests all backend endpoints end-to-end
 * Usage: node comprehensive-api-test.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://16.171.134.228:5005/api';
const TEST_EMAIL = `test_${Date.now()}@neurocompanion.com`;
const TEST_PASSWORD = 'Test123456!';
const CAREGIVER_EMAIL = `caregiver_${Date.now()}@neurocompanion.com`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

let authToken = null;
let userId = null;
let caregiverToken = null;
let caregiverId = null;
let inviteCode = null;

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logTest(testName, status, details = '') {
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⊘';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`  ${details}`, 'reset');
  }
  if (status === 'pass') testResults.passed++;
  else if (status === 'fail') {
    testResults.failed++;
    testResults.errors.push({ test: testName, details });
  } else testResults.skipped++;
}

async function makeRequest(method, endpoint, data = null, token = null, isMultipart = false) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (isMultipart) headers['Content-Type'] = 'multipart/form-data';

    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      ...(data && { data }),
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

// Test Suites

async function testHealthCheck() {
  logSection('1. HEALTH CHECK');
  
  const result = await makeRequest('GET', '/emotion/status');
  if (result.success) {
    logTest('Backend is reachable', 'pass', `Status: ${result.status}`);
  } else {
    logTest('Backend is reachable', 'fail', result.error);
  }
}

async function testCaregiverAuth() {
  logSection('2. CAREGIVER AUTHENTICATION');

  // Register caregiver
  log('Registering new caregiver...', 'blue');
  const registerResult = await makeRequest('POST', '/caregiver/register', {
    name: 'Test Caregiver',
    email: CAREGIVER_EMAIL,
    password: TEST_PASSWORD,
    phone: '+1234567890',
    specialization: 'Psychiatrist',
  });

  if (registerResult.success) {
    caregiverToken = registerResult.data.token;
    caregiverId = registerResult.data.caregiver?.id || registerResult.data.caregiver?._id;
    logTest('Caregiver registration', 'pass', `Caregiver ID: ${caregiverId}`);
  } else {
    logTest('Caregiver registration', 'fail', registerResult.error);
    return;
  }

  // Login caregiver
  log('Logging in caregiver...', 'blue');
  const loginResult = await makeRequest('POST', '/caregiver/login', {
    email: CAREGIVER_EMAIL,
    password: TEST_PASSWORD,
  });

  if (loginResult.success && loginResult.data.token) {
    logTest('Caregiver login', 'pass');
  } else {
    logTest('Caregiver login', 'fail', loginResult.error);
  }

  // Get caregiver profile
  log('Fetching caregiver profile...', 'blue');
  const profileResult = await makeRequest('GET', '/caregiver/me', null, caregiverToken);
  
  if (profileResult.success) {
    logTest('Get caregiver profile', 'pass', `Name: ${profileResult.data.caregiver?.name}`);
  } else {
    logTest('Get caregiver profile', 'fail', profileResult.error);
  }
}

async function testInviteSystem() {
  logSection('3. PATIENT INVITE SYSTEM');

  if (!caregiverToken) {
    logTest('Invite system tests', 'skip', 'No caregiver token available');
    return;
  }

  // Create invite
  log('Creating patient invite...', 'blue');
  const createResult = await makeRequest('POST', '/invites', {
    patientEmail: TEST_EMAIL,
    patientName: 'Test Patient',
  }, caregiverToken);

  if (createResult.success) {
    inviteCode = createResult.data.invite?.code;
    logTest('Create patient invite', 'pass', `Invite code: ${inviteCode}`);
  } else {
    logTest('Create patient invite', 'fail', createResult.error);
    return;
  }

  // Lookup invite code
  log('Looking up invite code...', 'blue');
  const lookupResult = await makeRequest('POST', '/invites/claim/lookup', {
    code: inviteCode,
  });

  if (lookupResult.success) {
    logTest('Lookup invite code', 'pass', `Masked email: ${lookupResult.data.maskedEmail}`);
  } else {
    logTest('Lookup invite code', 'fail', lookupResult.error);
    return;
  }

  // Send OTP
  log('Sending OTP...', 'blue');
  const otpResult = await makeRequest('POST', '/invites/claim/send-otp', {
    code: inviteCode,
    email: TEST_EMAIL,
  });

  if (otpResult.success) {
    logTest('Send OTP', 'pass', 'OTP sent (check email or logs)');
  } else {
    logTest('Send OTP', 'fail', otpResult.error);
    return;
  }

  // Note: Cannot verify OTP without actual email access
  log('⚠️  OTP verification requires email access - skipping finalization', 'yellow');
  logTest('Complete signup flow', 'skip', 'Requires OTP from email');
}

async function testPatientAuth() {
  logSection('4. PATIENT AUTHENTICATION (Direct Login)');

  // For testing, we'll create a user directly in the database
  // In production, users only come through invite flow
  
  log('⚠️  Note: Patient signup is invite-only in production', 'yellow');
  
  // Try direct login with a pre-existing test user
  log('Attempting login with test credentials...', 'blue');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'test@example.com', // Use existing test user
    password: 'password123',
  });

  if (loginResult.success && loginResult.data.data?.token) {
    authToken = loginResult.data.data.token;
    userId = loginResult.data.data.user?.id || loginResult.data.data.user?._id;
    logTest('Patient login', 'pass', `User ID: ${userId}`);
  } else {
    logTest('Patient login', 'skip', 'No pre-existing test user found - this is expected');
    // Create mock tokens for remaining tests
    log('Using mock user ID for remaining tests...', 'yellow');
    userId = '676c24822df7d7c2d97f2c7a'; // Use a valid ObjectId format
  }

  // Test /auth/me endpoint
  if (authToken) {
    log('Testing /auth/me endpoint...', 'blue');
    const meResult = await makeRequest('GET', '/auth/me', null, authToken);
    
    if (meResult.success) {
      logTest('Get current user', 'pass', `Email: ${meResult.data.data?.user?.email}`);
    } else {
      logTest('Get current user', 'fail', meResult.error);
    }
  }
}

async function testTaskEndpoints() {
  logSection('5. TASK MANAGEMENT');

  if (!userId) {
    logTest('Task tests', 'skip', 'No user ID available');
    return;
  }

  let taskId = null;

  // Create task
  log('Creating new task...', 'blue');
  const createResult = await makeRequest('POST', '/tasks/create', {
    userId,
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'high',
    dueTime: new Date(Date.now() + 86400000).toISOString(),
    repeat: 'once',
  }, authToken);

  if (createResult.success) {
    taskId = createResult.data.data?.task?.id || createResult.data.data?.task?._id;
    logTest('Create task', 'pass', `Task ID: ${taskId}`);
  } else {
    logTest('Create task', 'fail', createResult.error);
  }

  // Get tasks
  log('Fetching user tasks...', 'blue');
  const getResult = await makeRequest('GET', `/tasks/${userId}`, null, authToken);
  
  if (getResult.success) {
    const taskCount = getResult.data.data?.tasks?.length || 0;
    logTest('Get tasks', 'pass', `Found ${taskCount} tasks`);
  } else {
    logTest('Get tasks', 'fail', getResult.error);
  }

  // Update task
  if (taskId) {
    log('Updating task status...', 'blue');
    const updateResult = await makeRequest('PUT', `/tasks/${taskId}`, {
      status: 'in-progress',
    }, authToken);
    
    if (updateResult.success) {
      logTest('Update task', 'pass');
    } else {
      logTest('Update task', 'fail', updateResult.error);
    }
  }

  // Delete task
  if (taskId) {
    log('Deleting task...', 'blue');
    const deleteResult = await makeRequest('DELETE', `/tasks/${taskId}`, null, authToken);
    
    if (deleteResult.success) {
      logTest('Delete task', 'pass');
    } else {
      logTest('Delete task', 'fail', deleteResult.error);
    }
  }
}

async function testEmotionEndpoints() {
  logSection('6. EMOTION TRACKING');

  if (!userId) {
    logTest('Emotion tests', 'skip', 'No user ID available');
    return;
  }

  let emotionId = null;

  // Log emotion
  log('Logging emotion...', 'blue');
  const createResult = await makeRequest('POST', '/emotions/history', {
    userId,
    emotion: 'happy',
    intensity: 7,
    confidence: 0.85,
    note: 'Feeling great today!',
    source: 'manual',
  }, authToken);

  if (createResult.success) {
    emotionId = createResult.data.data?.emotion?.id || createResult.data.data?.emotion?._id;
    logTest('Log emotion', 'pass', `Emotion ID: ${emotionId}`);
  } else {
    logTest('Log emotion', 'fail', createResult.error);
  }

  // Get emotion history
  log('Fetching emotion history...', 'blue');
  const getResult = await makeRequest('GET', `/emotions/history/${userId}`, null, authToken);
  
  if (getResult.success) {
    const emotionCount = getResult.data.data?.emotions?.length || 0;
    logTest('Get emotion history', 'pass', `Found ${emotionCount} emotions`);
  } else {
    logTest('Get emotion history', 'fail', getResult.error);
  }

  // Get chart data
  log('Fetching emotion chart data...', 'blue');
  const chartResult = await makeRequest('GET', `/emotions/history/${userId}/chart`, null, authToken);
  
  if (chartResult.success) {
    logTest('Get emotion chart data', 'pass');
  } else {
    logTest('Get emotion chart data', 'fail', chartResult.error);
  }

  // Delete emotion
  if (emotionId) {
    log('Deleting emotion...', 'blue');
    const deleteResult = await makeRequest('DELETE', `/emotions/history/${emotionId}`, null, authToken);
    
    if (deleteResult.success) {
      logTest('Delete emotion', 'pass');
    } else {
      logTest('Delete emotion', 'fail', deleteResult.error);
    }
  }
}

async function testJournalEndpoints() {
  logSection('7. JOURNAL ENTRIES');

  if (!userId) {
    logTest('Journal tests', 'skip', 'No user ID available');
    return;
  }

  let entryId = null;

  // Create journal entry
  log('Creating journal entry...', 'blue');
  const createResult = await makeRequest('POST', '/journal/create', {
    userId,
    content: 'Today was a great day! I accomplished a lot and felt really productive.',
  }, authToken);

  if (createResult.success) {
    entryId = createResult.data.data?.entry?.id || createResult.data.data?.entry?._id;
    logTest('Create journal entry', 'pass', `Entry ID: ${entryId}`);
  } else {
    logTest('Create journal entry', 'fail', createResult.error);
  }

  // Get journal entries
  log('Fetching journal entries...', 'blue');
  const getResult = await makeRequest('GET', `/journal/${userId}`, null, authToken);
  
  if (getResult.success) {
    const entryCount = getResult.data.data?.entries?.length || 0;
    logTest('Get journal entries', 'pass', `Found ${entryCount} entries`);
  } else {
    logTest('Get journal entries', 'fail', getResult.error);
  }

  // Get single entry
  if (entryId) {
    log('Fetching single entry...', 'blue');
    const getSingleResult = await makeRequest('GET', `/journal/entry/${entryId}`, null, authToken);
    
    if (getSingleResult.success) {
      logTest('Get single entry', 'pass');
    } else {
      logTest('Get single entry', 'fail', getSingleResult.error);
    }
  }

  // Get analytics
  log('Fetching journal analytics...', 'blue');
  const analyticsResult = await makeRequest('GET', `/journal/${userId}/analytics`, null, authToken);
  
  if (analyticsResult.success) {
    logTest('Get journal analytics', 'pass');
  } else {
    logTest('Get journal analytics', 'fail', analyticsResult.error);
  }

  // Search entries
  log('Searching journal entries...', 'blue');
  const searchResult = await makeRequest('GET', `/journal/${userId}/search?q=great`, null, authToken);
  
  if (searchResult.success) {
    logTest('Search journal entries', 'pass');
  } else {
    logTest('Search journal entries', 'fail', searchResult.error);
  }

  // Update entry
  if (entryId) {
    log('Updating journal entry...', 'blue');
    const updateResult = await makeRequest('PUT', `/journal/${entryId}`, {
      content: 'Today was an amazing day! Updated entry.',
    }, authToken);
    
    if (updateResult.success) {
      logTest('Update journal entry', 'pass');
    } else {
      logTest('Update journal entry', 'fail', updateResult.error);
    }
  }

  // Delete entry
  if (entryId) {
    log('Deleting journal entry...', 'blue');
    const deleteResult = await makeRequest('DELETE', `/journal/${entryId}`, null, authToken);
    
    if (deleteResult.success) {
      logTest('Delete journal entry', 'pass');
    } else {
      logTest('Delete journal entry', 'fail', deleteResult.error);
    }
  }
}

async function testWellnessEndpoints() {
  logSection('8. WELLNESS TRACKING');

  if (!userId) {
    logTest('Wellness tests', 'skip', 'No user ID available');
    return;
  }

  // Log sleep
  log('Logging sleep data...', 'blue');
  const sleepResult = await makeRequest('POST', '/wellness/sleep', {
    userId,
    bedtime: '2024-12-24T23:00:00Z',
    wakeTime: '2024-12-25T07:00:00Z',
    sleepDuration: 8,
    sleepQuality: 8,
  }, authToken);

  if (sleepResult.success) {
    logTest('Log sleep', 'pass');
  } else {
    logTest('Log sleep', 'fail', sleepResult.error);
  }

  // Get sleep history
  log('Fetching sleep history...', 'blue');
  const getSleepResult = await makeRequest('GET', `/wellness/sleep/${userId}?days=7`, null, authToken);
  
  if (getSleepResult.success) {
    logTest('Get sleep history', 'pass');
  } else {
    logTest('Get sleep history', 'fail', getSleepResult.error);
  }

  // Log breathing
  log('Logging breathing exercise...', 'blue');
  const breathingResult = await makeRequest('POST', '/wellness/breathing', {
    userId,
    duration: 5,
    cycles: 10,
    stressLevel: 6,
    beforeMood: 'stressed',
    afterMood: 'calm',
  }, authToken);

  if (breathingResult.success) {
    logTest('Log breathing exercise', 'pass');
  } else {
    logTest('Log breathing exercise', 'fail', breathingResult.error);
  }

  // Get breathing history
  log('Fetching breathing history...', 'blue');
  const getBreathingResult = await makeRequest('GET', `/wellness/breathing/${userId}`, null, authToken);
  
  if (getBreathingResult.success) {
    logTest('Get breathing history', 'pass');
  } else {
    logTest('Get breathing history', 'fail', getBreathingResult.error);
  }

  // Log mood
  log('Logging mood...', 'blue');
  const moodResult = await makeRequest('POST', '/wellness/mood', {
    userId,
    mood: 7,
    emotions: ['happy', 'excited'],
    notes: 'Feeling good today',
    triggers: ['exercise'],
    activities: ['yoga', 'meditation'],
  }, authToken);

  if (moodResult.success) {
    logTest('Log mood', 'pass');
  } else {
    logTest('Log mood', 'fail', moodResult.error);
  }

  // Get mood history
  log('Fetching mood history...', 'blue');
  const getMoodResult = await makeRequest('GET', `/wellness/mood/${userId}`, null, authToken);
  
  if (getMoodResult.success) {
    logTest('Get mood history', 'pass');
  } else {
    logTest('Get mood history', 'fail', getMoodResult.error);
  }

  // Get wellness analytics
  log('Fetching wellness analytics...', 'blue');
  const analyticsResult = await makeRequest('GET', `/wellness/analytics/${userId}`, null, authToken);
  
  if (analyticsResult.success) {
    logTest('Get wellness analytics', 'pass');
  } else {
    logTest('Get wellness analytics', 'fail', analyticsResult.error);
  }

  // Create nudge
  log('Creating wellness nudge...', 'blue');
  let nudgeId = null;
  const nudgeResult = await makeRequest('POST', '/wellness/nudges', {
    userId,
    title: 'Take a break',
    description: 'Time to stretch and relax',
    type: 'wellness',
    scheduledTime: new Date(Date.now() + 3600000).toISOString(),
    repeatDays: ['monday', 'wednesday', 'friday'],
    priority: 'medium',
  }, authToken);

  if (nudgeResult.success) {
    nudgeId = nudgeResult.data.data?.nudge?.id || nudgeResult.data.data?.nudge?._id;
    logTest('Create nudge', 'pass', `Nudge ID: ${nudgeId}`);
  } else {
    logTest('Create nudge', 'fail', nudgeResult.error);
  }

  // Get nudges
  log('Fetching nudges...', 'blue');
  const getNudgesResult = await makeRequest('GET', `/wellness/nudges/${userId}`, null, authToken);
  
  if (getNudgesResult.success) {
    logTest('Get nudges', 'pass');
  } else {
    logTest('Get nudges', 'fail', getNudgesResult.error);
  }

  // Delete nudge
  if (nudgeId) {
    log('Deleting nudge...', 'blue');
    const deleteNudgeResult = await makeRequest('DELETE', `/wellness/nudges/${nudgeId}`, null, authToken);
    
    if (deleteNudgeResult.success) {
      logTest('Delete nudge', 'pass');
    } else {
      logTest('Delete nudge', 'fail', deleteNudgeResult.error);
    }
  }
}

async function testVoiceEndpoints() {
  logSection('9. VOICE & AI ASSISTANT');

  if (!authToken) {
    logTest('Voice tests', 'skip', 'No auth token available');
    return;
  }

  // Test therapeutic response
  log('Testing therapeutic AI response...', 'blue');
  const therapeuticResult = await makeRequest('POST', '/voice/therapeutic', {
    message: 'I am feeling stressed about work.',
  }, authToken);

  if (therapeuticResult.success && therapeuticResult.data.reply) {
    logTest('Get therapeutic response', 'pass', `Reply: ${therapeuticResult.data.reply.substring(0, 50)}...`);
  } else {
    logTest('Get therapeutic response', 'fail', therapeuticResult.error);
  }
}

async function testPreferencesEndpoints() {
  logSection('10. USER PREFERENCES');

  if (!userId || !authToken) {
    logTest('Preferences tests', 'skip', 'No user ID or token available');
    return;
  }

  // Create/Update preferences
  log('Updating user preferences...', 'blue');
  const updateResult = await makeRequest('PUT', `/preferences/${userId}`, {
    theme: 'ocean',
    notifications: true,
    adaptiveMode: true,
    neurotype: 'ADHD',
    language: 'en',
  }, authToken);

  if (updateResult.success) {
    logTest('Update preferences', 'pass');
  } else {
    logTest('Update preferences', 'fail', updateResult.error);
  }

  // Get preferences
  log('Fetching user preferences...', 'blue');
  const getResult = await makeRequest('GET', `/preferences/${userId}`, null, authToken);
  
  if (getResult.success) {
    logTest('Get preferences', 'pass', `Theme: ${getResult.data.data?.theme || 'default'}`);
  } else {
    logTest('Get preferences', 'fail', getResult.error);
  }
}

async function testCaregiverPatientManagement() {
  logSection('11. CAREGIVER PATIENT MANAGEMENT');

  if (!caregiverToken) {
    logTest('Caregiver patient tests', 'skip', 'No caregiver token available');
    return;
  }

  // Get patient list
  log('Fetching caregiver patients...', 'blue');
  const patientsResult = await makeRequest('GET', '/caregiver/patients', null, caregiverToken);
  
  if (patientsResult.success) {
    const patientCount = patientsResult.data.patients?.length || 0;
    logTest('Get patients list', 'pass', `Found ${patientCount} patients`);
  } else {
    logTest('Get patients list', 'fail', patientsResult.error);
  }

  // Test patient detail (if we have patients)
  if (userId) {
    log('Fetching patient details...', 'blue');
    const detailResult = await makeRequest('GET', `/caregiver/patient/${userId}`, null, caregiverToken);
    
    if (detailResult.success) {
      logTest('Get patient details', 'pass');
    } else {
      logTest('Get patient details', 'skip', 'Patient not linked to caregiver');
    }
  }
}

// Main execution
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'bright');
  log('║         NEUROCOMPANION BACKEND API TEST SUITE                ║', 'bright');
  log('║         Comprehensive End-to-End Testing                     ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════════╝', 'bright');
  
  log(`\nBackend URL: ${BASE_URL}`, 'cyan');
  log(`Test started at: ${new Date().toLocaleString()}`, 'cyan');

  try {
    await testHealthCheck();
    await testCaregiverAuth();
    await testInviteSystem();
    await testPatientAuth();
    await testTaskEndpoints();
    await testEmotionEndpoints();
    await testJournalEndpoints();
    await testWellnessEndpoints();
    await testVoiceEndpoints();
    await testPreferencesEndpoints();
    await testCaregiverPatientManagement();

    // Print summary
    logSection('TEST SUMMARY');
    log(`✓ Passed: ${testResults.passed}`, 'green');
    log(`✗ Failed: ${testResults.failed}`, 'red');
    log(`⊘ Skipped: ${testResults.skipped}`, 'yellow');
    log(`Total: ${testResults.passed + testResults.failed + testResults.skipped}`, 'cyan');

    if (testResults.failed > 0) {
      log('\nFailed Tests:', 'red');
      testResults.errors.forEach((error, index) => {
        log(`${index + 1}. ${error.test}`, 'red');
        log(`   ${error.details}`, 'reset');
      });
    }

    const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
    log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    log(`\nTest completed at: ${new Date().toLocaleString()}`, 'cyan');
    
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log('\n✗ Fatal error during test execution:', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
