import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caregiver',
      required: true,
      index: true
    },

    createdBy: {
      type: String,
      enum: ['patient', 'caregiver'],
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true
    },

    message: {
      type: String,
      default: ''
    },

    respondedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Prevent duplicate pending requests between the same patient and caregiver
connectionRequestSchema.index(
  { patient: 1, caregiver: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default mongoose.model('ConnectionRequest', connectionRequestSchema);
