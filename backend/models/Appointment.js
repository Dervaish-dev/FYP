import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  caregiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number,
    default: 60, // minutes
    min: 15,
    max: 480
  },
  type: {
    type: String,
    enum: ['check-in', 'therapy', 'consultation', 'follow-up', 'emergency'],
    default: 'check-in'
  },
  title: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  sessionNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  reminders: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['email', 'sms', 'notification']
    }
  }],
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancelledByModel'
  },
  cancelledByModel: {
    type: String,
    enum: ['Caregiver', 'User']
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
appointmentSchema.index({ caregiver: 1, scheduledDate: 1 });
appointmentSchema.index({ patient: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);
