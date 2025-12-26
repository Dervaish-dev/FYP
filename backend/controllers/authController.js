import jwt from 'jsonwebtoken';
import { validationResult, body } from 'express-validator';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';


// Validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain both letters and numbers'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register User
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, age, neurotype } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user with age and neurotype
    const user = await User.create({
      name,
      email,
      password,
      age: age ? parseInt(age) : null,
      neurotype: neurotype || null
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 2FA Check
    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.loginOTP = otp;
      user.loginOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      try {
        await sendOtpEmail({ to: user.email, otp, expiresMinutes: 10 });
        return res.status(200).json({
          success: true,
          requires2FA: true,
          userId: user._id,
          message: '2FA code sent to email'
        });
      } catch (err) {
        console.error('2FA Email Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send 2FA code' });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Current User (Protected route)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    // For JWT, logout is handled client-side by removing the token
    // But we can log the logout event here if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify 2FA Login
const verify2FALogin = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId).select('+loginOTP +loginOTPExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.loginOTP || user.loginOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.loginOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Clear OTP
    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (err) {
    console.error('Verify 2FA Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle 2FA
const toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    
    res.json({ 
      success: true, 
      twoFactorEnabled: user.twoFactorEnabled,
      message: user.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'
    });
  } catch (err) {
    console.error('Toggle 2FA Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset code has been sent.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    try {
      await sendOtpEmail({ to: user.email, otp, expiresMinutes: 10 });
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
};

// Verify Reset OTP
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified' });

  } catch (error) {
    console.error('Verify Reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
       return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export {
  register,
  login,
  verify2FALogin,
  toggle2FA,
  getCurrentUser,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};
