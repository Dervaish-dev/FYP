import express from 'express';
import { register, login, getCurrentUser, logout, validateRegister, validateLogin } from '../controllers/authController.js';
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

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);

export default router;
