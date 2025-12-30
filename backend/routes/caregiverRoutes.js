import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';
import { sendOtpEmail } from '../utils/mailer.js';

const noAudit = (req, res, next) => next();

const router = express.Router();

// Middleware to authenticate caregiver
const authenticateCaregiver = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'caregiver') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Caregiver role required.'
      });
    }

    const caregiver = await Caregiver.findById(decoded.id);
    
    if (!caregiver || !caregiver.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Caregiver account not found or inactive.'
      });
    }

    req.caregiver = { id: caregiver._id, email: caregiver.email };
    next();
  } catch (error) {
    console.error('Caregiver auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Helper function to calculate mood trend
const calculateMoodTrend = (emotions) => {
  if (!emotions || emotions.length < 2) return 'stable';
  
  const recent = emotions.slice(0, 7);
  const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'content'];
  const negativeEmotions = ['sad', 'anxious', 'angry', 'frustrated', 'stressed'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  recent.forEach(e => {
    if (positiveEmotions.includes(e.emotion?.toLowerCase())) positiveCount++;
    if (negativeEmotions.includes(e.emotion?.toLowerCase())) negativeCount++;
  });
  
  if (positiveCount > negativeCount * 1.5) return 'improving';
  if (negativeCount > positiveCount * 1.5) return 'declining';
  return 'stable';
};

// Helper function to calculate wellness score
const calculateWellnessScore = (emotions, tasks, journals, sleepData) => {
  let score = 50; // Base score
  
  // Emotion factor (max +20)
  if (emotions && emotions.length > 0) {
    const positiveEmotions = emotions.filter(e => 
      ['happy', 'excited', 'grateful', 'peaceful', 'content'].includes(e.emotion?.toLowerCase())
    );
    score += Math.min(20, (positiveEmotions.length / emotions.length) * 20);
  }
  
  // Task completion factor (max +15)
  if (tasks && tasks.length > 0) {
    const completedTasks = tasks.filter(t => t.status === 'done');
    score += Math.min(15, (completedTasks.length / tasks.length) * 15);
  }
  
  // Journal activity factor (max +10)
  if (journals && journals.length > 0) {
    score += Math.min(10, journals.length);
  }
  
  // Sleep quality factor (max +5)
  if (sleepData && sleepData.length > 0) {
    const avgQuality = sleepData.reduce((sum, s) => sum + (s.quality || 0), 0) / sleepData.length;
    score += avgQuality;
  }
  
  return Math.min(100, Math.round(score));
};

// POST /api/caregiver/register - Register new caregiver (with OTP verification)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    // Check if caregiver already exists
    const existingCaregiver = await Caregiver.findOne({ email: email.toLowerCase() });
    if (existingCaregiver) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver with this email already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create new caregiver (inactive until OTP verified)
    const caregiver = new Caregiver({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      isActive: false,
      loginOTP: otp,
      loginOTPExpires: otpExpires
    });

    await caregiver.save();

    // Send OTP email
    try {
      await sendOtpEmail({ to: caregiver.email, otp, expiresMinutes: 10 });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email with the OTP sent.',
        requiresOTP: true,
        caregiverId: caregiver._id,
        email: caregiver.email
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete the caregiver if email fails
      await Caregiver.findByIdAndDelete(caregiver._id);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Caregiver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// POST /api/caregiver/verify-otp - Verify OTP and activate account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    // Find caregiver
    const caregiver = await Caregiver.findOne({ email: email.toLowerCase() })
      .select('+loginOTP +loginOTPExpires');
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found.'
      });
    }

    // Check if already active
    if (caregiver.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.'
      });
    }

    // Check OTP expiry
    if (!caregiver.loginOTPExpires || caregiver.loginOTPExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (caregiver.loginOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.'
      });
    }

    // Activate account
    caregiver.isActive = true;
    caregiver.loginOTP = undefined;
    caregiver.loginOTPExpires = undefined;
    await caregiver.save();

    // Generate token
    const token = jwt.sign(
      { id: caregiver._id, role: 'caregiver', email: caregiver.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message
    });
  }
});

