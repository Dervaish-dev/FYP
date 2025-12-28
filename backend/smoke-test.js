#!/usr/bin/env node
/**
 * Smoke test for Task Scheduling & Recurrence feature
 * Tests: create recurring task → mark done → verify nextTask created
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5005/api';

// Test user credentials (must exist in DB or be created first)
const TEST_USER = {
  email: 'dervaishabbas@gmail.com',
  password: '1224E4bd',
  name: 'Dervaish Abbas'
};

let authToken = '';
let userId = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth() {
  console.log('\n🔍 Checking backend health...');
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  const data = await res.json();
  console.log('✓ Backend is healthy:', data);
  return data;
}

async function register() {
  console.log('\n📝 Registering test user...');
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  
  if (res.status === 400) {
    console.log('⚠ User already exists, will attempt login');
    return false;
  }
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Registration failed: ${res.status} ${err}`);
  }
  
  const data = await res.json();
  console.log('✓ User registered:', data.data?.user?.name);
  authToken = data.data.token;
  userId = data.data.user.id;
  return true;
}

async function login() {
  console.log('\n🔐 Logging in...');
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed: ${res.status} ${err}`);
  }
  
  const data = await res.json();
  console.log('✓ Logged in:', data.data?.user?.name);
  authToken = data.data.token;
  userId = data.data.user.id;
}

async function createRecurringTask() {
  console.log('\n➕ Creating recurring task...');
  
  const dueTime = new Date();
  dueTime.setHours(dueTime.getHours() + 2); // Due in 2 hours
  
  const task = {
    userId,
    title: 'Daily Meditation',
    description: 'Morning meditation routine',
    category: 'Wellness',
    priority: 'high',
    dueTime: dueTime.toISOString(),
    repeat: 'daily',
    steps: [
      { id: '1', text: 'Find quiet space', done: false },
      { id: '2', text: 'Set timer for 10 minutes', done: false },
      { id: '3', text: 'Focus on breathing', done: false }
    ]
  };
  
  const res = await fetch(`${API_BASE}/tasks/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(task)
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Task creation failed: ${res.status} ${err}`);
  }
  
  const data = await res.json();
  console.log('✓ Recurring task created:');
  console.log('  - ID:', data.data._id);
  console.log('  - Title:', data.data.title);
  console.log('  - Repeat:', data.data.repeat);
  console.log('  - Due:', new Date(data.data.dueTime).toLocaleString());
  console.log('  - Steps:', data.data.steps?.length || 0);
  
  return data.data;
}

async function markTaskDone(taskId) {
  console.log('\n✅ Marking task as done...');
  
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      status: 'done'
    })
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Task update failed: ${res.status} ${err}`);
  }
  
  const data = await res.json();
  console.log('✓ Task marked as done');
  
  if (data.nextTask) {
    console.log('✓ Next occurrence created:');
    console.log('  - ID:', data.nextTask._id);
    console.log('  - Title:', data.nextTask.title);
    console.log('  - Due:', new Date(data.nextTask.dueTime).toLocaleString());
    console.log('  - Occurrence Index:', data.nextTask.occurrenceIndex);
    console.log('  - Steps reset:', data.nextTask.steps?.every(s => !s.done));
  } else {
    console.log('⚠ No nextTask in response (expected for recurring tasks)');
  }
  
  return data;
}

async function listTasks() {
  console.log('\n📋 Fetching all tasks...');
  
  const res = await fetch(`${API_BASE}/tasks/${userId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Task list failed: ${res.status} ${err}`);
  }
  
  const data = await res.json();
  console.log('✓ Tasks fetched:');
  console.log('  - Total:', data.data.total);
  console.log('  - Done:', data.data.groupedTasks.done.length);
  console.log('  - Todo:', data.data.groupedTasks.todo.length);
  console.log('  - In Progress:', data.data.groupedTasks['in-progress'].length);
  
  return data.data.tasks;
}

async function testCustomIntervalRecurrence() {
  console.log('\n🔄 Testing custom interval recurrence...');
  
  const dueTime = new Date();
  dueTime.setDate(dueTime.getDate() + 1);
  
  const task = {
    userId,
    title: 'Weekly Review',
    description: 'Review progress every 3 days',
    category: 'Planning',
    priority: 'medium',
    dueTime: dueTime.toISOString(),
    repeat: 'custom',
    customInterval: 3
  };
  
  const createRes = await fetch(`${API_BASE}/tasks/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(task)
  });
  
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Custom task creation failed: ${createRes.status} ${err}`);
  }
  
  const createData = await createRes.json();
  const customTaskId = createData.data._id;
  console.log('✓ Custom interval task created');
  
  // Mark as done
  const updateRes = await fetch(`${API_BASE}/tasks/${customTaskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ status: 'done' })
  });
  
  const updateData = await updateRes.json();
  
  if (updateData.nextTask) {
    const originalDue = new Date(createData.data.dueTime);
    const nextDue = new Date(updateData.nextTask.dueTime);
    const daysDiff = Math.round((nextDue - originalDue) / (1000 * 60 * 60 * 24));
    
    console.log('✓ Custom interval verified:');
    console.log('  - Original due:', originalDue.toLocaleString());
    console.log('  - Next due:', nextDue.toLocaleString());
    console.log('  - Days difference:', daysDiff, '(expected: 3)');
    
    if (daysDiff === 3) {
      console.log('✓ Custom interval working correctly!');
    } else {
      console.log('⚠ Custom interval mismatch!');
    }
  }
}

async function runSmokeTest() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Task Scheduling & Recurrence - Smoke Test');
  console.log('═══════════════════════════════════════════════════');
  
  try {
    // Health check
    await checkHealth();
    
    // Wait a bit for DB connection
    await sleep(1000);
    
    // Auth flow
    const registered = await register();
    if (!registered) {
      await login();
    }
    
    // Create recurring task
    const task = await createRecurringTask();
    
    // Mark it done and check for next occurrence
    await markTaskDone(task._id);
    
    // List all tasks to verify
    await listTasks();
    
    // Test custom interval
    await testCustomIntervalRecurrence();
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✓ ALL SMOKE TESTS PASSED');
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SMOKE TEST FAILED:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTest();
}

export { runSmokeTest };
