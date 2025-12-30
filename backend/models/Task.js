import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  dueTime: {
    type: Date,
    required: true
  },
  repeat: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'custom'],
    default: 'once'
  },
  customInterval: {
    type: Number, // days
    default: null
  },
  steps: {
    type: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true, trim: true, maxlength: 200 },
        done: { type: Boolean, default: false }
      }
    ],
    default: []
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  occurrenceIndex: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isNudged: {
    type: Boolean,
    default: false
  },
  nudgeCount: {
    type: Number,
    default: 0
  }
});

// Compound index for efficient time-based queries with sorting
taskSchema.index({ userId: 1, dueTime: 1 });
taskSchema.index({ userId: 1, status: 1 });

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
