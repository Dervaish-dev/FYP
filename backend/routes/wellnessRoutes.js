import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";

const router = express.Router();

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Analyze mood patterns using Gemini API
const analyzeMoodPatterns = async (moodEntries) => {
  try {
    if (!moodEntries || moodEntries.length === 0) {
      return {
        patterns: [],
        insights: ['No mood data available for analysis'],
        recommendations: ['Start logging your mood regularly to get personalized insights']
      };
    }

    const moodData = moodEntries.map(entry => ({
      mood: entry.mood,
      notes: entry.notes || '',
      date: entry.createdAt,
      emotions: entry.emotions || []
    }));

    const prompt = `
Analyze the following mood data and provide insights about patterns, triggers, and recommendations for mental wellness:

Mood Data:
${JSON.stringify(moodData, null, 2)}

Please provide:
1. Mood patterns (trends, cycles, fluctuations)
2. Potential triggers or factors affecting mood
3. Personalized recommendations for mood regulation
4. Warning signs to watch for
5. Positive patterns to maintain

Respond in JSON format with the following structure:
{
  "patterns": ["pattern1", "pattern2"],
  "insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "warningSigns": ["warning1", "warning2"],
  "positivePatterns": ["positive1", "positive2"]
}

Be empathetic, supportive, and focus on actionable advice. Keep responses concise but meaningful.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysisText = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to parse JSON response
        const analysis = JSON.parse(analysisText);
        return analysis;
      } catch (parseError) {
        // If JSON parsing fails, return structured fallback
        return {
          patterns: ['Mood data shows regular fluctuations'],
          insights: [analysisText.substring(0, 200) + '...'],
          recommendations: ['Continue monitoring your mood patterns'],
          warningSigns: ['Watch for prolonged low moods'],
          positivePatterns: ['Regular mood tracking is beneficial']
        };
      }
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error analyzing mood patterns:', error);
    return {
      patterns: ['Unable to analyze patterns at this time'],
      insights: ['Mood analysis temporarily unavailable'],
      recommendations: ['Continue logging mood data for future analysis'],
      warningSigns: ['Seek professional help if mood concerns persist'],
      positivePatterns: ['Regular mood tracking is beneficial']
    };
  }
};

// Sleep Data Schema
const sleepDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  bedtime: {
    type: String,
    required: true
  },
  wakeTime: {
    type: String,
    required: true
  },
  sleepDuration: {
    type: Number, // in hours
    required: true
  },
  sleepQuality: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Breathing Exercise Schema
const breathingExerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  cycles: {
    type: Number,
    required: true
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  beforeMood: {
    type: String,
    enum: ['calm', 'stressed', 'anxious', 'neutral', 'happy', 'sad'],
    default: 'neutral'
  },
  afterMood: {
    type: String,
    enum: ['calm', 'stressed', 'anxious', 'neutral', 'happy', 'sad'],
    default: 'neutral'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Wellness Nudge Schema
const wellnessNudgeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['medication', 'hydration', 'exercise', 'mindfulness', 'sleep', 'break', 'custom'],
    required: true
  },
  scheduledTime: {
    type: String, // HH:MM format
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  repeatDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Mood Entry Schema
const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  emotions: [{
    type: String,
    enum: ['happy', 'sad', 'calm', 'stressed', 'angry', 'neutral', 'excited', 'worried', 'confused', 'surprised', 'depressed', 'anxious']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  triggers: [{
    type: String,
    trim: true
  }],
  activities: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SleepData = mongoose.model('SleepData', sleepDataSchema);
const BreathingExercise = mongoose.model('BreathingExercise', breathingExerciseSchema);
const WellnessNudge = mongoose.model('WellnessNudge', wellnessNudgeSchema);
const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);

// ===== SLEEP ROUTES =====

// POST /api/wellness/sleep - Log sleep data
router.post("/sleep", async (req, res) => {
  try {
    const { userId, bedtime, wakeTime, sleepDuration, sleepQuality } = req.body;

    if (!userId || !bedtime || !wakeTime || !sleepDuration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, bedtime, wakeTime, sleepDuration'
      });
    }

    const sleepEntry = new SleepData({
      userId,
      bedtime,
      wakeTime,
      sleepDuration: parseFloat(sleepDuration),
      sleepQuality: sleepQuality || 5
    });

    await sleepEntry.save();

    res.status(201).json({
      success: true,
      message: 'Sleep data logged successfully',
      data: sleepEntry
    });

  } catch (error) {
    console.error('Error logging sleep data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log sleep data',
      error: error.message
    });
  }
});

// GET /api/wellness/sleep/:userId - Get sleep data for user
router.get("/sleep/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sleepData = await SleepData
      .find({ userId, createdAt: { $gte: startDate } })
      .sort({ createdAt: -1 })
      .limit(parseInt(days));

    // Calculate average sleep duration
    const avgDuration = sleepData.length > 0 
      ? sleepData.reduce((sum, entry) => sum + entry.sleepDuration, 0) / sleepData.length
      : 0;

    res.json({
      success: true,
      data: {
        entries: sleepData,
        averageDuration: parseFloat(avgDuration.toFixed(1)),
        totalEntries: sleepData.length
      }
    });

  } catch (error) {
    console.error('Error fetching sleep data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep data',
      error: error.message
    });
  }
});

// ===== BREATHING EXERCISE ROUTES =====

// POST /api/wellness/breathing - Log breathing exercise
router.post("/breathing", async (req, res) => {
  try {
    const { userId, duration, cycles, stressLevel, beforeMood, afterMood } = req.body;

    if (!userId || !duration || !cycles) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, duration, cycles'
      });
    }

    const breathingEntry = new BreathingExercise({
      userId,
      duration: parseFloat(duration),
      cycles: parseInt(cycles),
      stressLevel: stressLevel || 5,
      beforeMood: beforeMood || 'neutral',
      afterMood: afterMood || 'neutral'
    });

    await breathingEntry.save();

    res.status(201).json({
      success: true,
      message: 'Breathing exercise logged successfully',
      data: breathingEntry
    });

  } catch (error) {
    console.error('Error logging breathing exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log breathing exercise',
      error: error.message
    });
  }
});

// GET /api/wellness/breathing/:userId - Get breathing exercise history
router.get("/breathing/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const breathingHistory = await BreathingExercise
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Calculate statistics
    const totalExercises = breathingHistory.length;
    const totalDuration = breathingHistory.reduce((sum, entry) => sum + entry.duration, 0);
    const totalCycles = breathingHistory.reduce((sum, entry) => sum + entry.cycles, 0);
    const avgStressReduction = breathingHistory.length > 0 
      ? breathingHistory.reduce((sum, entry) => sum + (entry.stressLevel - 3), 0) / breathingHistory.length
      : 0;

    res.json({
      success: true,
      data: {
        history: breathingHistory,
        statistics: {
          totalExercises,
          totalDuration: parseFloat(totalDuration.toFixed(1)),
          totalCycles,
          averageStressReduction: parseFloat(avgStressReduction.toFixed(1))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching breathing exercise history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breathing exercise history',
      error: error.message
    });
  }
});

// ===== WELLNESS NUDGE ROUTES =====

// POST /api/wellness/nudges - Create wellness nudge
router.post("/nudges", async (req, res) => {
  try {
    const { userId, title, description, type, scheduledTime, repeatDays, priority } = req.body;

    if (!userId || !title || !type || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, type, scheduledTime'
      });
    }

    const nudge = new WellnessNudge({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      type,
      scheduledTime,
      repeatDays: repeatDays || [],
      priority: priority || 'medium'
    });

    await nudge.save();

    res.status(201).json({
      success: true,
      message: 'Wellness nudge created successfully',
      data: nudge
    });

  } catch (error) {
    console.error('Error creating wellness nudge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create wellness nudge',
      error: error.message
    });
  }
});

// GET /api/wellness/nudges/:userId - Get user's wellness nudges
router.get("/nudges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { active = true } = req.query;

    const query = { userId };
    if (active === 'true') {
      query.isActive = true;
    }

    const nudges = await WellnessNudge
      .find(query)
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      data: nudges
    });

  } catch (error) {
    console.error('Error fetching wellness nudges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wellness nudges',
      error: error.message
    });
  }
});

// PUT /api/wellness/nudges/:id - Update wellness nudge
router.put("/nudges/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updatedNudge = await WellnessNudge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNudge) {
      return res.status(404).json({
        success: false,
        message: 'Wellness nudge not found'
      });
    }

    res.json({
      success: true,
      message: 'Wellness nudge updated successfully',
      data: updatedNudge
    });

  } catch (error) {
    console.error('Error updating wellness nudge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wellness nudge',
      error: error.message
    });
  }
});

// DELETE /api/wellness/nudges/:id - Delete wellness nudge
router.delete("/nudges/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNudge = await WellnessNudge.findByIdAndDelete(id);

    if (!deletedNudge) {
      return res.status(404).json({
        success: false,
        message: 'Wellness nudge not found'
      });
    }

    res.json({
      success: true,
      message: 'Wellness nudge deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting wellness nudge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete wellness nudge',
      error: error.message
    });
  }
});

// ===== MOOD ENTRY ROUTES =====

// POST /api/wellness/mood - Log mood entry
router.post("/mood", async (req, res) => {
  try {
    const { userId, mood, emotions, notes, triggers, activities } = req.body;

    if (!userId || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, mood'
      });
    }

    const moodEntry = new MoodEntry({
      userId,
      mood: parseInt(mood),
      emotions: emotions || [],
      notes: notes?.trim() || '',
      triggers: triggers || [],
      activities: activities || []
    });

    await moodEntry.save();

    res.status(201).json({
      success: true,
      message: 'Mood entry logged successfully',
      data: moodEntry
    });

  } catch (error) {
    console.error('Error logging mood entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log mood entry',
      error: error.message
    });
  }
});

// GET /api/wellness/mood/:userId - Get mood entries for user
router.get("/mood/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30, limit = 50 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodEntries = await MoodEntry
      .find({ userId, createdAt: { $gte: startDate } })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Calculate mood analytics
    const avgMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
      : 0;

    // Emotion frequency analysis
    const emotionFrequency = {};
    moodEntries.forEach(entry => {
      entry.emotions.forEach(emotion => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });
    });

    // Mood trend analysis
    const moodTrend = moodEntries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      mood: entry.mood,
      emotions: entry.emotions
    }));

    res.json({
      success: true,
      data: {
        entries: moodEntries,
        analytics: {
          averageMood: parseFloat(avgMood.toFixed(1)),
          totalEntries: moodEntries.length,
          emotionFrequency,
          moodTrend
        }
      }
    });

  } catch (error) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood entries',
      error: error.message
    });
  }
});

// ===== ANALYTICS ROUTES =====

// GET /api/wellness/analytics/:userId - Get comprehensive wellness analytics
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate data from all wellness collections
    const [sleepData, breathingData, moodData, nudgeData] = await Promise.all([
      SleepData.find({ userId, createdAt: { $gte: startDate } }),
      BreathingExercise.find({ userId, createdAt: { $gte: startDate } }),
      MoodEntry.find({ userId, createdAt: { $gte: startDate } }),
      WellnessNudge.find({ userId })
    ]);

    // Sleep analytics
    const avgSleepDuration = sleepData.length > 0 
      ? sleepData.reduce((sum, entry) => sum + entry.sleepDuration, 0) / sleepData.length
      : 0;

    // Breathing analytics
    const totalBreathingMinutes = breathingData.reduce((sum, entry) => sum + entry.duration, 0);
    const avgStressReduction = breathingData.length > 0
      ? breathingData.reduce((sum, entry) => sum + (entry.stressLevel - 3), 0) / breathingData.length
      : 0;

    // Mood analytics
    const avgMood = moodData.length > 0
      ? moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length
      : 0;

    // Nudge analytics
    const completedNudges = nudgeData.filter(nudge => nudge.isCompleted).length;
    const nudgeCompletionRate = nudgeData.length > 0 
      ? (completedNudges / nudgeData.length) * 100
      : 0;

    // Wellness score calculation
    const wellnessScore = Math.round(
      (avgSleepDuration / 8) * 25 + // Sleep component (25%)
      (avgMood / 10) * 25 + // Mood component (25%)
      (Math.max(0, avgStressReduction) / 7) * 25 + // Stress reduction (25%)
      (nudgeCompletionRate / 100) * 25 // Nudge completion (25%)
    );

    // Analyze mood patterns using AI
    const moodAnalysis = await analyzeMoodPatterns(moodData);

    res.json({
      success: true,
      data: {
        wellnessScore: Math.min(100, Math.max(0, wellnessScore)),
        sleep: {
          averageDuration: parseFloat(avgSleepDuration.toFixed(1)),
          totalEntries: sleepData.length
        },
        breathing: {
          totalMinutes: parseFloat(totalBreathingMinutes.toFixed(1)),
          totalExercises: breathingData.length,
          averageStressReduction: parseFloat(avgStressReduction.toFixed(1))
        },
        mood: {
          averageMood: parseFloat(avgMood.toFixed(1)),
          totalEntries: moodData.length,
          analysis: moodAnalysis
        },
        nudges: {
          totalNudges: nudgeData.length,
          completedNudges,
          completionRate: parseFloat(nudgeCompletionRate.toFixed(1))
        },
        recommendations: generateWellnessRecommendations(avgSleepDuration, avgMood, avgStressReduction, nudgeCompletionRate)
      }
    });

  } catch (error) {
    console.error('Error fetching wellness analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wellness analytics',
      error: error.message
    });
  }
});

// Helper function to generate wellness recommendations
function generateWellnessRecommendations(avgSleep, avgMood, avgStressReduction, nudgeCompletion) {
  const recommendations = [];

  if (avgSleep < 7) {
    recommendations.push({
      type: 'sleep',
      priority: 'high',
      message: 'Consider improving your sleep schedule. Aim for 7-9 hours of quality sleep.',
      action: 'Set consistent bedtime and wake time'
    });
  }

  if (avgMood < 6) {
    recommendations.push({
      type: 'mood',
      priority: 'medium',
      message: 'Your mood has been lower recently. Consider practicing mindfulness or reaching out for support.',
      action: 'Try breathing exercises or journaling'
    });
  }

  if (avgStressReduction < 2) {
    recommendations.push({
      type: 'stress',
      priority: 'medium',
      message: 'Breathing exercises could help reduce your stress levels.',
      action: 'Practice daily breathing exercises'
    });
  }

  if (nudgeCompletion < 70) {
    recommendations.push({
      type: 'nudges',
      priority: 'low',
      message: 'Try to complete more of your wellness reminders to build healthy habits.',
      action: 'Review and adjust your reminder schedule'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      priority: 'low',
      message: 'Great job maintaining your wellness routine! Keep up the excellent work.',
      action: 'Continue your current practices'
    });
  }

  return recommendations;
}

export default router;
