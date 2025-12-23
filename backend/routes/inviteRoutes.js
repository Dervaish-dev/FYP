import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';
import PatientInvite from '../models/PatientInvite.js';
import EmailOtp from '../models/EmailOtp.js';

import { isMailerConfigError, sendOtpEmail } from '../utils/mailer.js';
import {
  normalizeEmail,
  maskEmail,
  hmac,
  encryptWithSecret,
  decryptWithSecret,
  generateInviteCode,
  generateOtp,
  generateClaimToken
} from '../utils/inviteSecurity.js';

const router = express.Router();

const INVITE_CODE_SECRET = 'INVITE_HMAC_SECRET';
const OTP_SECRET = 'OTP_HMAC_SECRET';
const CLAIM_TOKEN_SECRET = 'CLAIM_TOKEN_HMAC_SECRET';

const INVITE_EXPIRES_HOURS = Number(process.env.INVITE_EXPIRES_HOURS || 72);
const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10);
const CLAIM_TOKEN_EXPIRES_MINUTES = Number(process.env.CLAIM_TOKEN_EXPIRES_MINUTES || 30);

const generatePatientJwt = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const authenticateCaregiver = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'caregiver') {
      return res.status(403).json({ success: false, message: 'Access denied. Caregiver role required.' });
    }

    const caregiver = await Caregiver.findById(decoded.id);
    if (!caregiver || !caregiver.isActive) {
      return res.status(401).json({ success: false, message: 'Caregiver account not found or inactive.' });
    }

    req.caregiver = { id: caregiver._id, email: caregiver.email };
    next();
  } catch (error) {
    console.error('Caregiver auth error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const now = () => new Date();

const isExpired = (invite) => invite.expiresAt && invite.expiresAt.getTime() <= Date.now();

const ensureNotExpired = async (invite) => {
  if (invite.status === 'PENDING' && isExpired(invite)) {
    invite.status = 'EXPIRED';
    await invite.save();
    return true;
  }
  return false;
};

const tooSoon = (last, seconds) => {
  if (!last) return false;
  return Date.now() - new Date(last).getTime() < seconds * 1000;
};

// ---------------- Caregiver: create/list/manage invites ----------------

router.post('/', authenticateCaregiver, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const patientEmail = normalizeEmail(req.body?.patientEmail);
    const patientName = String(req.body?.patientName || '').trim();
    const age = req.body?.age !== undefined && req.body?.age !== null && req.body?.age !== '' ? Number(req.body.age) : null;
    const neurotype = req.body?.neurotype !== undefined && req.body?.neurotype !== null && req.body?.neurotype !== '' ? String(req.body.neurotype) : null;

    if (!patientEmail || !patientName) {
      return res.status(400).json({ success: false, message: 'patientName and patientEmail are required' });
    }

    const existingUser = await User.findOne({ email: patientEmail }).select('_id');
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Patient already exists' });
    }

    const code = generateInviteCode();
    const codeHash = hmac(code, INVITE_CODE_SECRET);
    const codeEnc = encryptWithSecret(code, INVITE_CODE_SECRET);

    const invite = await PatientInvite.create({
      caregiver: caregiverId,
      patientEmail,
      maskedEmail: maskEmail(patientEmail),
      codeHash,
      codeEnc,
      expiresAt: new Date(Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000),
      patientDetails: {
        name: patientName,
        age: Number.isFinite(age) ? age : null,
        neurotype: neurotype || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Invite created',
      invite: {
        id: invite._id,
        code,
        patientEmail: invite.patientEmail,
        maskedEmail: invite.maskedEmail,
        expiresAt: invite.expiresAt,
        status: invite.status,
        patientDetails: invite.patientDetails
      }
    });
  } catch (error) {
    console.error('Create invite error:', error);
    if (String(error?.code) === '11000') {
      return res.status(409).json({ success: false, message: 'An invite is already pending for this email' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', authenticateCaregiver, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const invites = await PatientInvite.find({ caregiver: caregiverId })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      invites: invites.map((i) => ({
        id: i._id,
        patientEmail: i.patientEmail,
        maskedEmail: i.maskedEmail,
        patientDetails: i.patientDetails,
        status: i.status,
        expiresAt: i.expiresAt,
        claimedAt: i.claimedAt,
        createdAt: i.createdAt
      }))
    });
  } catch (error) {
    console.error('List invites error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:inviteId/regenerate', authenticateCaregiver, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ success: false, message: 'Invalid inviteId' });
    }

    const invite = await PatientInvite.findOne({ _id: inviteId, caregiver: caregiverId });
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite not found' });
    }

    if (invite.status === 'CLAIMED') {
      return res.status(409).json({ success: false, message: 'Invite already claimed' });
    }
    if (invite.status === 'REVOKED') {
      return res.status(409).json({ success: false, message: 'Invite is revoked' });
    }

    const code = generateInviteCode();
    invite.codeHash = hmac(code, INVITE_CODE_SECRET);
    invite.codeEnc = encryptWithSecret(code, INVITE_CODE_SECRET);
    invite.status = 'PENDING';
    invite.expiresAt = new Date(Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000);

    invite.claimAttemptCount = 0;
    invite.claimLockedUntil = null;
    invite.otpSendCount = 0;
    invite.lastOtpSentAt = null;
    invite.otpSendLockedUntil = null;
    invite.otpVerifiedAt = null;
    invite.claimTokenHash = null;
    invite.claimTokenExpiresAt = null;

    await invite.save();

    return res.json({
      success: true,
      message: 'Invite regenerated',
      invite: {
        id: invite._id,
        code,
        patientEmail: invite.patientEmail,
        maskedEmail: invite.maskedEmail,
        expiresAt: invite.expiresAt,
        status: invite.status
      }
    });
  } catch (error) {
    console.error('Regenerate invite error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:inviteId/code', authenticateCaregiver, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ success: false, message: 'Invalid inviteId' });
    }

    const invite = await PatientInvite.findOne({ _id: inviteId, caregiver: caregiverId }).select('status codeEnc expiresAt patientEmail maskedEmail');
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite not found' });
    }

    await ensureNotExpired(invite);

    if (invite.status === 'CLAIMED') {
      return res.status(409).json({ success: false, message: 'Invite already claimed' });
    }

    if (!invite.codeEnc) {
      return res.status(409).json({ success: false, message: 'Invite code is not available (legacy invite). Please regenerate it.' });
    }

    const code = decryptWithSecret(invite.codeEnc, INVITE_CODE_SECRET);
    if (!code) {
      return res.status(500).json({ success: false, message: 'Failed to decrypt invite code. Please regenerate it.' });
    }

    return res.json({
      success: true,
      invite: {
        id: invite._id,
        code,
        patientEmail: invite.patientEmail,
        maskedEmail: invite.maskedEmail,
        status: invite.status,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Get invite code error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:inviteId/revoke', authenticateCaregiver, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ success: false, message: 'Invalid inviteId' });
    }

    const invite = await PatientInvite.findOne({ _id: inviteId, caregiver: caregiverId });
    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite not found' });
    }

    if (invite.status === 'CLAIMED') {
      return res.status(409).json({ success: false, message: 'Invite already claimed' });
    }

    invite.status = 'REVOKED';
    await invite.save();

    return res.json({ success: true, message: 'Invite revoked' });
  } catch (error) {
    console.error('Revoke invite error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------------- Patient: claim invite + OTP + finalize ----------------

router.post('/claim/lookup', async (req, res) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const invite = await PatientInvite.findOne({ codeHash: hmac(code, INVITE_CODE_SECRET), status: 'PENDING' });
    if (!invite) {
      return res.status(400).json({ success: false, message: 'Invalid invite code' });
    }

    const expired = await ensureNotExpired(invite);
    if (expired) {
      return res.status(400).json({ success: false, message: 'Invalid invite code' });
    }

    if (invite.claimLockedUntil && invite.claimLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
    }

    return res.json({
      success: true,
      maskedEmail: invite.maskedEmail,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error('Lookup invite error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/claim/send-otp', async (req, res) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    const email = normalizeEmail(req.body?.email);

    if (!code || !email) {
      return res.status(400).json({ success: false, message: 'Code and email are required' });
    }

    const invite = await PatientInvite.findOne({ codeHash: hmac(code, INVITE_CODE_SECRET), status: 'PENDING' });
    if (!invite) {
      return res.status(400).json({ success: false, message: 'Invalid code or email' });
    }

    const expired = await ensureNotExpired(invite);
    if (expired) {
      return res.status(400).json({ success: false, message: 'Invalid code or email' });
    }

    if (invite.claimLockedUntil && invite.claimLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
    }

    if (invite.otpSendLockedUntil && invite.otpSendLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again later.' });
    }

    if (email !== invite.patientEmail) {
      invite.claimAttemptCount += 1;
      if (invite.claimAttemptCount >= 5) {
        invite.claimLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await invite.save();
      return res.status(400).json({ success: false, message: 'Invalid code or email' });
    }

    if (tooSoon(invite.lastOtpSentAt, 60)) {
      const secondsLeft = Math.ceil((60 * 1000 - (Date.now() - new Date(invite.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({ success: false, message: 'Please wait before requesting another code', retryAfterSeconds: secondsLeft });
    }

    invite.otpSendCount += 1;
    if (invite.otpSendCount > 10) {
      invite.otpSendLockedUntil = new Date(Date.now() + 60 * 60 * 1000);
      await invite.save();
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again later.' });
    }

    // Invalidate previous active OTPs
    await EmailOtp.updateMany(
      { invite: invite._id, status: 'ISSUED' },
      { $set: { status: 'EXPIRED' } }
    );

    const otp = generateOtp();
    const otpHash = hmac(otp, OTP_SECRET);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await EmailOtp.create({
      invite: invite._id,
      otpHash,
      expiresAt
    });

    await sendOtpEmail({ to: invite.patientEmail, otp, expiresMinutes: OTP_EXPIRES_MINUTES });

    invite.lastOtpSentAt = now();
    await invite.save();

    return res.json({
      success: true,
      message: 'OTP sent',
      maskedEmail: invite.maskedEmail,
      otpExpiresInSeconds: OTP_EXPIRES_MINUTES * 60
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    if (isMailerConfigError(error)) {
      return res.status(503).json({
        success: false,
        message: error.message || 'Email sending is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in backend/.env'
      });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/claim/verify-otp', async (req, res) => {
  try {
    const code = String(req.body?.code ?? req.body?.inviteCode ?? req.body?.invite_code ?? '').trim().toUpperCase();
    const email = normalizeEmail(req.body?.email ?? req.body?.patientEmail ?? req.body?.patient_email);
    const otp = String(req.body?.otp ?? req.body?.OTP ?? req.body?.verificationCode ?? req.body?.verification_code ?? '').trim();

    if (!code || !email || !otp) {
      const missing = [];
      if (!code) missing.push('code');
      if (!email) missing.push('email');
      if (!otp) missing.push('otp');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing
      });
    }

    const invite = await PatientInvite.findOne({ codeHash: hmac(code, INVITE_CODE_SECRET), status: 'PENDING' });
    if (!invite) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const expired = await ensureNotExpired(invite);
    if (expired) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (email !== invite.patientEmail) {
      invite.claimAttemptCount += 1;
      if (invite.claimAttemptCount >= 5) {
        invite.claimLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await invite.save();
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const otpDoc = await EmailOtp.findOne({ invite: invite._id, status: 'ISSUED' }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    if (otpDoc.lockedUntil && otpDoc.lockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
    }

    if (otpDoc.expiresAt.getTime() <= Date.now()) {
      otpDoc.status = 'EXPIRED';
      await otpDoc.save();
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    const otpHash = hmac(otp, OTP_SECRET);
    if (otpHash !== otpDoc.otpHash) {
      otpDoc.attemptCount += 1;
      if (otpDoc.attemptCount >= 5) {
        otpDoc.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await otpDoc.save();
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    otpDoc.status = 'VERIFIED';
    await otpDoc.save();

    const claimToken = generateClaimToken();
    invite.otpVerifiedAt = now();
    invite.claimTokenHash = hmac(claimToken, CLAIM_TOKEN_SECRET);
    invite.claimTokenExpiresAt = new Date(Date.now() + CLAIM_TOKEN_EXPIRES_MINUTES * 60 * 1000);
    await invite.save();

    return res.json({
      success: true,
      message: 'OTP verified',
      claimToken,
      claimTokenExpiresInSeconds: CLAIM_TOKEN_EXPIRES_MINUTES * 60
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/claim/finalize', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const claimToken = String(req.body?.claimToken || '').trim();
    const password = String(req.body?.password || '');

    if (!claimToken || !password) {
      return res.status(400).json({ success: false, message: 'claimToken and password are required' });
    }

    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and contain letters and numbers' });
    }

    const invite = await PatientInvite.findOne({
      claimTokenHash: hmac(claimToken, CLAIM_TOKEN_SECRET),
      status: 'PENDING'
    });

    if (!invite || !invite.claimTokenExpiresAt || invite.claimTokenExpiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired claim token' });
    }

    const expired = await ensureNotExpired(invite);
    if (expired) {
      return res.status(400).json({ success: false, message: 'Invalid or expired claim token' });
    }

    const existingUser = await User.findOne({ email: invite.patientEmail }).select('_id');
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Patient already exists' });
    }

    session.startTransaction();

    const createdUser = await User.create(
      [
        {
          name: invite.patientDetails.name,
          email: invite.patientEmail,
          password,
          age: invite.patientDetails.age ?? null,
          neurotype: invite.patientDetails.neurotype ?? null,
          assignedCaregiver: invite.caregiver
        }
      ],
      { session }
    );

    const user = createdUser[0];

    await Caregiver.updateOne(
      { _id: invite.caregiver },
      { $addToSet: { patients: user._id } },
      { session }
    );

    invite.status = 'CLAIMED';
    invite.claimedAt = now();
    invite.claimedUser = user._id;
    invite.claimTokenHash = null;
    invite.claimTokenExpiresAt = null;

    await invite.save({ session });

    await session.commitTransaction();

    const token = generatePatientJwt(user._id);

    return res.status(201).json({
      success: true,
      message: 'Patient account created',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          neurotype: user.neurotype
        },
        token
      }
    });
  } catch (error) {
    console.error('Finalize invite error:', error);
    try {
      await session.abortTransaction();
    } catch {}

    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    session.endSession();
  }
});

export default router;
