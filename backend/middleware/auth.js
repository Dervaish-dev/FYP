import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Caregiver from '../models/Caregiver.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a caregiver token
    if (decoded.role === 'caregiver') {
      const caregiver = await Caregiver.findById(decoded.id);
      
      if (!caregiver || !caregiver.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid or caregiver account is inactive.'
        });
      }

      req.user = { 
        userId: caregiver._id,
        role: 'caregiver',
        email: caregiver.email
      };
      return next();
    }
    
    // Otherwise, it's a patient token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

    req.user = { 
      userId: user._id,
      role: user.role || 'patient'
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

export default auth;
