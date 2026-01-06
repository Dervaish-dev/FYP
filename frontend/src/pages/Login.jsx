import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Palette } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { login, verify2FA, isLoading, error, clearError } = useAuth();
  const { 
    theme, setTheme, 
    selectedTheme, setSelectedTheme, 
    themes 
  } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const data = await login(credentials);
      if (data.requires2FA) {
        setShowOTP(true);
        setUserId(data.userId);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login error:', error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verify2FA(userId, otp);
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP Verification error:', error);
    }
  };

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
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your NeuroCompanion account
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {showOTP ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Enter the code sent to your email</p>
              </div>
              
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="123456"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              <AuthForm
                type="login"
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
                onClearError={clearError}
              />

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/join" 
                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>Sign up</span>
                    <ArrowRight size={16} />
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Theme Selector */}
        <motion.div 
          className="card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Palette size={18} className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">
                Choose Theme: {themes[theme]?.name || 'Ocean'}
              </span>
            </div>
            <motion.div
              animate={{ rotate: showThemeSelector ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight size={16} />
            </motion.div>
          </button>
          
          {showThemeSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t grid grid-cols-2 gap-3"
            >
              {Object.entries(themes)
                .filter(([key]) => !key.startsWith('theme-')) // Hide emotion-based themes
                .map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setSelectedTheme(key);
                      setShowThemeSelector(false);
                    }}
                    className="p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2"
                    style={{
                      borderColor: selectedTheme === key ? 'var(--theme-primary)' : '#e5e7eb',
                      backgroundColor: selectedTheme === key ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'
                    }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeData.colors.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeData.colors.secondary }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{themeData.name}</span>
                  </button>
                ))}
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>© 2024 NeuroCompanion. Your intelligent mental health companion.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
