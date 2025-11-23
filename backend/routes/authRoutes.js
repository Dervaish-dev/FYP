import express from 'express';
import { register, login, getCurrentUser, logout, validateRegister, validateLogin } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);

export default router;
