import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import InputField from './InputField';

const AuthForm = ({
  type = 'login',
  onSubmit,
  isLoading,
  error,
  onClearError
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    neurotype: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const isLogin = type === 'login';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error && onClearError) {
      onClearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!isLogin && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Email must contain @ symbol';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/? etc.)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      onSubmit(submitData);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isLogin && (
        <>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            placeholder="Enter your full name"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              error={formErrors.age}
              placeholder="Enter your age"
              min="13"
              max="120"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Neurotype</label>
              <select
                name="neurotype"
                value={formData.neurotype}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select neurotype...</option>
                <option value="ADHD">ADHD</option>
                <option value="Autism">Autism</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Dyslexia">Dyslexia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}

      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        placeholder="Enter your email"
        required
      />

      <div className="relative">
        <InputField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          placeholder="Enter your password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {isLogin && (
        <div className="flex justify-between">
          <Link to="/caregiver/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Caregiver Portal
          </Link>
          <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </Link>
        </div>
      )}

      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
          </>
        ) : (
          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
        )}
      </motion.button>
    </motion.form>
  );
};

export default AuthForm;
