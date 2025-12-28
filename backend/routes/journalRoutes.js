import express from "express";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import CallReport from '../models/CallReport.js';

dotenv.config();

const router = express.Router();

// Import Journal model from voiceJournalController for voice status checks
// Define it here to avoid circular dependency
const voiceJournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, default: '' },
  mood: { type: String, default: 'neutral' },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  sentimentConfidence: { type: Number, default: 0.5 },
  stressLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  stressScore: { type: Number, default: 5 },
  emotionalIntensity: { type: Number, default: 5, min: 1, max: 10 },
  topics: [{ type: String }],
  keywords: [{ type: String }],
  source: { type: String, enum: ['manual', 'voice_call'], default: 'manual' },
  call_id: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add index for fast call_id lookups
voiceJournalSchema.index({ call_id: 1 });
voiceJournalSchema.index({ userId: 1, createdAt: -1 });

const VoiceJournal = mongoose.models.Journal || mongoose.model('Journal', voiceJournalSchema);

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY || '';
console.log('🔑 Gemini API Key configured:', API_KEY ? '✅ YES' : '❌ NO');

const genAI = new GoogleGenerativeAI(API_KEY);
// Use gemini-2.0-flash - latest, stable, lowest tier
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Helper function to analyze journal entry with AI - SINGLE REQUEST ONLY
async function analyzeEntryWithAI(content) {
  try {
    console.log('🤖 Starting AI emotion analysis...');
    console.log('📝 Content length:', content.length, 'characters');

    const prompt = `Analyze this journal entry and provide emotional analysis.

Journal Entry: "${content}"

Return ONLY this JSON (no other text):
{
  "sentiment": "positive" | "negative" | "neutral",
  "sentimentConfidence": 0-1,
  "mood": "happy" | "sad" | "anxious" | "calm" | "angry" | "excited" | "stressed" | "neutral",
  "stressLevel": "low" | "medium" | "high",
  "stressScore": 0-10,
  "emotionalIntensity": 1-10,
  "topics": ["topic1", "topic2"],
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary"
}`;

    console.log('📡 Sending 1 request to Gemini API (gemini-2.0-flash)...');
    const result = await model.generateContent(prompt);
    console.log('✅ Received response from Gemini');

    const response = await result.response;
    const text = response.text();
    
    console.log('📄 Response:', text.substring(0, 150));
    
    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ AI analysis:', {
        mood: parsed.mood,
        sentiment: parsed.sentiment,
        stressScore: parsed.stressScore
      });
      return parsed;
    }
    
    console.log('⚠️ Could not parse JSON, using fallback');
    return null;
  } catch (error) {
    console.error('❌ AI analysis error:', error.message);
    return null;
  }
}

