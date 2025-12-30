import mongoose from 'mongoose';

const emotionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'calm', 'stressed', 'angry', 'neutral', 'excited', 'worried', 'confused', 'surprised']
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  note: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['manual', 'ai-analysis', 'ai-facial-analysis', 'ai-webcam-analysis'],
    default: 'manual'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient time-based queries with sorting
emotionSchema.index({ userId: 1, timestamp: -1 });

// Create model
// Note: Using 'EmotionHistory' as model name to match existing DB collection if any, or 'Emotion' if preferred.
// The route file used 'EmotionHistory'. I will stick to that to avoid breaking existing data access if any.
const Emotion = mongoose.models.EmotionHistory || mongoose.model('EmotionHistory', emotionSchema);

export default Emotion;
