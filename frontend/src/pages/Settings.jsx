import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Palette,
  Type,
  Brain,
  LogOut,
  ChevronRight,
  Shield,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { preferencesAPI } from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  getNotificationsEnabled,
  setNotificationsEnabled
} from '../utils/userPreferences';

const SettingsSection = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-6 shadow-sm border mb-6"
    style={{
      backgroundColor: 'var(--theme-card)',
      borderColor: 'var(--theme-border)'
    }}
  >
    <div className="flex items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
      <div className="p-2 rounded-lg bg-opacity-10 mr-4" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
        <Icon size={24} style={{ color: 'var(--theme-primary)' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Settings = () => {
  const { user, logout, toggle2FA } = useAuth();
  const navigate = useNavigate();
  const {
    theme,
    setTheme,
    themes,
    fontSize,
    setFontSize,
    adaptiveMode,
    setAdaptiveMode
  } = useTheme();

  const [notifications, setNotifications] = useState(getNotificationsEnabled());
  const [loading, setLoading] = useState(false);
  const [logoutConfirmModal, setLogoutConfirmModal] = useState(false);
  const [twoFactorConfirmModal, setTwoFactorConfirmModal] = useState(false);
  const [prefs, setPrefs] = useState({
    fullName: user?.name || '',
    age: '',
    neurotype: '',
    notificationTime: 'morning',
    defaultTheme: theme,
    personalGoals: ''
  });

  // Load preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      try {
        const savedPrefs = await preferencesAPI.fetch(user.id);
        if (savedPrefs) {
          setPrefs(prev => ({ ...prev, ...savedPrefs }));
          // Apply saved theme if exists
          if (savedPrefs.defaultTheme && savedPrefs.defaultTheme !== theme) {
            setTheme(savedPrefs.defaultTheme);
          }
          // Apply adaptive mode
          if (savedPrefs.adaptiveMode !== undefined && savedPrefs.adaptiveMode !== adaptiveMode) {
            setAdaptiveMode(savedPrefs.adaptiveMode);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await preferencesAPI.save(user.id, {
        ...prefs,
        notificationsEnabled: notifications,
        adaptiveMode: adaptiveMode
      });
      setNotificationsEnabled(notifications);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    // If 2FA is currently enabled, disable it directly
    if (user?.twoFactorEnabled) {
      try {
        const data = await toggle2FA();
        toast.success(`Two-factor authentication ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        toast.error('Failed to toggle 2FA');
      }
    } else {
      // If 2FA is currently disabled, show confirmation modal before enabling
      setTwoFactorConfirmModal(true);
    }
  };

  const confirm2FAEnable = async () => {
    setTwoFactorConfirmModal(false);
    try {
      const data = await toggle2FA();
      toast.success(`Two-factor authentication ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to enable 2FA');
    }
  };

  const handleLogout = () => {
    setLogoutConfirmModal(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmModal(false);
    logout();
  };

  return (
    <div className="min-h-screen p-6 pb-24" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Settings</h1>
          <p className="opacity-70" style={{ color: 'var(--theme-text)' }}>Manage your account and preferences</p>
        </header>

        {/* Profile Section */}
        <SettingsSection title="Profile Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full p-3 rounded-xl border opacity-70 cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  backgroundColor: 'var(--theme-muted-bg)',
                  color: 'var(--theme-text)' 
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3 rounded-xl border opacity-70 cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  backgroundColor: 'var(--theme-muted-bg)',
                  color: 'var(--theme-text)' 
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Age</label>
              <input
                type="number"
                value={prefs.age || ''}
                disabled
                className="w-full p-3 rounded-xl border opacity-70 cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  backgroundColor: 'var(--theme-muted-bg)',
                  color: 'var(--theme-text)' 
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Neurotype</label>
              <input
                type="text"
                value={prefs.neurotype || ''}
                disabled
                className="w-full p-3 rounded-xl border opacity-70 cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  backgroundColor: 'var(--theme-muted-bg)',
                  color: 'var(--theme-text)' 
                }}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Security Section (Placeholder) */}
        <SettingsSection title="Security" icon={Lock}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--theme-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Password</p>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Reset your password via email OTP</p>
              </div>
              <button 
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors" 
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  color: 'var(--theme-text)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--theme-muted-bg)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Reset Password
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--theme-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Two-Factor Authentication</p>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Add an extra layer of security</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: user?.twoFactorEnabled ? '#10b981' : 'var(--theme-border)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform"
                  style={{
                    backgroundColor: 'var(--theme-card)',
                    transform: user?.twoFactorEnabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                  }}
                />
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance & Preferences */}
        <SettingsSection title="Appearance & Experience" icon={Palette}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--theme-text)' }}>Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(themes).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className="p-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: theme === key ? 'var(--theme-primary)' : 'var(--theme-border)',
                      backgroundColor: theme === key ? 'rgba(var(--primary-rgb), 0.10)' : 'transparent',
                      boxShadow: theme === key ? `0 0 0 2px rgba(var(--primary-rgb), 0.25)` : 'none'
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeData.colors.primary }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{themeData.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Adaptive UI</p>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Automatically adjust theme based on mood</p>
                </div>
              </div>
                  <button
                    onClick={() => setAdaptiveMode(!adaptiveMode)}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: adaptiveMode ? 'var(--theme-primary)' : 'var(--theme-border)'
                    }}
                  >
                <motion.div
                  style={{ backgroundColor: 'var(--theme-card)' }}
                  className="absolute top-1 left-1 w-4 h-4 rounded-full shadow"
                  animate={{ x: adaptiveMode ? 24 : 0 }}
                />
              </button>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Type className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <label className="font-medium" style={{ color: 'var(--theme-text)' }}>Font Size ({fontSize}px)</label>
              </div>
                 <input
                   type="range"
                   min="12"
                   max="20"
                   value={fontSize}
                   onChange={(e) => setFontSize(parseInt(e.target.value))}
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{ backgroundColor: 'var(--theme-border)' }}
                 />
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={Bell}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Push Notifications</p>
              <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Receive updates about tasks and wellness nudges</p>
            </div>
                   <button
                     onClick={() => setNotifications(!notifications)}
                     className="relative w-12 h-6 rounded-full transition-colors"
                     style={{
                       backgroundColor: notifications ? 'var(--theme-primary)' : 'var(--theme-border)'
                     }}
                   >
              <motion.div
                style={{ backgroundColor: 'var(--theme-card)' }}
                className="absolute top-1 left-1 w-4 h-4 rounded-full shadow"
                animate={{ x: notifications ? 24 : 0 }}
              />
            </button>
          </div>
        </SettingsSection>

        {/* Privacy & Data Access */}
        <SettingsSection title="Privacy & Data Access" icon={Shield}>
          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
            Privacy settings are managed within your account and device preferences.
          </p>
        </SettingsSection>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>

          <div className="flex space-x-4">
            <button
              className="px-8 py-3 rounded-xl font-medium opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--theme-text)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 rounded-xl font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={logoutConfirmModal}
        title="Logout Confirmation"
        message="Are you sure you want to log out? You'll need to log back in to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmModal(false)}
        type="warning"
        isDangerous={false}
      />

      <ConfirmationModal
        isOpen={twoFactorConfirmModal}
        title="Enable Two-Factor Authentication"
        message="When you enable 2FA, you'll need to enter a verification code sent to your email every time you log in. This adds an extra layer of security to protect your account. Do you want to continue?"
        confirmText="Enable 2FA"
        cancelText="Cancel"
        onConfirm={confirm2FAEnable}
        onCancel={() => setTwoFactorConfirmModal(false)}
        type="info"
        isDangerous={false}
      />
    </div>
  );
};

export default Settings;