// Fallback keyword-based emotion detection
function detectEmotionFromKeywords(content) {
  const lowerText = content.toLowerCase();
  
  const emotionKeywords = {
    happy: ['happy', 'joyful', 'excited', 'wonderful', 'amazing', 'fantastic', 'great', 'love', 'awesome', 'blessed', 'grateful', 'grateful'],
    sad: ['sad', 'unhappy', 'miserable', 'depressed', 'down', 'upset', 'sorry', 'lonely', 'alone', 'crying', 'tears'],
    stressed: ['stressed', 'overwhelmed', 'anxiety', 'anxious', 'worried', 'pressure', 'burden', 'nervous', 'tense', 'frustrated'],
    angry: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate', 'disgusted'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'peaceful', 'meditated', 'mindful'],
    excited: ['excited', 'thrilled', 'pumped', 'energized', 'enthusiastic', 'looking forward', 'can\'t wait'],
    peaceful: ['peaceful', 'serene', 'tranquil', 'calm', 'at peace', 'harmony'],
  };

  let topEmotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(kw => lowerText.includes(kw)).length;
    const score = matches * 10;
    if (score > maxScore) {
      maxScore = score;
      topEmotion = emotion;
    }
  }

  // Determine stress level from keywords
  const stressKeywords = {
    high: ['urgent', 'critical', 'emergency', 'panic', 'desperate', 'overwhelmed'],
    medium: ['stressed', 'worried', 'anxious', 'tense', 'busy'],
    low: ['calm', 'peaceful', 'relaxed', 'fine', 'good']
  };

  let stressLevel = 'low';
  for (const [level, keywords] of Object.entries(stressKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      stressLevel = level;
      break;
    }
  }

  const stressScores = { high: 8, medium: 5, low: 2 };
  const stressScore = stressScores[stressLevel];

  console.log('🔍 Keyword fallback detection:', {
    emotion: topEmotion,
    stressLevel,
    stressScore,
    confidence: Math.min(0.9, (maxScore / 50))
  });

  return {
    sentiment: topEmotion === 'happy' ? 'positive' : topEmotion === 'sad' ? 'negative' : 'neutral',
    sentimentConfidence: Math.min(0.9, (maxScore / 50)),
    mood: topEmotion,
    stressLevel,
    stressScore,
    emotionalIntensity: maxScore > 0 ? Math.min(10, 3 + (maxScore / 20)) : 5,
    topics: [],
    keywords: [],
    stressTriggers: [],
    summary: `Entry analyzed with keyword detection. Detected emotion: ${topEmotion}`
  };
}

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'calm', 'stressed', 'angry', 'neutral', 'excited', 'worried', 'confused', 'surprised', 'depressed', 'anxious'],
    default: 'neutral'
  },
  emotionConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  language: {
    type: String,
    default: 'english'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Enhanced NLP fields
  topics: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  keywords: [{
    word: { type: String, trim: true },
    relevance: { type: Number, min: 0, max: 1 }
  }],
  stressLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  stressScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  stressTriggers: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  emotionalIntensity: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  aiAnalysis: {
    type: String,
    maxlength: 2000
  },
  // Voice entry fields
  isVoiceEntry: {
    type: Boolean,
    default: false
  },
  voiceCallId: {
    type: String,
    trim: true
  },
  voiceDuration: {
    type: Number,
    min: 0
  },
  voiceTranscript: {
    type: String,
    maxlength: 10000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient time-based queries with sorting
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, isVoiceEntry: 1 });

// Update the updatedAt field before saving
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

// POST /api/journal/create - Create a new journal entry
router.post("/create", async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      content, 
      emotion, 
      emotionConfidence, 
      language, 
      tags, 
      isPrivate, 
      mood 
    } = req.body;

    // Validate required fields
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, content'
      });
    }

    // Perform AI analysis if content is provided
    let aiAnalysisData = null;
    let analysisSource = 'none';
    console.log('📥 POST /journal/create received:', {
      userId,
      contentLength: content?.length,
      hasEmotion: !!emotion,
      willAnalyze: content && content.trim().length > 20
    });

    if (content && content.trim().length > 20) {
      console.log('🔄 Content is valid, attempting Gemini API analysis...');
      aiAnalysisData = await analyzeEntryWithAI(content);
      
      if (aiAnalysisData) {
        analysisSource = 'gemini-api';
        console.log('✅ Using Gemini API analysis');
      } else {
        console.log('⚠️ Gemini API failed, using keyword fallback...');
        aiAnalysisData = detectEmotionFromKeywords(content);
        analysisSource = 'keyword-fallback';
        console.log('✅ Using keyword fallback analysis');
      }
    } else {
      console.log('⚠️ Content too short, skipping analysis');
    }

    // Create new journal entry with AI analysis
    const journalEntry = new JournalEntry({
      userId,
      title: title?.trim() || '',
      content: content.trim(),
      emotion: aiAnalysisData?.mood || emotion?.toLowerCase() || 'neutral',
      emotionConfidence: aiAnalysisData?.sentimentConfidence || emotionConfidence || 0.5,
      language: language || 'english',
      tags: tags || [],
      isPrivate: isPrivate !== false,
      mood: mood || 5,
      // Enhanced NLP fields
      topics: aiAnalysisData?.topics || [],
      keywords: aiAnalysisData?.keywords || [],
      stressLevel: aiAnalysisData?.stressLevel || 'low',
      stressScore: aiAnalysisData?.stressScore || 0,
      stressTriggers: aiAnalysisData?.stressTriggers || [],
      emotionalIntensity: aiAnalysisData?.emotionalIntensity || 5,
      aiAnalysis: aiAnalysisData?.summary || ''
    });

    // Log what's being saved
    console.log('💾 Saving journal entry with:', {
      emotion: journalEntry.emotion,
      emotionConfidence: journalEntry.emotionConfidence,
      stressLevel: journalEntry.stressLevel,
      stressScore: journalEntry.stressScore,
      emotionalIntensity: journalEntry.emotionalIntensity,
      analysisSource
    });

    await journalEntry.save();
    
    console.log('✅ Entry saved successfully');


    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });

  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
});

