import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Registration error:', error);
    }
  };

  const features = [
    'Emotion Recognition & Analysis',
    'Adaptive UI Engine',
    'ADHD Task Scheduling',
    'Voice Assistant Integration'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center mb-4"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join NeuroCompanion
          </h2>
          <p className="text-gray-600">
            Create your account and start your journey
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AuthForm
            type="register"
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Sign in</span>
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Coming Soon
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div 
                key={feature}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p>© 2024 NeuroCompanion. Your intelligent mental health companion.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
