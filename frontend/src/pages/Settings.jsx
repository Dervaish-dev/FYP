import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Type, 
  Volume2, 
  Eye,
  Check,
  Brain,
  Zap,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  getUserPreferences,
  saveUserPreferences,
  getNotificationsEnabled,
  setNotificationsEnabled
} from '../utils/userPreferences';

const Settings = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    adaptiveMode,
    setAdaptiveMode,
    themes
  } = useTheme();
  // Mock user for now - no auth needed
  const user = { id: 'test-user-id', name: 'Dervaish Abbas', email: 'dervaishabbas@gmail.com' };

  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => getUserPreferences() || {
    fullName: '',
    age: '',
    neurotype: '',
    notificationTime: 'morning',
    defaultTheme: theme,
    personalGoals: ''
  });
  const [notificationsEnabled, setNotifications] = useState(getNotificationsEnabled());

  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPrefs = getUserPreferences();
        if (savedPrefs) {
          setPrefs(savedPrefs);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [theme, setTheme, setAdaptiveMode]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: -50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleThemeChange = (themeKey) => {
    setTheme(themeKey);
  };

  const handleFontSizeChange = (event) => {
    setFontSize(parseInt(event.target.value));
  };

  const handleAdaptiveModeToggle = () => {
    setAdaptiveMode(!adaptiveMode);
  };

  return (
    <>
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
        style={{ 
          color: 'var(--theme-text)',
          backgroundColor: 'transparent'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SettingsIcon size={20} />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                color: 'var(--theme-text)'
              }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                  <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                    Settings
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Theme Selection */}
                <motion.div variants={itemVariants} className="mb-6">
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--theme-text)' }}>
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(themes).map(([key, themeData]) => (
                      <motion.button
                        key={key}
                        onClick={() => handleThemeChange(key)}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                          theme === key
                            ? 'border-opacity-100 shadow-lg'
                            : 'border-opacity-30 hover:border-opacity-60'
                        }`}
                        style={{
                          borderColor: theme === key ? themeData.colors.primary : 'var(--theme-border)',
                          backgroundColor: theme === key ? `${themeData.colors.primary}20` : 'transparent'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-2">
                          {/* Theme color preview */}
                          <div className="flex space-x-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: themeData.colors.primary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: themeData.colors.secondary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: themeData.colors.background }}
                            />
                          </div>
                          
                          <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                            {themeData.name}
                          </span>
                        </div>

                        {theme === key && (
                          <motion.div
                            className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full"
                            style={{ backgroundColor: themeData.colors.primary }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Font Size Slider */}
                <motion.div variants={itemVariants} className="mb-6">
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--theme-text)' }}>
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--theme-primary) 0%, var(--theme-primary) ${((fontSize - 12) / (24 - 12)) * 100}%, var(--theme-border) ${((fontSize - 12) / (24 - 12)) * 100}%, var(--theme-border) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs opacity-70 mt-1" style={{ color: 'var(--theme-text)' }}>
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </motion.div>

                {/* Adaptive UI Mode Toggle */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="flex items-center space-x-3">
                      <Brain className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Adaptive UI Mode</p>
                        <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                          Automatically adjust theme based on emotions
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAdaptiveModeToggle}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        adaptiveMode ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ backgroundColor: adaptiveMode ? 'var(--theme-primary)' : 'var(--theme-border)' }}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                        animate={{ x: adaptiveMode ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </motion.div>

                {/* User Preferences */}
                <motion.div variants={itemVariants} className="mt-6">
                  <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--theme-text)' }}>
                    User Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Full name</label>
                        <input className="w-full p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.fullName} onChange={(e)=> setPrefs(v=>({...v, fullName:e.target.value}))} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Age</label>
                        <input type="number" className="w-full p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.age} onChange={(e)=> setPrefs(v=>({...v, age:e.target.value}))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Neurotype / Diagnosis</label>
                        <select className="w-full p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.neurotype} onChange={(e)=> setPrefs(v=>({...v, neurotype:e.target.value}))}>
                          <option value="">Select</option>
                          <option>ADHD</option>
                          <option>Autism</option>
                          <option>Anxiety</option>
                          <option>Dyslexia</option>
                          <option>Depression</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Preferred notification times</label>
                        <select className="w-full p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.notificationTime} onChange={(e)=> setPrefs(v=>({...v, notificationTime:e.target.value}))}>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="night">Night</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Default theme</label>
                        <select className="w-full p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.defaultTheme} onChange={(e)=> setPrefs(v=>({...v, defaultTheme:e.target.value}))}>
                          {Object.keys(themes).map(k => (
                            <option key={k} value={k}>{themes[k].name || k}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor:'var(--theme-border)' }}>
                        <div>
                          <p className="font-medium" style={{ color:'var(--theme-text)' }}>Enable notifications</p>
                          <p className="text-xs opacity-70" style={{ color:'var(--theme-text)' }}>Reminders and motivational nudges</p>
                        </div>
                        <button onClick={()=>{const next=!notificationsEnabled; setNotifications(next); setNotificationsEnabled(next);}} className={`relative w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ backgroundColor: notificationsEnabled ? 'var(--theme-primary)' : 'var(--theme-border)' }}>
                          <motion.div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" animate={{ x: notificationsEnabled ? 28 : 4 }} transition={{ type:'spring', stiffness:500, damping:30 }} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--theme-text)' }}>Personal goals or notes</label>
                      <textarea className="w-full p-3 rounded-lg border" rows={3} style={{ borderColor:'var(--theme-border)', backgroundColor:'var(--theme-card)', color:'var(--theme-text)' }} value={prefs.personalGoals} onChange={(e)=> setPrefs(v=>({...v, personalGoals:e.target.value}))} />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        className="px-4 py-2 rounded-lg text-white" 
                        style={{ backgroundColor: 'var(--theme-primary)' }} 
                        onClick={() => {
                          try {
                            // Save to localStorage
                            saveUserPreferences(prefs);
                            setTheme(prefs.defaultTheme || theme);
                            setIsOpen(false);
                          } catch (error) {
                            console.error('Error saving preferences:', error);
                          }
                        }}
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Preview Section */}
                <motion.div variants={itemVariants} className="mt-6">
                  <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--theme-text)' }}>
                    Preview
                  </h3>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--theme-background)',
                      borderColor: 'var(--theme-border)'
                    }}
                  >
                    <div className="space-y-2">
                      <h4 className="font-bold" style={{ color: 'var(--theme-text)' }}>Sample Card</h4>
                      <p className="opacity-70" style={{ color: 'var(--theme-text)' }}>
                        This is how your content will look with the current settings.
                      </p>
                      <div className="flex space-x-2">
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: 'var(--theme-primary)',
                            color: 'white'
                          }}
                        >
                          Tag
                        </span>
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: 'var(--theme-secondary)',
                            color: 'white'
                          }}
                        >
                          Another
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Settings;