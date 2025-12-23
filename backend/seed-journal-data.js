#!/usr/bin/env node
/**
 * Seed journal entries with realistic AI analysis data for testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const journalEntrySchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  emotion: String,
  emotionConfidence: Number,
  language: String,
  tags: [String],
  isPrivate: Boolean,
  mood: Number,
  topics: [String],
  keywords: [{ word: String, relevance: Number }],
  stressLevel: String,
  stressScore: Number,
  stressTriggers: [String],
  emotionalIntensity: Number,
  aiAnalysis: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

const seedEntries = [
  {
    title: 'Overwhelming Day at Work',
    content: 'Today was incredibly stressful. The deadline for the project is approaching, and I feel overwhelmed by the workload. My manager keeps adding more tasks, and I\'m struggling to keep up. I barely had time for lunch, and by evening I had a headache. I\'m worried about meeting expectations and feel anxious about tomorrow. The constant pressure is affecting my sleep, and I find myself thinking about work even during my breaks.',
    emotion: 'anxious',
    emotionConfidence: 0.85,
    mood: 3,
    topics: ['work', 'stress', 'deadlines', 'health', 'anxiety'],
    keywords: [
      { word: 'deadline', relevance: 0.9 },
      { word: 'overwhelmed', relevance: 0.95 },
      { word: 'pressure', relevance: 0.88 },
      { word: 'anxious', relevance: 0.92 },
      { word: 'sleep', relevance: 0.75 }
    ],
    stressLevel: 'high',
    stressScore: 8,
    stressTriggers: ['work deadlines', 'excessive workload', 'manager pressure', 'time constraints', 'sleep disruption'],
    emotionalIntensity: 8,
    aiAnalysis: 'Entry shows high stress related to work pressure and looming deadlines. Multiple stress indicators present including physical symptoms (headache), sleep disruption, and persistent worry. Suggests need for stress management strategies and potential boundary-setting with workload.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Beautiful Morning Walk',
    content: 'Went for a morning walk today and it was absolutely refreshing. The sunrise was beautiful, and I felt grateful for the peaceful moment. I\'ve been practicing mindfulness lately, and it\'s really helping me appreciate the small things. Had a nice conversation with my friend about our plans for the weekend. Feeling hopeful and energized for the day ahead.',
    emotion: 'happy',
    emotionConfidence: 0.92,
    mood: 8,
    topics: ['self-care', 'mindfulness', 'relationships', 'gratitude', 'nature'],
    keywords: [
      { word: 'refreshing', relevance: 0.85 },
      { word: 'grateful', relevance: 0.88 },
      { word: 'peaceful', relevance: 0.9 },
      { word: 'mindfulness', relevance: 0.87 },
      { word: 'hopeful', relevance: 0.82 }
    ],
    stressLevel: 'low',
    stressScore: 1,
    stressTriggers: [],
    emotionalIntensity: 7,
    aiAnalysis: 'Positive emotional state with strong gratitude and mindfulness themes. The entry reflects healthy coping mechanisms (morning walks, mindfulness practice) and social connection. Indicates good mental wellness and emotional regulation.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    title: 'Family Tensions',
    content: 'Had a difficult conversation with my parents today. They don\'t understand my career choices and keep pushing me towards a different path. I feel stuck between honoring my own dreams and meeting their expectations. The guilt is eating me up inside. I know they want what\'s best for me, but I wish they would listen to what I actually want. This conflict is creating so much tension at home.',
    emotion: 'sad',
    emotionConfidence: 0.78,
    mood: 4,
    topics: ['family', 'relationships', 'career', 'identity', 'conflict'],
    keywords: [
      { word: 'expectations', relevance: 0.9 },
      { word: 'guilt', relevance: 0.92 },
      { word: 'tension', relevance: 0.85 },
      { word: 'conflict', relevance: 0.88 },
      { word: 'dreams', relevance: 0.8 }
    ],
    stressLevel: 'medium',
    stressScore: 6,
    stressTriggers: ['family expectations', 'career pressure', 'identity conflict', 'guilt', 'lack of understanding'],
    emotionalIntensity: 7,
    aiAnalysis: 'Complex emotional situation involving family relationships and personal identity. The entry reveals internal conflict between autonomy and family approval. Suggests need for communication strategies and boundary-setting while maintaining family connections.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    title: 'Productive Study Session',
    content: 'Finally managed to focus for 3 hours straight today. Used the Pomodoro technique and it really worked well. Completed two chapters and feel like I\'m making progress on my goals. The library environment helped - quiet and away from distractions. Planning to continue this routine. Feeling accomplished and motivated.',
    emotion: 'excited',
    emotionConfidence: 0.88,
    mood: 7,
    topics: ['productivity', 'studying', 'personal growth', 'goals', 'self-improvement'],
    keywords: [
      { word: 'focus', relevance: 0.87 },
      { word: 'progress', relevance: 0.9 },
      { word: 'accomplished', relevance: 0.92 },
      { word: 'motivated', relevance: 0.89 },
      { word: 'routine', relevance: 0.75 }
    ],
    stressLevel: 'low',
    stressScore: 2,
    stressTriggers: [],
    emotionalIntensity: 6,
    aiAnalysis: 'Positive entry reflecting effective self-management and productivity. Shows successful implementation of time management strategies and goal-oriented behavior. Indicates good motivation and sense of accomplishment.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    title: 'Health Concerns',
    content: 'Been having persistent back pain for the past week. I think it\'s from sitting too long at my desk. Finally scheduled a doctor appointment for next week. I\'m worried it might be something serious, though rationally I know it\'s probably just posture-related. Need to remember to take breaks and stretch more often. Also considering getting a standing desk.',
    emotion: 'worried',
    emotionConfidence: 0.82,
    mood: 5,
    topics: ['health', 'self-care', 'work habits', 'anxiety', 'wellness'],
    keywords: [
      { word: 'pain', relevance: 0.88 },
      { word: 'worried', relevance: 0.85 },
      { word: 'doctor', relevance: 0.8 },
      { word: 'posture', relevance: 0.75 },
      { word: 'health', relevance: 0.9 }
    ],
    stressLevel: 'medium',
    stressScore: 5,
    stressTriggers: ['health concerns', 'physical pain', 'sedentary lifestyle', 'health anxiety'],
    emotionalIntensity: 6,
    aiAnalysis: 'Entry shows health-related anxiety balanced with practical problem-solving. Positive that medical appointment is scheduled. Indicates awareness of lifestyle factors and willingness to make changes. Mild health anxiety present but within normal range.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: 'Weekend Recharge',
    content: 'Spent the weekend disconnected from work emails and social media. Read a book, cooked a nice meal, and just relaxed. It was exactly what I needed. Feeling recharged and ready for the week ahead. Sometimes I forget how important it is to just unplug and be present. Made me realize I need better work-life boundaries.',
    emotion: 'calm',
    emotionConfidence: 0.9,
    mood: 8,
    topics: ['self-care', 'work-life balance', 'relaxation', 'mindfulness', 'personal time'],
    keywords: [
      { word: 'recharged', relevance: 0.92 },
      { word: 'relaxed', relevance: 0.88 },
      { word: 'unplug', relevance: 0.85 },
      { word: 'boundaries', relevance: 0.87 },
      { word: 'present', relevance: 0.8 }
    ],
    stressLevel: 'low',
    stressScore: 1,
    stressTriggers: [],
    emotionalIntensity: 5,
    aiAnalysis: 'Healthy self-care practices and recognition of need for work-life balance. The entry shows good self-awareness and effective stress management through disconnection. Indicates growing understanding of personal wellness needs.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  },
  {
    title: 'Social Anxiety at Event',
    content: 'Went to a networking event tonight but felt really anxious the whole time. Struggled to start conversations and felt like everyone else was more confident than me. Left early feeling disappointed in myself. I know networking is important for my career but I find these situations so draining. Need to work on my social confidence.',
    emotion: 'anxious',
    emotionConfidence: 0.87,
    mood: 4,
    topics: ['social anxiety', 'confidence', 'career', 'self-esteem', 'personal development'],
    keywords: [
      { word: 'anxious', relevance: 0.93 },
      { word: 'confidence', relevance: 0.88 },
      { word: 'disappointed', relevance: 0.85 },
      { word: 'draining', relevance: 0.82 },
      { word: 'networking', relevance: 0.78 }
    ],
    stressLevel: 'medium',
    stressScore: 6,
    stressTriggers: ['social situations', 'networking pressure', 'comparison with others', 'performance anxiety'],
    emotionalIntensity: 7,
    aiAnalysis: 'Entry reveals social anxiety and self-confidence challenges. Shows awareness of career importance but emotional cost of social situations. Suggests need for gradual exposure and self-compassion. Negative self-talk patterns present.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
];

async function seedJournalData(userId) {
  try {
    console.log('\n🌱 Seeding journal data...');
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Clear existing entries for this user
    const deleted = await JournalEntry.deleteMany({ userId });
    console.log(`✓ Cleared ${deleted.deletedCount} existing entries`);
    
    // Insert seed data
    const entries = seedEntries.map(entry => ({
      ...entry,
      userId,
      language: 'english',
      tags: [],
      isPrivate: true,
      updatedAt: entry.createdAt
    }));
    
    const inserted = await JournalEntry.insertMany(entries);
    console.log(`✓ Inserted ${inserted.length} journal entries with AI analysis`);
    
    // Display summary
    console.log('\n📊 Seed Data Summary:');
    console.log(`  - Total Entries: ${inserted.length}`);
    console.log(`  - High Stress: ${inserted.filter(e => e.stressLevel === 'high').length}`);
    console.log(`  - Medium Stress: ${inserted.filter(e => e.stressLevel === 'medium').length}`);
    console.log(`  - Low Stress: ${inserted.filter(e => e.stressLevel === 'low').length}`);
    console.log(`  - Unique Topics: ${new Set(inserted.flatMap(e => e.topics)).size}`);
    console.log(`  - Total Keywords: ${inserted.reduce((sum, e) => sum + e.keywords.length, 0)}`);
    console.log(`  - Total Stress Triggers: ${inserted.reduce((sum, e) => sum + e.stressTriggers.length, 0)}`);
    
    await mongoose.disconnect();
    console.log('\n✓ Seed completed successfully!');
    
    return inserted;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const userId = process.argv[2] || '67459ba8cac05d8bac41c8a3'; // Default test user ID
  
  console.log('═══════════════════════════════════════════════════');
  console.log('  Journal Data Seeder');
  console.log('═══════════════════════════════════════════════════');
  console.log(`User ID: ${userId}`);
  
  seedJournalData(userId)
    .then(() => {
      console.log('\n✓ All done! Run smoke-test-journal.js to verify.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error.message);
      process.exit(1);
    });
}

export { seedJournalData };
