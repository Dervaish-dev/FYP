import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  assignedCaregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const caregiverSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: 'caregiver' },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Caregiver = mongoose.model('Caregiver', caregiverSchema);

async function createMockPatientWithData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find caregiver
    const caregiver = await Caregiver.findOne({ email: 'dummy123@gmail.com' });
    
    if (!caregiver) {
      console.log('❌ Caregiver with email Dummy123@gmail.com not found!');
      console.log('Creating caregiver first...');
      
      const newCaregiver = new Caregiver({
        name: 'Test Caregiver',
        email: 'dummy123@gmail.com',
        password: await bcrypt.hash('A.ashraf6811', 12),
        role: 'caregiver',
        patients: []
      });
      
      await newCaregiver.save();
      console.log('✅ Caregiver created successfully!');
      return createMockPatientWithData(); // Retry with created caregiver
    }

    console.log('✅ Found caregiver:', caregiver.name);

    // Check if mock patient already exists
    let patient = await User.findOne({ email: 'mockpatient@test.com' });
    
    if (patient) {
      console.log('⚠️  Mock patient already exists. Updating data...');
    } else {
      // Create mock patient
      patient = new User({
        name: 'John Doe',
        email: 'mockpatient@test.com',
        password: 'password123',
        assignedCaregiver: caregiver._id
      });
      
      await patient.save();
      console.log('✅ Created mock patient:', patient.name);
    }

    // Add patient to caregiver's patients list if not already added
    if (!caregiver.patients.includes(patient._id)) {
      caregiver.patients.push(patient._id);
      await caregiver.save();
      console.log('✅ Patient linked to caregiver');
    }

    const db = mongoose.connection.db;

    // Create emotions data (30 emotions over last 2 weeks)
    // Using 'emotionhistories' collection to match the EmotionHistory model
    const emotionsCollection = db.collection('emotionhistories');
    const emotions = [];
    const emotionTypes = [
      { emotion: 'happy', intensity: 8, confidence: 0.95 },
      { emotion: 'excited', intensity: 9, confidence: 0.92 },
      { emotion: 'calm', intensity: 7, confidence: 0.88 },
      { emotion: 'sad', intensity: 5, confidence: 0.85 },
      { emotion: 'stressed', intensity: 7, confidence: 0.9 },
      { emotion: 'angry', intensity: 6, confidence: 0.87 },
      { emotion: 'neutral', intensity: 5, confidence: 0.8 },
      { emotion: 'worried', intensity: 6, confidence: 0.83 },
      { emotion: 'confused', intensity: 5, confidence: 0.78 },
      { emotion: 'surprised', intensity: 8, confidence: 0.91 }
    ];

    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(i / 2); // 2 emotions per day
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(Math.random() > 0.5 ? 10 : 16); // Morning or afternoon
      
      const emotionData = emotionTypes[i % emotionTypes.length];
      emotions.push({
        userId: patient._id.toString(),
        emotion: emotionData.emotion,
        intensity: emotionData.intensity,
        confidence: emotionData.confidence,
        source: 'manual',
        note: '',
        timestamp: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    // Delete existing emotions for this user and insert new ones
    await emotionsCollection.deleteMany({ userId: patient._id.toString() });
    await emotionsCollection.insertMany(emotions);
    console.log(`✅ Created ${emotions.length} emotions in emotionhistories collection`);

    // Create tasks data (15 tasks with mixed statuses)
    const tasksCollection = db.collection('tasks');
    const tasks = [];
    const taskTitles = [
      'Morning meditation',
      'Take medication',
      'Exercise for 30 minutes',
      'Healthy breakfast',
      'Journal entry',
      'Breathing exercises',
      'Read for 20 minutes',
      'Call a friend',
      'Prepare healthy lunch',
      'Afternoon walk',
      'Practice gratitude',
      'Drink 8 glasses of water',
      'Evening reflection',
      'Relaxation before bed',
      'Sleep by 10 PM'
    ];

    const statuses = ['done', 'done', 'done', 'done', 'in-progress', 'pending'];
    
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(i / 3);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      tasks.push({
        userId: patient._id.toString(),
        title: taskTitles[i],
        description: `${taskTitles[i]} - part of daily wellness routine`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        dueDate: createdDate,
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    await tasksCollection.deleteMany({ userId: patient._id.toString() });
    await tasksCollection.insertMany(tasks);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create journal entries (10 entries)
    const journalsCollection = db.collection('journalentries');
    const journals = [];
    const journalContents = [
      "Today was a good day. I felt productive and managed to complete most of my tasks. The morning meditation really helped set a positive tone.",
      "Had some challenging moments today dealing with stress at work, but I used the breathing techniques and they really helped calm me down.",
      "Feeling grateful for the support system I have. Talked to a friend today and it made me realize how important connections are.",
      "Made progress on my wellness goals today. The exercise routine is getting easier and I'm starting to enjoy it.",
      "Today was tough. Felt anxious in the morning but managed to work through it with journaling and a walk outside.",
      "Really proud of myself for sticking to my routine this week. Small wins matter and I'm celebrating them.",
      "Had a peaceful day today. Spent time reading and practicing gratitude. Feeling more balanced.",
      "Noticed some old patterns coming back. Need to be mindful and use my coping strategies more consistently.",
      "Great session with my wellness activities today. The combination of exercise and meditation is really working.",
      "Reflecting on my progress this week. There have been ups and downs but overall trending in a positive direction."
    ];

    for (let i = 0; i < 10; i++) {
      const daysAgo = i;
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      createdDate.setHours(20); // Evening entries
      
      journals.push({
        userId: patient._id.toString(),
        title: `Journal Entry - ${createdDate.toLocaleDateString()}`,
        content: journalContents[i],
        mood: ['positive', 'neutral', 'reflective'][Math.floor(Math.random() * 3)],
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    await journalsCollection.deleteMany({ userId: patient._id.toString() });
    await journalsCollection.insertMany(journals);
    console.log(`✅ Created ${journals.length} journal entries`);

    // Create wellness data (14 days of sleep/activity tracking)
    const wellnessCollection = db.collection('wellness');
    const wellnessData = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      wellnessData.push({
        userId: patient._id.toString(),
        date: date,
        sleepHours: 6 + Math.random() * 3, // 6-9 hours
        sleepQuality: Math.floor(5 + Math.random() * 5), // 5-10 rating
        exerciseMinutes: Math.floor(20 + Math.random() * 40), // 20-60 minutes
        waterIntake: Math.floor(6 + Math.random() * 4), // 6-10 glasses
        stressLevel: Math.floor(2 + Math.random() * 6), // 2-8 rating
        energyLevel: Math.floor(5 + Math.random() * 5), // 5-10 rating
        notes: i % 3 === 0 ? 'Felt good today, maintained routine' : '',
        createdAt: date,
        updatedAt: date
      });
    }

    await wellnessCollection.deleteMany({ userId: patient._id.toString() });
    await wellnessCollection.insertMany(wellnessData);
    console.log(`✅ Created ${wellnessData.length} wellness entries`);

    // Summary
    console.log('\n📊 Summary:');
    console.log('==========================================');
    console.log(`👤 Patient: ${patient.name} (${patient.email})`);
    console.log(`👨‍⚕️ Caregiver: ${caregiver.name} (${caregiver.email})`);
    console.log(`📧 Patient ID: ${patient._id}`);
    console.log(`\n📈 Data Created:`);
    console.log(`   • ${emotions.length} emotion records`);
    console.log(`   • ${tasks.length} tasks`);
    console.log(`   • ${journals.length} journal entries`);
    console.log(`   • ${wellnessData.length} wellness tracking entries`);
    console.log('\n✅ Mock patient setup complete!');
    console.log('\nYou can now:');
    console.log('1. Login as caregiver: Dummy123@gmail.com / A.ashraf6811');
    console.log('2. View the patient "John Doe" in the dashboard');
    console.log('3. Click on the patient to see all the detailed data and charts');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createMockPatientWithData();