// GET /api/journal/:userId - Get journal entries for user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, emotion, mood, tags } = req.query;

    // Build query for manual entries
    const manualQuery = { userId };
    if (emotion) manualQuery.emotion = emotion.toLowerCase();
    if (mood) manualQuery.mood = parseInt(mood);
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      manualQuery.tags = { $in: tagArray };
    }

    // Build query for voice entries  
    const voiceQuery = { userId };
    if (mood) voiceQuery.mood = parseInt(mood);
    
    console.log('📊 Fetching journal entries for user:', userId);
    
    // Get both manual and voice entries - use lean() for read-only performance boost
    const [manualEntries, voiceEntries] = await Promise.all([
      JournalEntry
        .find(manualQuery)
        .sort({ createdAt: -1 })
        .lean(),
      VoiceJournal
        .find(voiceQuery)
        .sort({ createdAt: -1 })
        .lean()
    ]);

    console.log(`📝 Found ${manualEntries.length} manual entries, ${voiceEntries.length} voice entries`);

    // Normalize voice entries to match manual entry format
    const normalizedVoiceEntries = voiceEntries.map(entry => ({
      ...entry,
      emotion: entry.mood, // Map mood to emotion for consistency
      isVoiceEntry: true,
      voiceCallId: entry.call_id
    }));

    // Combine and sort by createdAt
    const allEntries = [...manualEntries, ...normalizedVoiceEntries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    console.log(`✅ Returning ${allEntries.length} total entries`);
    
    // Use combined entries for calculations
    const entries = allEntries;

    // Get journal statistics from both collections
    const [manualStats, voiceStats] = await Promise.all([
      JournalEntry.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 },
            avgMood: { $avg: '$mood' },
            avgConfidence: { $avg: '$emotionConfidence' }
          }
        }
      ]),
      VoiceJournal.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$mood', // Voice uses 'mood' field
            count: { $sum: 1 },
            avgMood: { $avg: { $toInt: '$mood' } }, // Convert mood string to number if needed
            avgConfidence: { $avg: '$sentimentConfidence' }
          }
        }
      ])
    ]);

    // Combine stats from both collections
    const statsMap = new Map();
    [...manualStats, ...voiceStats].forEach(stat => {
      const key = stat._id;
      if (statsMap.has(key)) {
        const existing = statsMap.get(key);
        existing.count += stat.count;
        existing.avgMood = ((existing.avgMood * existing.count) + (stat.avgMood * stat.count)) / (existing.count + stat.count);
        if (stat.avgConfidence) {
          existing.avgConfidence = ((existing.avgConfidence || 0) + stat.avgConfidence) / 2;
        }
      } else {
        statsMap.set(key, stat);
      }
    });
    const stats = Array.from(statsMap.values());

    // Get mood trends (last 30 days) from both collections
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [manualTrends, voiceTrends] = await Promise.all([
      JournalEntry.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              emotion: "$emotion"
            },
            avgMood: { $avg: "$mood" },
            avgConfidence: { $avg: "$emotionConfidence" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ]),
      VoiceJournal.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              emotion: "$mood"
            },
            avgMood: { $avg: { $toInt: "$mood" } },
            avgConfidence: { $avg: "$sentimentConfidence" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ])
    ]);
    
    const moodTrends = [...manualTrends, ...voiceTrends].sort((a, b) => 
      a._id.date.localeCompare(b._id.date)
    );

    res.json({
      success: true,
      data: {
        entries,
        stats,
        moodTrends,
        total: entries.length
      }
    });

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries',
      error: error.message
    });
  }
});

