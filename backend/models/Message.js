import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Caregiver', 'User']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Caregiver', 'User']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ read: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);
