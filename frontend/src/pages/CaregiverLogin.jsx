import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Mail, UserPlus, ArrowRight, Shield, Activity, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CaregiverLogin = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialization: '',
    phone: '',
    organization: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/caregiver/login' : '/api/caregiver/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.success) {
        // Store token and caregiver info
        localStorage.setItem('caregiverToken', data.token);
        localStorage.setItem('caregiverInfo', JSON.stringify(data.caregiver));
        
        // Navigate to dashboard
        navigate('/caregiver/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-background)' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center"
      >
        {/* Left side - Branding */}
        <motion.div
          variants={formVariants}
          className="hidden md:block space-y-6"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--primary-500)' }}>
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                NeuroCompanion
              </h1>
              <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                Caregiver Portal
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-100)' }}>
                <Shield className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                  Secure Access
                </h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                  HIPAA-compliant platform to monitor patient progress safely
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-100)' }}>
                <Activity className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                  Real-Time Insights
                </h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                  Track emotions, tasks, and wellness metrics in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-100)' }}>
                <Users className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                  Patient Management
                </h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                  Manage multiple patients with comprehensive analytics
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login/Register Form */}
        <motion.div
          variants={formVariants}
          className="p-8 rounded-2xl shadow-2xl"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="opacity-70" style={{ color: 'var(--text-color)' }}>
              {isLogin ? 'Sign in to access your dashboard' : 'Register as a caregiver or therapist'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg border text-sm"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb), 0.10)',
                borderColor: 'var(--primary-500)',
                color: 'var(--text-color)'
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                    outline: 'none'
                  }}
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50" style={{ color: 'var(--text-color)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                    outline: 'none'
                  }}
                  placeholder="caregiver@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50" style={{ color: 'var(--text-color)' }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                    outline: 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                      placeholder="LIC-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      outline: 'none'
                    }}
                    placeholder="Clinical Psychology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)',
                      outline: 'none'
                    }}
                    placeholder="City Mental Health Center"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  licenseNumber: '',
                  specialization: '',
                  phone: '',
                  organization: ''
                });
              }}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-color)' }}
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <span className="font-semibold" style={{ color: 'var(--primary-500)' }}>
                    Register here
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="font-semibold" style={{ color: 'var(--primary-500)' }}>
                    Sign in
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CaregiverLogin;
