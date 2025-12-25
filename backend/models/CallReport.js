import mongoose from 'mongoose';

const callReportSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  call_id: {
    type: String,
    required: true,
    unique: true
  },
  transcript: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  journal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journal',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
callReportSchema.index({ user_id: 1, created_at: -1 });
callReportSchema.index({ call_id: 1 });

const CallReport = mongoose.model('CallReport', callReportSchema, 'call_reports');

export default CallReport;
