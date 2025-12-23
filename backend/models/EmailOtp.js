import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema(
  {
    invite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientInvite',
      required: true,
      index: true
    },

    otpHash: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['ISSUED', 'VERIFIED', 'EXPIRED'],
      default: 'ISSUED',
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    attemptCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null }
  },
  { timestamps: true }
);

// TTL cleanup for expired OTP documents
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('EmailOtp', emailOtpSchema);