// GET /api/journal/entry/:id - Get specific journal entry
router.get("/entry/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await JournalEntry.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entry',
      error: error.message
    });
  }
});

// PUT /api/journal/:id - Update journal entry
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    // Clean up the update data
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.content) updateData.content = updateData.content.trim();
    if (updateData.tags) updateData.tags = updateData.tags.map(tag => tag.trim());

    // ✅ If content is being updated, re-analyze emotion with AI
    if (updateData.content && updateData.content.trim().length > 20) {
      console.log('📝 Content updated, attempting AI re-analysis...');
      const aiAnalysisData = await analyzeEntryWithAI(updateData.content);
      
      if (aiAnalysisData) {
        console.log('✅ Using Gemini API analysis for update');
        updateData.emotion = aiAnalysisData.mood;
        updateData.emotionConfidence = aiAnalysisData.sentimentConfidence;
        updateData.stressLevel = aiAnalysisData.stressLevel;
        updateData.stressScore = aiAnalysisData.stressScore;
        updateData.emotionalIntensity = aiAnalysisData.emotionalIntensity;
        updateData.topics = aiAnalysisData.topics;
        updateData.keywords = aiAnalysisData.keywords;
        updateData.stressTriggers = aiAnalysisData.stressTriggers;
        updateData.aiAnalysis = aiAnalysisData.summary;
      } else {
        console.log('⚠️ Gemini API failed, using keyword fallback for update...');
        const fallbackData = detectEmotionFromKeywords(updateData.content);
        updateData.emotion = fallbackData.mood;
        updateData.emotionConfidence = fallbackData.sentimentConfidence;
        updateData.stressLevel = fallbackData.stressLevel;
        updateData.stressScore = fallbackData.stressScore;
        updateData.emotionalIntensity = fallbackData.emotionalIntensity;
        updateData.topics = fallbackData.topics;
        updateData.keywords = fallbackData.keywords;
        updateData.stressTriggers = fallbackData.stressTriggers;
        updateData.aiAnalysis = fallbackData.summary;
        console.log('✅ Using keyword fallback analysis for update');
      }
    } else if (updateData.emotion) {
      // Only lowercase if explicitly set
      updateData.emotion = updateData.emotion.toLowerCase();
    }

    const entry = await JournalEntry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });

  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error.message
    });
  }
});

// DELETE /api/journal/:id - Delete journal entry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await JournalEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/search - Search journal entries
router.get("/:userId/search", async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in title and content
    const entries = await JournalEntry
      .find({
        userId,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        entries,
        total: entries.length,
        query: q
      }
    });

  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search journal entries',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/analytics - Get journal analytics
router.get("/:userId/analytics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data
    const analytics = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            emotion: "$emotion"
          },
          avgMood: { $avg: "$mood" },
          avgConfidence: { $avg: "$emotionConfidence" },
          count: { $sum: 1 },
          totalWords: { $sum: { $strLenCP: "$content" } }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get emotion distribution
    const emotionDistribution = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgMood: { $avg: '$mood' }
        }
      }
    ]);

    // Get writing patterns
    const writingPatterns = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            dayOfWeek: { $dayOfWeek: "$createdAt" }
          },
          count: { $sum: 1 },
          avgMood: { $avg: "$mood" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        emotionDistribution,
        writingPatterns,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error fetching journal analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal analytics',
      error: error.message
    });
  }
});

