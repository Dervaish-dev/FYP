import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import InputField from '../components/InputField';
import { inviteAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JoinPage = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, setSession } = useAuth();

  const [step, setStep] = useState('code'); // code -> email -> otp -> password

  const [code, setCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [email, setEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [claimToken, setClaimToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const normalizedCode = useMemo(() => String(code || '').trim().toUpperCase(), [code]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setInterval(() => setCooldownSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownSeconds]);

  const resetError = () => setError('');

  const handleLookup = async (e) => {
    e.preventDefault();
    resetError();

    if (!normalizedCode) {
      setError('Invite code is required');
      return;
    }

    try {
      setLoading(true);
      const res = await inviteAPI.lookup({ code: normalizedCode });
      setMaskedEmail(res.maskedEmail);
      setStep('email');
    } catch (err) {
      setError(err?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetError();

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter your full email address');
      return;
    }

    try {
      setLoading(true);
      const res = await inviteAPI.sendOtp({ code: normalizedCode, email: normalizedEmail });
      setOtpEmail(normalizedEmail);
      setCooldownSeconds(60);
      setStep('otp');
      return res;
    } catch (err) {
      if (err?.retryAfterSeconds) {
        setCooldownSeconds(Number(err.retryAfterSeconds) || 60);
      }
      if (Array.isArray(err?.missing) && err.missing.length) {
        setError(`${err?.message || 'Missing required fields'}: ${err.missing.join(', ')}`);
      } else {
        setError(err?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetError();

    const normalizedEmail = String(otpEmail || email || '').trim().toLowerCase();
    const cleanedOtp = String(otp || '').trim();

    if (!normalizedCode) {
      setError('Invite code is missing. Please go back and enter your invite code again.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Email is missing. Please go back and enter your email again.');
      return;
    }

    if (!cleanedOtp || cleanedOtp.length < 4) {
      setError('Enter the verification code from your email');
      return;
    }

    try {
      setLoading(true);
      const res = await inviteAPI.verifyOtp({ code: normalizedCode, email: normalizedEmail, otp: cleanedOtp });
      setClaimToken(res.claimToken);
      setStep('password');
    } catch (err) {
      if (Array.isArray(err?.missing) && err.missing.length) {
        setError(`${err?.message || 'Missing required fields'}: ${err.missing.join(', ')}`);
      } else {
        setError(err?.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (e) => {
    e.preventDefault();
    resetError();

    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('Password must be 8+ characters and include letters and numbers');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await inviteAPI.finalize({ claimToken, password });
      if (res?.data?.token && res?.data?.user) {
        setSession({ user: res.data.user, token: res.data.token });
        navigate('/dashboard');
      } else {
        setError('Account created but login failed. Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const canResend = cooldownSeconds === 0 && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center mb-4"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Brain className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join as Patient</h2>
          <p className="text-gray-600">Use the invite code provided by your caregiver</p>
        </motion.div>

        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {step === 'code' && (
            <form onSubmit={handleLookup} className="space-y-6">
              <InputField
                label="Invite Code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your invite code"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Checking...' : 'Continue'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1 transition-colors">
                  <ArrowLeft size={16} />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </form>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
                <p className="text-sm">Invite is for: <span className="font-medium">{maskedEmail}</span></p>
                <p className="text-xs opacity-80 mt-1">Enter the full email address to receive an OTP.</p>
              </div>

              <InputField
                label="Your Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your full email"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Sending...' : 'Send OTP'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('code');
                  setMaskedEmail('');
                  setEmail('');
                  resetError();
                }}
                className="w-full btn-secondary"
              >
                Back
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
                <p className="text-sm">We sent a code to <span className="font-medium">{maskedEmail}</span></p>
              </div>

              <InputField
                label="OTP"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                disabled={!canResend}
                onClick={async () => {
                  resetError();
                  const normalizedEmail = String(otpEmail || email || '').trim().toLowerCase();
                  if (!normalizedCode) {
                    setError('Invite code is missing. Please go back and enter your invite code again.');
                    return;
                  }
                  if (!normalizedEmail || !normalizedEmail.includes('@')) {
                    setError('Email is missing. Please go back and enter your email again.');
                    return;
                  }
                  try {
                    setLoading(true);
                    await inviteAPI.sendOtp({ code: normalizedCode, email: normalizedEmail });
                    setOtpEmail(normalizedEmail);
                    setCooldownSeconds(60);
                  } catch (err) {
                    if (err?.retryAfterSeconds) {
                      setCooldownSeconds(Number(err.retryAfterSeconds) || 60);
                    }
                    if (Array.isArray(err?.missing) && err.missing.length) {
                      setError(`${err?.message || 'Missing required fields'}: ${err.missing.join(', ')}`);
                    } else {
                      setError(err?.message || 'Failed to resend OTP');
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds}s` : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  resetError();
                }}
                className="w-full btn-secondary"
              >
                Back
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleFinalize} className="space-y-6">
              <InputField
                label="Create Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Creating...' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setPassword('');
                  setConfirmPassword('');
                  resetError();
                }}
                className="w-full btn-secondary"
              >
                Back
              </button>
            </form>
          )}
        </motion.div>

        <motion.div
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>Caregivers can sign in at <Link to="/caregiver/login" className="text-primary-600 hover:text-primary-700">Caregiver Portal</Link>.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinPage;
