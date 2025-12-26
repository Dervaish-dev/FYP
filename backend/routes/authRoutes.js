import express from 'express';
import { 
  register, 
  login, 
  verify2FALogin, 
  toggle2FA, 
  getCurrentUser, 
  logout, 
  validateRegister, 
  validateLogin,
  forgotPassword,
  verifyResetOTP,
  resetPassword
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();




const patientSignupDisabled = (req, res) => {
	return res.status(410).json({
		success: false,
		message: 'Patient self-signup is disabled. Ask your caregiver for an invite code to create your account.'
	});
};

// Public routes
router.post('/signup', patientSignupDisabled);
router.post('/login', validateLogin, login);
router.post('/verify-2fa', verify2FALogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);
router.post('/toggle-2fa', auth, toggle2FA);

export default router;