// POST /api/journal/prompts/:userId - Generate contextual prompts based on user history
router.post("/prompts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get recent entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEntries = await JournalEntry
      .find({ userId, createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (recentEntries.length === 0) {
      // First-time user prompts
      return res.json({
        success: true,
        data: {
          prompts: [
            "What made you smile today?",
            "Describe a moment that brought you peace.",
            "What are you grateful for right now?"
          ],
          affirmations: [
            "You are worthy of peace and happiness.",
            "Your feelings are valid and important.",
            "You have the strength to face today's challenges."
          ],
          suggestions: [
            "Take 5 deep breaths before writing",
            "Find a quiet, comfortable space",
            "Let your thoughts flow without judgment"
          ]
        }
      });
    }
    
    // Analyze mood trends
    const avgMood = recentEntries.reduce((sum, e) => sum + (e.mood || 5), 0) / recentEntries.length;
    const avgStress = recentEntries.reduce((sum, e) => sum + (e.stressScore || 0), 0) / recentEntries.length;
    const commonTopics = [...new Set(recentEntries.flatMap(e => e.topics || []))];
    const commonTriggers = [...new Set(recentEntries.flatMap(e => e.stressTriggers || []))];
    
    const moodTrend = avgMood > 6 ? 'positive' : avgMood < 4 ? 'challenging' : 'stable';
    const stressPattern = avgStress > 6 ? 'high stress' : avgStress > 3 ? 'moderate stress' : 'low stress';
    
    // Generate contextual prompts with AI
    const promptRequest = `
Based on a user's recent journal entries showing:
- Mood trend: ${moodTrend} (average ${avgMood.toFixed(1)}/10)
- Stress pattern: ${stressPattern} (average ${avgStress.toFixed(1)}/10)
- Common topics: ${commonTopics.join(', ') || 'general life experiences'}
- Stress triggers: ${commonTriggers.join(', ') || 'none identified'}

Generate 3 thoughtful journal prompts, 3 personalized affirmations, and 3 gentle self-care suggestions.

Return as JSON:
{
  "prompts": ["prompt1", "prompt2", "prompt3"],
  "affirmations": ["affirmation1", "affirmation2", "affirmation3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Make them compassionate, specific to the user's situation, and encouraging. Return ONLY the JSON.`;
    
    try {
      const result = await model.generateContent(promptRequest);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResponse = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          data: aiResponse
        });
      }
    } catch (aiError) {
      console.error('AI prompt generation error:', aiError);
    }
    
    // Fallback prompts based on mood trend
    const fallbackPrompts = moodTrend === 'challenging' 
      ? [
          "What small step could make today a little brighter?",
          "Write about a time you overcame a difficult situation.",
          "What support or kindness do you need right now?"
        ]
      : [
          "What brought you joy recently?",
          "Describe a moment of growth or learning.",
          "What are you looking forward to?"
        ];
    
    const fallbackAffirmations = avgStress > 5
      ? [
          "You are stronger than your stress.",
          "It's okay to take a break and rest.",
          "You deserve peace and calm in your life."
        ]
      : [
          "You are making progress every day.",
          "Your feelings matter and are valid.",
          "You have the power to create positive change."
        ];
    
    res.json({
      success: true,
      data: {
        prompts: fallbackPrompts,
        affirmations: fallbackAffirmations,
        suggestions: [
          "Practice deep breathing for 2 minutes",
          "Take a short walk outside",
          "Connect with someone you trust"
        ]
      }
    });
    
  } catch (error) {
    console.error('Error generating prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prompts',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/stress-analysis - Get stress analysis and trends
router.get("/:userId/stress-analysis", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get stress trends over time
    const stressTrends = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          avgStressScore: { $avg: "$stressScore" },
          maxStressScore: { $max: "$stressScore" },
          entryCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Get stress trigger frequency
    const triggerAnalysis = await JournalEntry.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $unwind: "$stressTriggers" },
      {
        $group: {
          _id: "$stressTriggers",
          count: { $sum: 1 },
          avgStressScore: { $avg: "$stressScore" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get stress level distribution
    const stressDistribution = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$stressLevel",
          count: { $sum: 1 },
          avgEmotionalIntensity: { $avg: "$emotionalIntensity" }
        }
      }
    ]);
    
    // Calculate overall stress metrics
    const allEntries = await JournalEntry.find({ userId, createdAt: { $gte: startDate } });
    const avgStress = allEntries.reduce((sum, e) => sum + (e.stressScore || 0), 0) / (allEntries.length || 1);
    const highStressCount = allEntries.filter(e => e.stressLevel === 'high').length;
    const stressPercentage = (highStressCount / (allEntries.length || 1)) * 100;
    
    res.json({
      success: true,
      data: {
        stressTrends,
        triggerAnalysis,
        stressDistribution,
        summary: {
          averageStressScore: avgStress.toFixed(2),
          highStressDays: highStressCount,
          stressPercentage: stressPercentage.toFixed(1),
          totalEntries: allEntries.length,
          period: `${days} days`
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching stress analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stress analysis',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/topics - Get topic analysis and trends
router.get("/:userId/topics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get topic frequency
    const topicAnalysis = await JournalEntry.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $unwind: "$topics" },
      {
        $group: {
          _id: "$topics",
          count: { $sum: 1 },
          avgMood: { $avg: "$mood" },
          avgStressScore: { $avg: "$stressScore" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Get topic trends over time
    const topicTrends = await JournalEntry.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $unwind: "$topics" },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            topic: "$topics"
          },
          count: { $sum: 1 },
          avgMood: { $avg: "$mood" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
    
    // Get keywords frequency
    const keywordAnalysis = await JournalEntry.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $unwind: "$keywords" },
      {
        $group: {
          _id: "$keywords.word",
          count: { $sum: 1 },
          avgRelevance: { $avg: "$keywords.relevance" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      success: true,
      data: {
        topicAnalysis,
        topicTrends,
        keywordAnalysis,
        period: `${days} days`
      }
    });
    
  } catch (error) {
    console.error('Error fetching topic analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic analysis',
      error: error.message
    });
  }
});

// ===================================================================
// VOICE JOURNAL ENDPOINTS
// ===================================================================

// POST /api/journal/voice/start - Initiate voice call via Retell AI
router.post("/voice/start", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    console.log('🎙️  Starting voice call for user:', userId);

    // Call n8n webhook to get Retell AI credentials
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1079892.hstgr.cloud/webhook/bb3f8a23-28e7-44c5-b909-a61bc74dbf92';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
        source: 'neurocompanion-journal'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', response.status, errorText);
      throw new Error(`Webhook returned ${response.status}: ${errorText}`);
    }

    const callData = await response.json();
    
    console.log('✅ Retell AI call initiated:', {
      callId: callData.call_id,
      hasToken: !!callData.access_token
    });
    
    res.json({
      success: true,
      data: {
        callId: callData.call_id,
        accessToken: callData.access_token
      }
    });

  } catch (error) {
    console.error('❌ Voice call initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start voice call',
      error: error.message
    });
  }
});

