import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Palette } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login error:', error);
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
                      setShowThemeSelector(false);
                    }}
                    className="p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2"
                    style={{
                      borderColor: theme === key ? 'var(--theme-primary)' : '#e5e7eb',
                      backgroundColor: theme === key ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'
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
