import mongoose from 'mongoose';

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

// Add index for fast call_id lookups
journalSchema.index({ call_id: 1 });
journalSchema.index({ userId: 1, createdAt: -1 });

const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema, 'journalentries');

export default Journal;