// POST /api/journal/voice/webhook - Receive transcript from n8n/Retell
router.post("/voice/webhook", async (req, res) => {
  try {
    const { 
      userId,
      callId, 
      transcript, 
      duration,
      status 
    } = req.body;

    console.log('🎙️  Voice webhook received:', { userId, callId, status, transcriptLength: transcript?.length });

    if (!userId || !callId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, callId'
      });
    }

    if (status !== 'completed' || !transcript) {
      return res.json({
        success: true,
        message: 'Call status updated',
        status
      });
    }

    console.log('📝 Processing transcript...');

    // Analyze transcript with AI
    let aiAnalysis = null;
    let emotion = 'neutral';
    let topics = [];
    let keywords = [];
    let stressLevel = 'low';
    let stressScore = 0;
    let stressTriggers = [];
    let emotionalIntensity = 5;
    let mood = 5;

    if (transcript.length > 20) {
      const analysis = await analyzeEntryWithAI(transcript);
      
      if (analysis) {
        emotion = analysis.mood || 'neutral';
        topics = analysis.topics || [];
        keywords = analysis.keywords || [];
        stressLevel = analysis.stressLevel || 'low';
        stressScore = analysis.stressScore || 0;
        stressTriggers = analysis.stressTriggers || [];
        emotionalIntensity = analysis.emotionalIntensity || 5;
        aiAnalysis = analysis.summary || '';
        
        // Calculate mood score from sentiment and stress
        if (analysis.sentiment === 'positive') {
          mood = 7 + Math.round((1 - stressScore / 10) * 3);
        } else if (analysis.sentiment === 'negative') {
          mood = 3 - Math.round(stressScore / 10 * 2);
        } else {
          mood = 5;
        }
        mood = Math.max(1, Math.min(10, mood));
      }
    }

    // Create journal entry from voice transcript
    const newEntry = new JournalEntry({
      userId,
      content: transcript,
      emotion,
      emotionConfidence: 0.85,
      language: 'english',
      mood,
      topics,
      keywords,
      stressLevel,
      stressScore,
      stressTriggers,
      emotionalIntensity,
      aiAnalysis: aiAnalysis || 'Voice journal entry captured successfully.',
      isVoiceEntry: true,
      voiceCallId: callId,
      voiceDuration: duration || 0,
      voiceTranscript: transcript,
      isPrivate: true
    });

    const savedEntry = await newEntry.save();

    console.log('✅ Voice journal entry created:', savedEntry._id);

    res.json({
      success: true,
      message: 'Voice journal entry saved successfully',
      data: {
        entryId: savedEntry._id,
        emotion,
        topics: topics.slice(0, 3),
        stressLevel
      }
    });

  } catch (error) {
    console.error('❌ Voice webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice call data',
      error: error.message
    });
  }
});

