import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
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
                className="w-full p-3 rounded-xl border bg-gray-50 opacity-70 cursor-not-allowed"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3 rounded-xl border bg-gray-50 opacity-70 cursor-not-allowed"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Age</label>
              <input
                type="number"
                value={prefs.age}
                onChange={(e) => setPrefs({ ...prefs, age: e.target.value })}
                className="w-full p-3 rounded-xl border bg-transparent"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>Neurotype</label>
              <select
                value={prefs.neurotype}
                onChange={(e) => setPrefs({ ...prefs, neurotype: e.target.value })}
                className="w-full p-3 rounded-xl border bg-transparent"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              >
                <option value="">Select...</option>
                <option value="ADHD">ADHD</option>
                <option value="Autism">Autism</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* Security Section (Placeholder) */}
        <SettingsSection title="Security" icon={Lock}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--theme-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Password</p>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Last changed 3 months ago</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--theme-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Two-Factor Authentication</p>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                Enable
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
    </div>
  );
};

export default Settings;