// POST /api/caregiver/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const caregiver = await Caregiver.findOne({ email: email.toLowerCase() })
      .select('+loginOTP +loginOTPExpires');
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found.'
      });
    }

    if (caregiver.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    caregiver.loginOTP = otp;
    caregiver.loginOTPExpires = otpExpires;
    await caregiver.save();

    // Send OTP email
    await sendOtpEmail({ to: caregiver.email, otp, expiresMinutes: 10 });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

// POST /api/caregiver/login - Caregiver login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find caregiver
    const caregiver = await Caregiver.findOne({ email: email.toLowerCase() });
    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    if (!caregiver.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, caregiver.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 2FA Check
    if (caregiver.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      caregiver.loginOTP = otp;
      caregiver.loginOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
      await caregiver.save();

      try {
        await sendOtpEmail({ to: caregiver.email, otp, expiresMinutes: 10 });
        return res.status(200).json({
          success: true,
          requires2FA: true,
          caregiverId: caregiver._id,
          message: '2FA code sent to email'
        });
      } catch (err) {
        console.error('2FA Email Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send 2FA code' });
      }
    }

    // Update last login
    caregiver.lastLogin = new Date();
    await caregiver.save();

    // Generate token
    const token = jwt.sign(
      { id: caregiver._id, role: 'caregiver', email: caregiver.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        twoFactorEnabled: caregiver.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Caregiver login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Verify 2FA Login
router.post('/verify-2fa', async (req, res) => {
  const { caregiverId, otp } = req.body;
  try {
    const caregiver = await Caregiver.findById(caregiverId).select('+loginOTP +loginOTPExpires');
    if (!caregiver) return res.status(404).json({ success: false, message: 'Caregiver not found' });

    if (!caregiver.loginOTP || caregiver.loginOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (caregiver.loginOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Clear OTP
    caregiver.loginOTP = undefined;
    caregiver.loginOTPExpires = undefined;
    caregiver.lastLogin = new Date();
    await caregiver.save();

    const token = jwt.sign(
      { id: caregiver._id, role: 'caregiver', email: caregiver.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        twoFactorEnabled: caregiver.twoFactorEnabled
      }
    });
  } catch (err) {
    console.error('Verify 2FA Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle 2FA
router.post('/toggle-2fa', authenticateCaregiver, async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.caregiver.id);
    caregiver.twoFactorEnabled = !caregiver.twoFactorEnabled;
    await caregiver.save();
    res.json({ success: true, twoFactorEnabled: caregiver.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/caregiver/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const caregiver = await Caregiver.findOne({ email: email.toLowerCase() });

    if (!caregiver) {
      // Return success even if not found to prevent enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset code has been sent.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    caregiver.resetPasswordOTP = otp;
    caregiver.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await caregiver.save();

    try {
      await sendOtpEmail({ to: caregiver.email, otp, expiresMinutes: 10 });
    } catch (err) {
      console.error('Reset Password Email Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to send reset code' });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset code has been sent.'
    });

  } catch (error) {
    console.error('Forgot Password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/caregiver/verify-reset-otp
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const caregiver = await Caregiver.findOne({ 
      email: email.toLowerCase(), 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!caregiver) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified' });

  } catch (error) {
    console.error('Verify Reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/caregiver/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const caregiver = await Caregiver.findOne({ 
      email: email.toLowerCase(), 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!caregiver) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    caregiver.password = await bcrypt.hash(newPassword, 10);
    caregiver.resetPasswordOTP = undefined;
    caregiver.resetPasswordOTPExpires = undefined;
    await caregiver.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/caregiver/me - Get caregiver profile
router.get('/me', authenticateCaregiver, async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.caregiver.id).select('-password');
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    res.json({
      success: true,
      caregiver
    });
  } catch (error) {
    console.error('Get caregiver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/caregiver/me - Update caregiver profile (safe fields only)
router.put('/me', authenticateCaregiver, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const caregiver = await Caregiver.findById(req.caregiver.id);
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const updates = { name, phone };
    const allowedKeys = Object.keys(updates);
    const hasAnyUpdate = allowedKeys.some((key) => updates[key] !== undefined);
    if (!hasAnyUpdate) {
      return res.status(400).json({
        success: false,
        message: 'No profile fields provided to update'
      });
    }

    if (name !== undefined) caregiver.name = name;
    if (phone !== undefined) caregiver.phone = phone;

    await caregiver.save();

    const updated = await Caregiver.findById(req.caregiver.id).select('-password');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      caregiver: updated
    });
  } catch (error) {
    console.error('Update caregiver profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/caregiver/me/password - Change caregiver password
router.put('/me/password', authenticateCaregiver, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const caregiver = await Caregiver.findById(req.caregiver.id);
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, caregiver.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    caregiver.password = await bcrypt.hash(newPassword, 10);
    await caregiver.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change caregiver password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/caregiver/patients - Get all patients for caregiver
router.get('/patients', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;

    // Find caregiver with populated patients - use lean() for performance
    const caregiver = await Caregiver.findById(caregiverId).populate('patients', 'name email createdAt').lean();
    
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    // Extract patient IDs as strings
    const patientIds = caregiver.patients.map(p => p._id.toString());

    // Batch fetch all data in parallel - eliminates N+1 queries
    const db = mongoose.connection.db;
    
    const [emotionsData, tasksData, journalsData, wellnessData] = await Promise.all([
      db.collection('emotionhistories')
        .find({ userId: { $in: patientIds } })
        .sort({ timestamp: -1 })
        .toArray(),
      
      db.collection('tasks')
        .find({ userId: { $in: patientIds } })
        .toArray(),
      
      db.collection('journalentries')
        .find({ userId: { $in: patientIds } })
        .sort({ createdAt: -1 })
        .toArray(),
      
      db.collection('wellness')
        .find({ userId: { $in: patientIds } })
        .sort({ date: -1 })
        .toArray()
    ]);

    // Group data by userId for O(1) lookup
    const emotionsByUser = {};
    const tasksByUser = {};
    const journalsByUser = {};
    const wellnessByUser = {};

    emotionsData.forEach(e => {
      if (!emotionsByUser[e.userId]) emotionsByUser[e.userId] = [];
      if (emotionsByUser[e.userId].length < 30) emotionsByUser[e.userId].push(e);
    });

    tasksData.forEach(t => {
      if (!tasksByUser[t.userId]) tasksByUser[t.userId] = [];
      tasksByUser[t.userId].push(t);
    });

    journalsData.forEach(j => {
      if (!journalsByUser[j.userId]) journalsByUser[j.userId] = [];
      if (journalsByUser[j.userId].length < 10) journalsByUser[j.userId].push(j);
    });

    wellnessData.forEach(w => {
      if (!wellnessByUser[w.userId]) wellnessByUser[w.userId] = [];
      if (wellnessByUser[w.userId].length < 30) wellnessByUser[w.userId].push(w);
    });

    // Build patient details - O(n) instead of O(n²)
    const patientDetails = caregiver.patients.map(patient => {
      try {
        const patientId = patient._id.toString();
        const emotions = emotionsByUser[patientId] || [];
        const tasks = tasksByUser[patientId] || [];
        const journals = journalsByUser[patientId] || [];
        const wellness = wellnessByUser[patientId] || [];

        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const moodTrend = calculateMoodTrend(emotions);
        const wellnessScore = calculateWellnessScore(emotions, tasks, journals, wellness);

        return {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          joinedDate: patient.createdAt,
          lastActive: emotions[0]?.timestamp || patient.createdAt || 'N/A',
          moodTrend,
          tasksCompleted: completedTasks,
          totalTasks: tasks.length,
          wellnessScore,
          recentEmotions: emotions.slice(0, 7),
          journalCount: journals.length,
          activityLevel: emotions.length > 10 ? 'active' : emotions.length > 5 ? 'moderate' : 'low'
        };
      } catch (error) {
        console.error(`Error processing data for patient ${patient._id}:`, error);
        return {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          error: 'Failed to load patient data'
        };
      }
    });

    res.json({
      success: true,
      patients: patientDetails,
      totalPatients: patientDetails.length
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patients',
      error: error.message
    });
  }
});

// GET /api/caregiver/patient/:patientId - Get detailed patient data
router.get('/patient/:patientId', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const { patientId } = req.params;
    const caregiverId = req.caregiver.id;

    // Verify caregiver has access to this patient
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver.patients.some(p => p.toString() === patientId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this patient.'
      });
    }

    // Get patient details - use lean() for performance
    const patient = await User.findById(patientId).select('-password').lean();
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get comprehensive patient data from collections
    const db = mongoose.connection.db;
    
    const emotions = await db.collection('emotionhistories')
      .find({ userId: patientId })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    const tasks = await db.collection('tasks')
      .find({ userId: patientId })
      .toArray();

    const journals = await db.collection('journalentries')
      .find({ userId: patientId })
      .sort({ createdAt: -1 })
      .toArray();

    const wellness = await db.collection('wellness')
      .find({ userId: patientId })
      .sort({ date: -1 })
      .toArray();

    res.json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        createdAt: patient.createdAt
      },
      data: {
        emotions,
        tasks,
        journals,
        wellness
      },
      summary: {
        totalEmotions: emotions.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        totalJournals: journals.length,
        wellnessEntries: wellness.length,
        moodTrend: calculateMoodTrend(emotions),
        wellnessScore: calculateWellnessScore(emotions, tasks, journals, wellness)
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient details',
      error: error.message
    });
  }
});

// POST /api/caregiver/add-patient - Legacy (disabled)
// This endpoint bypassed the current onboarding flow. All onboarding/linking must go through
// the caregiver invite + patient claim workflow under /api/invites.
router.post('/add-patient', authenticateCaregiver, async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'This endpoint has been removed. Use POST /api/invites to create a patient invite and have the patient join via /join.'
  });
});

// DELETE /api/caregiver/patient/:patientId - Remove patient from caregiver's list
router.delete('/patient/:patientId', authenticateCaregiver, async (req, res) => {
  try {
    const { patientId } = req.params;
    const caregiverId = req.caregiver.id;

    const caregiver = await Caregiver.findById(caregiverId);
    caregiver.patients = caregiver.patients.filter(p => p.toString() !== patientId);
    await caregiver.save();

    res.json({
      success: true,
      message: 'Patient removed from your list'
    });
  } catch (error) {
    console.error('Remove patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing patient',
      error: error.message
    });
  }
});

// POST /api/caregiver/message/send - Send message to patient
router.post('/message/send', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const { recipientId, message, subject, priority } = req.body;
    const caregiverId = req.caregiver.id;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message are required'
      });
    }

    // Verify caregiver has access to this patient
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver.patients.some(p => p.toString() === recipientId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient not in your list.'
      });
    }

    const newMessage = new Message({
      sender: caregiverId,
      senderModel: 'Caregiver',
      recipient: recipientId,
      recipientModel: 'User',
      message,
      subject,
      priority: priority || 'normal'
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message',
      error: error.message
    });
  }
});