// GET /api/journal/voice/status/:callId - Check call status
router.get("/voice/status/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    
    console.log('🔍 Checking voice call status for:', callId);
    
    // FIRST: Check if journal already exists
    const entry = await VoiceJournal.findOne({ call_id: callId }).lean();
    
    if (entry) {
      console.log('✅ Found completed journal entry:', entry._id);
      const response = {
        success: true,
        status: 'completed',
        entryId: entry._id,
        emotion: entry.mood,
        sentiment: entry.sentiment,
        createdAt: entry.createdAt
      };
      console.log('📤 Sending response:', JSON.stringify(response));
      res.json(response);
      return;
    }
    
    // SECOND: Check if call report exists (Retell writes directly to DB)
    const callReport = await CallReport.findOne({ call_id: callId }).lean();
    
    if (callReport) {
      console.log('📞 Found call report, processing now...');
      
      // Import the processing function
      const { createJournalFromCallReport } = await import('../controllers/voiceJournalController.js');
      
      try {
        // Process it immediately
        await createJournalFromCallReport(callReport._id);
        
        // Check if journal was created
        const newEntry = await VoiceJournal.findOne({ call_id: callId }).lean();
        if (newEntry) {
          console.log('✅ Journal created successfully:', newEntry._id);
          const response = {
            success: true,
            status: 'completed',
            entryId: newEntry._id,
            emotion: newEntry.mood,
            sentiment: newEntry.sentiment,
            createdAt: newEntry.createdAt
          };
          console.log('📤 Sending response:', JSON.stringify(response));
          res.json(response);
        } else {
          console.log('⏳ Journal not yet created, returning processing status');
          res.json({
            success: true,
            status: 'processing',
            message: 'Creating journal entry...'
          });
        }
      } catch (processError) {
        console.error('❌ Failed to process call report:', processError);
        res.json({
          success: true,
          status: 'pending',
          message: 'Processing in progress...'
        });
      }
    } else {
      console.log('⏳ Journal entry not yet created for call:', callId);
      res.json({
        success: true,
        status: 'pending',
        message: 'Waiting for transcript processing'
      });
    }

  } catch (error) {
    console.error('❌ Voice status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check call status',
      error: error.message
    });
  }
});

export default router;
