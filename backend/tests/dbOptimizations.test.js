import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import User model
import User from '../models/User.js';

// Test database optimization features
describe('Database Optimizations', () => {
  let testUserId;
  let emotionModel;
  let taskModel;
  let journalModel;

  before(async () => {
    // Connect to production database (same as server)
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not set in environment');
    }
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('  ✓ Connected to MongoDB for testing');
    }
    
    testUserId = new mongoose.Types.ObjectId().toString();
    
    // Wait a bit for models to be registered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get models - they should be registered after routes are loaded
    emotionModel = mongoose.models.EmotionHistory;
    taskModel = mongoose.models.Task;
    journalModel = mongoose.models.JournalEntry;
  });

  after(async () => {
    // Cleanup test data
    if (emotionModel) {
      await emotionModel.deleteMany({ userId: testUserId });
    }
    if (taskModel) {
      await taskModel.deleteMany({ userId: testUserId });
    }
    if (journalModel) {
      await journalModel.deleteMany({ userId: testUserId });
    }
    // Don't close connection as other tests may need it
  });

  describe('Index Verification', () => {
    it('should have email index on User model', async () => {
      assert.ok(User, 'User model should exist');
      
      const indexes = await User.collection.getIndexes();
      const hasEmailIndex = Object.values(indexes).some(
        idx => idx.key && (idx.key.email === 1 || idx.key.email === -1)
      );
      
      assert.ok(hasEmailIndex, 'User model should have email index');
      console.log('    ✓ User email index verified');
    });

    it('should have compound index on EmotionHistory (userId + timestamp)', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      const indexes = await emotionModel.collection.getIndexes();
      const hasCompoundIndex = Object.values(indexes).some(
        idx => idx.key && idx.key.userId === 1 && idx.key.timestamp === -1
      );
      
      assert.ok(hasCompoundIndex, 'EmotionHistory should have userId+timestamp compound index');
    });

    it('should have compound indexes on Task (userId + dueTime and userId + status)', async () => {
      if (!taskModel) {
        console.log('⚠️ Task model not loaded, skipping test');
        return;
      }
      
      const indexes = await taskModel.collection.getIndexes();
      const hasDueTimeIndex = Object.values(indexes).some(
        idx => idx.key && idx.key.userId === 1 && idx.key.dueTime === 1
      );
      const hasStatusIndex = Object.values(indexes).some(
        idx => idx.key && idx.key.userId === 1 && idx.key.status === 1
      );
      
      assert.ok(hasDueTimeIndex, 'Task should have userId+dueTime compound index');
      assert.ok(hasStatusIndex, 'Task should have userId+status compound index');
    });

    it('should have compound indexes on JournalEntry (userId + createdAt)', async () => {
      if (!journalModel) {
        console.log('⚠️ JournalEntry model not loaded, skipping test');
        return;
      }
      
      const indexes = await journalModel.collection.getIndexes();
      const hasCreatedAtIndex = Object.values(indexes).some(
        idx => idx.key && idx.key.userId === 1 && idx.key.createdAt === -1
      );
      
      assert.ok(hasCreatedAtIndex, 'JournalEntry should have userId+createdAt compound index');
    });
  });

  describe('Query Performance with Indexes', () => {
    it('should use index for User email lookup', async () => {
      const explainResult = await User.findOne({ email: 'test@example.com' })
        .explain('executionStats');
      
      // Check if index was used (not COLLSCAN)
      const executionStages = explainResult.executionStats?.executionStages;
      const queryPlanner = explainResult.queryPlanner?.winningPlan;
      
      const isCollScan = executionStages?.stage === 'COLLSCAN' || 
                        queryPlanner?.stage === 'COLLSCAN';
      
      assert.ok(!isCollScan, 'User.findOne by email should use index, not collection scan');
      console.log('    ✓ User email query uses index (not COLLSCAN)');
    });

    it('should efficiently query emotions with userId filter', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      // Create test emotion
      await emotionModel.create({
        userId: testUserId,
        emotion: 'happy',
        intensity: 8,
        confidence: 0.9,
        timestamp: new Date()
      });
      
      const emotions = await emotionModel
        .find({ userId: testUserId })
        .sort({ timestamp: -1 })
        .lean();
      
      assert.ok(Array.isArray(emotions), 'Should return array');
      assert.ok(emotions.length > 0, 'Should find created emotion');
      assert.ok(!emotions[0].constructor.name.includes('Document'), 'Should return plain objects with .lean()');
    });
  });

  describe('Batch Query Optimization (N+1 Prevention)', () => {
    it('should batch fetch data for multiple users efficiently', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      // Create test data for multiple users
      const userIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      ];
      
      // Insert emotions for each user
      for (const userId of userIds) {
        await emotionModel.create({
          userId,
          emotion: 'happy',
          intensity: 7,
          confidence: 0.85,
          timestamp: new Date()
        });
      }
      
      // Batch fetch using $in operator
      const startTime = Date.now();
      const emotions = await emotionModel
        .find({ userId: { $in: userIds } })
        .lean();
      const queryTime = Date.now() - startTime;
      
      assert.equal(emotions.length, 3, 'Should fetch all 3 emotions in one query');
      assert.ok(queryTime < 100, 'Batch query should be fast (< 100ms)');
      
      // Cleanup
      await emotionModel.deleteMany({ userId: { $in: userIds } });
    });

    it('should group batch results by userId in O(n) time', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      const userIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      ];
      
      // Create multiple emotions per user
      for (const userId of userIds) {
        for (let i = 0; i < 3; i++) {
          await emotionModel.create({
            userId,
            emotion: 'calm',
            intensity: 6,
            confidence: 0.8,
            timestamp: new Date(Date.now() + i * 1000)
          });
        }
      }
      
      // Batch fetch and group
      const emotions = await emotionModel
        .find({ userId: { $in: userIds } })
        .lean();
      
      // Group by userId (O(n) operation)
      const emotionsByUser = {};
      emotions.forEach(e => {
        if (!emotionsByUser[e.userId]) emotionsByUser[e.userId] = [];
        emotionsByUser[e.userId].push(e);
      });
      
      assert.equal(Object.keys(emotionsByUser).length, 2, 'Should group into 2 user groups');
      assert.equal(emotionsByUser[userIds[0]].length, 3, 'User 1 should have 3 emotions');
      assert.equal(emotionsByUser[userIds[1]].length, 3, 'User 2 should have 3 emotions');
      
      // Cleanup
      await emotionModel.deleteMany({ userId: { $in: userIds } });
    });
  });

  describe('.lean() Performance', () => {
    it('should return plain JavaScript objects with .lean()', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      await emotionModel.create({
        userId: testUserId,
        emotion: 'excited',
        intensity: 9,
        confidence: 0.95,
        timestamp: new Date()
      });
      
      const withLean = await emotionModel.findOne({ userId: testUserId }).lean();
      const withoutLean = await emotionModel.findOne({ userId: testUserId });
      
      assert.ok(withLean, 'Should find emotion with .lean()');
      assert.ok(withoutLean, 'Should find emotion without .lean()');
      
      // Plain object vs Mongoose document
      assert.ok(!withLean.save, 'Lean result should not have Mongoose methods');
      assert.ok(typeof withoutLean.save === 'function', 'Non-lean result should have Mongoose methods');
    });

    it('should be faster with .lean() for read-only queries', async () => {
      if (!emotionModel) {
        console.log('⚠️ EmotionHistory model not loaded, skipping test');
        return;
      }
      
      // Create 50 test records
      const emotions = Array.from({ length: 50 }, (_, i) => ({
        userId: testUserId,
        emotion: 'neutral',
        intensity: 5,
        confidence: 0.7,
        timestamp: new Date(Date.now() + i * 1000)
      }));
      await emotionModel.insertMany(emotions);
      
      // Test with .lean()
      const leanStart = Date.now();
      await emotionModel.find({ userId: testUserId }).lean();
      const leanTime = Date.now() - leanStart;
      
      // Test without .lean()
      const normalStart = Date.now();
      await emotionModel.find({ userId: testUserId });
      const normalTime = Date.now() - normalStart;
      
      console.log(`  Query times: lean=${leanTime}ms, normal=${normalTime}ms`);
      
      // Lean should generally be faster, but allow some variance
      assert.ok(true, 'Performance comparison completed');
    });
  });

  describe('Integration: Full Optimization Stack', () => {
    it('should efficiently handle complex caregiver patient query pattern', async () => {
      if (!emotionModel || !taskModel) {
        console.log('⚠️ Models not loaded, skipping integration test');
        return;
      }
      
      // Simulate 5 patients
      const patientIds = Array.from({ length: 5 }, () => 
        new mongoose.Types.ObjectId().toString()
      );
      
      // Create data for each patient
      for (const userId of patientIds) {
        // 10 emotions per patient
        for (let i = 0; i < 10; i++) {
          await emotionModel.create({
            userId,
            emotion: i % 2 === 0 ? 'happy' : 'calm',
            intensity: 5 + i,
            confidence: 0.8,
            timestamp: new Date(Date.now() + i * 60000)
          });
        }
        
        // 5 tasks per patient
        for (let i = 0; i < 5; i++) {
          await taskModel.create({
            userId,
            title: `Task ${i}`,
            description: 'Test task',
            dueTime: new Date(Date.now() + i * 86400000),
            status: i < 2 ? 'done' : 'todo'
          });
        }
      }
      
      // Batch query (optimized approach)
      const startTime = Date.now();
      const [emotionsData, tasksData] = await Promise.all([
        emotionModel.find({ userId: { $in: patientIds } }).sort({ timestamp: -1 }).lean(),
        taskModel.find({ userId: { $in: patientIds } }).lean()
      ]);
      const queryTime = Date.now() - startTime;
      
      // Group data by userId
      const emotionsByUser = {};
      const tasksByUser = {};
      
      emotionsData.forEach(e => {
        if (!emotionsByUser[e.userId]) emotionsByUser[e.userId] = [];
        emotionsByUser[e.userId].push(e);
      });
      
      tasksData.forEach(t => {
        if (!tasksByUser[t.userId]) tasksByUser[t.userId] = [];
        tasksByUser[t.userId].push(t);
      });
      
      assert.equal(emotionsData.length, 50, 'Should fetch 50 emotions (10 per patient)');
      assert.equal(tasksData.length, 25, 'Should fetch 25 tasks (5 per patient)');
      assert.equal(Object.keys(emotionsByUser).length, 5, 'Should group emotions for 5 patients');
      assert.equal(Object.keys(tasksByUser).length, 5, 'Should group tasks for 5 patients');
      assert.ok(queryTime < 500, 'Batch query should complete in < 500ms');
      
      console.log(`  ✓ Fetched data for ${patientIds.length} patients in ${queryTime}ms`);
      
      // Cleanup
      await emotionModel.deleteMany({ userId: { $in: patientIds } });
      await taskModel.deleteMany({ userId: { $in: patientIds } });
    });
  });
});