// GET /api/caregiver/messages/:patientId - Get messages with patient
router.get('/messages/:patientId', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const { patientId } = req.params;
    const caregiverId = req.caregiver.id;

    // Verify access
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver.patients.some(p => p.toString() === patientId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: caregiverId, recipient: patientId },
        { sender: patientId, recipient: caregiverId }
      ],
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages',
      error: error.message
    });
  }
});

// POST /api/caregiver/appointment/create - Create appointment
router.post('/appointment/create', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const { patientId, scheduledDate, duration, type, title, notes, meetingLink } = req.body;
    const caregiverId = req.caregiver.id;

    if (!patientId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and scheduled date are required'
      });
    }

    // Verify access
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver.patients.some(p => p.toString() === patientId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const appointment = new Appointment({
      caregiver: caregiverId,
      patient: patientId,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      type: type || 'check-in',
      title,
      notes,
      meetingLink
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating appointment',
      error: error.message
    });
  }
});

// GET /api/caregiver/appointments - Get all appointments
router.get('/appointments', authenticateCaregiver, noAudit, async (req, res) => {
  try {
    const caregiverId = req.caregiver.id;
    const { status, patientId } = req.query;

    const query = { caregiver: caregiverId };
    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments',
      error: error.message
    });
  }
});

export default router;
