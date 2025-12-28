import mongoose from 'mongoose';
import CallReport from '../models/CallReport.js';
import { convertTranscriptToJournal } from '../utils/journalConverter.js';
import { InferenceClient } from '@huggingface/inference';

// Initialize HuggingFace client
const hfClient = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN)
  ? new InferenceClient(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN)
  : null;

// Helper function to analyze emotion with HuggingFace
async function analyzeEmotionWithHF(content) {
  if (!hfClient) {
    console.log('⚠️ HF client not configured, skipping HF analysis');
    return null;
  }

  try {
    console.log('🤗 Analyzing emotion with Hugging Face...');
    const output = await hfClient.textClassification({
      model: "j-hartmann/emotion-english-distilroberta-base",
      inputs: content.substring(0, 512), // Model has 512 token limit
    });

    console.log('✅ HF emotion results:', output);

    if (output && output.length > 0) {
      const topEmotion = output[0];
      
      // Map HF emotions to our system
      const emotionMap = {
        'joy': { mood: 'happy', sentiment: 'positive', intensity: 8, stress: 'low' },
        'sadness': { mood: 'sad', sentiment: 'negative', intensity: 7, stress: 'medium' },
        'anger': { mood: 'angry', sentiment: 'negative', intensity: 9, stress: 'high' },
        'fear': { mood: 'anxious', sentiment: 'negative', intensity: 8, stress: 'high' },
        'surprise': { mood: 'excited', sentiment: 'positive', intensity: 7, stress: 'medium' },
        'disgust': { mood: 'angry', sentiment: 'negative', intensity: 6, stress: 'medium' },
        'neutral': { mood: 'neutral', sentiment: 'neutral', intensity: 5, stress: 'medium' }
      };

      const mapped = emotionMap[topEmotion.label] || emotionMap['neutral'];
      
      return {
        emotion: topEmotion.label,
        confidence: topEmotion.score,
        mood: mapped.mood,
        sentiment: mapped.sentiment,
        emotionalIntensity: mapped.intensity,
        stressLevel: mapped.stress,
        sentimentConfidence: topEmotion.score
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ HF emotion analysis error:', error.message);
    return null;
  }
}

// Define Journal schema inline (or import if separate file)
const journalSchema = new mongoose.Schema({
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

const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);

/**
 * Webhook handler for Retell AI call completion
 * Receives call data and initiates journal creation after delay
 */
export async function handleCallCompleted(req, res) {
  try {
    console.log('📞 Received call completion webhook');
    console.log('📦 Payload:', JSON.stringify(req.body, null, 2));
    
    const { call_id, user_id, transcript, summary } = req.body;
    
    // Validate required fields
    if (!call_id || !user_id || !transcript) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: call_id, user_id, transcript'
      });
    }
    
    // Check if already processed
    const existing = await CallReport.findOne({ call_id });
    if (existing?.processed) {
      console.log('⏭️ Call already processed:', call_id);
      return res.status(200).json({
        success: true,
        message: 'Call already processed',
        journal_id: existing.journal_id
      });
    }
    
    // Store/update call report
    let callReport;
    if (existing) {
      callReport = existing;
      callReport.transcript = transcript;
      callReport.summary = summary || '';
      await callReport.save();
    } else {
      callReport = await CallReport.create({
        user_id,
        call_id,
        transcript,
        summary: summary || '',
        processed: false
      });
    }
    
    console.log('✅ Call report saved:', call_id);
    
    // Respond immediately to webhook
    res.status(200).json({
      success: true,
      message: 'Call received, processing journal entry',
      call_id
    });
    
    // Process journal creation after 3-second delay (non-blocking)
    setTimeout(async () => {
      try {
        await createJournalFromCallReport(callReport._id);
      } catch (error) {
        console.error('❌ Background journal creation failed:', error);
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
}

/**
 * Create journal entry from call report
 * Called after delay from webhook OR on-demand from status check
 */
export async function createJournalFromCallReport(callReportId) {
  try {
    console.log('📝 Starting journal creation for call:', callReportId);
    
    const callReport = await CallReport.findById(callReportId);
    if (!callReport) {
      throw new Error('Call report not found');
    }
    
    if (callReport.processed) {
      console.log('⏭️ Already processed');
      return;
    }
    
    // Use the summary from call report directly (skip Gemini processing)
    console.log('📝 Using call report summary directly');
    console.log('📝 Summary length:', callReport.summary?.length || 0);
    
    // Use HuggingFace emotion detection on summary
    let mood = 'neutral';
    let sentiment = 'neutral';
    let stressLevel = 'medium';
    let emotionalIntensity = 5;
    let sentimentConfidence = 0.5;
    
    const hfResult = await analyzeEmotionWithHF(callReport.summary || '');
    if (hfResult) {
      mood = hfResult.mood;
      sentiment = hfResult.sentiment;
      emotionalIntensity = hfResult.emotionalIntensity;
      stressLevel = hfResult.stressLevel;
      sentimentConfidence = hfResult.sentimentConfidence;
      console.log('😊 Detected emotion:', mood, 'with confidence:', sentimentConfidence);
    } else {
      console.log('⚠️ Using neutral emotion fallback');
    }
    
    // Create journal entry
    const journalDate = new Date(callReport.created_at);
    const title = `Voice Journal - ${journalDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    const journal = await Journal.create({
      userId: new mongoose.Types.ObjectId(callReport.user_id),
      title,
      content: callReport.summary, // Use summary as content
      summary: callReport.summary,
      mood: mood,
      sentiment: sentiment,
      sentimentConfidence: sentimentConfidence,
      stressLevel: stressLevel,
      stressScore: stressLevel === 'high' ? 8 : stressLevel === 'medium' ? 5 : 2,
      emotionalIntensity: emotionalIntensity,
      topics: [],
      keywords: [],
      source: 'voice_call',
      call_id: callReport.call_id,
      createdAt: callReport.created_at
    });
    
    console.log('✅ Journal created:', journal._id);
    
    // Mark as processed
    callReport.processed = true;
    callReport.journal_id = journal._id;
    await callReport.save();
    
    console.log('✅ Call report marked as processed');
    
    // TODO: Send notification to user
    // await notifyUser(callReport.user_id, journal._id);
    
    return journal;
  } catch (error) {
    console.error('❌ Journal creation error:', error);
    throw error;
  }
}

/**
 * Process latest unprocessed call for user (MOBILE APP ENDPOINT)
 * Called when user ends call in mobile app
 * POST /api/voice-journal/process-latest
 * Body: { user_id: "xxx" }
 */
export async function processLatestCall(req, res) {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id required'
      });
    }
    
    console.log(`📱 Processing latest call for user: ${user_id}`);
    
    // Find latest unprocessed call for this user
    const latestCall = await CallReport.findOne({
      user_id,
      processed: false
    }).sort({ created_at: -1 });
    
    if (!latestCall) {
      return res.status(404).json({
        success: false,
        message: 'No unprocessed calls found for this user'
      });
    }
    
    console.log(`✅ Found latest call: ${latestCall.call_id}`);
    
    // Process immediately (no delay)
    const journal = await createJournalFromCallReport(latestCall._id);
    
    console.log(`✅ Journal created: ${journal._id}`);
    
    res.json({
      success: true,
      message: 'Voice journal created successfully',
      journal: {
        _id: journal._id,
        title: journal.title,
        content: journal.content,
        summary: journal.summary,
        mood: journal.mood,
        emotionalIntensity: journal.emotionalIntensity,
        sentiment: journal.sentiment,
        stressLevel: journal.stressLevel,
        topics: journal.topics,
        keywords: journal.keywords,
        call_id: journal.call_id,
        createdAt: journal.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Process latest error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Manual trigger to process unprocessed calls
 * GET /api/voice-journal/process-pending?user_id=xxx
 */
export async function processPendingCalls(req, res) {
  try {
    const { user_id } = req.query;
    
    const query = { processed: false };
    if (user_id) {
      query.user_id = user_id;
    }
    
    const pendingCalls = await CallReport.find(query).sort({ created_at: -1 });
    
    console.log(`📋 Found ${pendingCalls.length} pending calls`);
    
    const results = [];
    for (const call of pendingCalls) {
      try {
        const journal = await createJournalFromCallReport(call._id);
        results.push({
          call_id: call.call_id,
          journal_id: journal._id,
          success: true
        });
      } catch (error) {
        results.push({
          call_id: call.call_id,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('❌ Process pending error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get voice journal entries for a user
 * GET /api/voice-journal/history?user_id=xxx
 */
export async function getVoiceJournalHistory(req, res) {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id required'
      });
    }
    
    const journals = await Journal.find({
      userId: new mongoose.Types.ObjectId(user_id),
      source: 'voice_call'
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json({
      success: true,
      count: journals.length,
      journals
    });
  } catch (error) {
    console.error('❌ History error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
