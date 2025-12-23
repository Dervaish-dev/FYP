import mongoose from 'mongoose';

const patientInviteSchema = new mongoose.Schema(
  {
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caregiver',
      required: true,
      index: true
    },

    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    maskedEmail: {
      type: String,
      required: true
    },

    codeHash: {
      type: String,
      required: true,
      index: true
    },

    // Encrypted copy of the invite code for caregiver viewing (AES-GCM using INVITE_HMAC_SECRET-derived key)
    // Stored as base64url: iv.tag.ciphertext
    codeEnc: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ['PENDING', 'CLAIMED', 'REVOKED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: false
    },

    // Placeholder patient details collected by caregiver
    patientDetails: {
      name: { type: String, required: true, trim: true },
      age: { type: Number, default: null },
      neurotype: {
        type: String,
        enum: ['ADHD', 'Autism', 'Anxiety', 'Dyslexia', 'Other', null],
        default: null
      }
    },

    // Claim / OTP security controls
    claimAttemptCount: { type: Number, default: 0 },
    claimLockedUntil: { type: Date, default: null },

    otpSendCount: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date, default: null },
    otpSendLockedUntil: { type: Date, default: null },

    otpVerifiedAt: { type: Date, default: null },

    claimTokenHash: { type: String, default: null },
    claimTokenExpiresAt: { type: Date, default: null },

    claimedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    claimedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Only one pending invite per email globally (one caregiver per patient).
patientInviteSchema.index(
  { patientEmail: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'PENDING' }
  }
);

export default mongoose.model('PatientInvite', patientInviteSchema);
