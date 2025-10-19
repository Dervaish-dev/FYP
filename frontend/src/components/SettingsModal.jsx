import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Type, 
  Volume2, 
  Eye,
  X,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies, fontSizes } from '../utils/themes';
import ThemeSelector from './ThemeSelector';

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    theme: currentThemeKey,
    currentTheme,
    fontFamily: currentFontFamily,
    fontSize: currentFontSize,
    animations,
    reducedMotion,
    setTheme,
    setFontFamily,
    setFontSize,
    toggleAnimations,
    toggleReducedMotion,
  } = useTheme();

  const [showThemeSelector, setShowThemeSelector] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Theme Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appearance</h3>
              
              <div className="space-y-4">
                {/* Theme Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <button
                    onClick={() => setShowThemeSelector(true)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Palette className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-900">{currentTheme?.name || 'Select Theme'}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Style
                  </label>
                  <select
                    value={currentFontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(fontFamilies).map(([key, font]) => (
                      <option key={key} value={key}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <div className="space-y-2">
                    {Object.entries(fontSizes).map(([key, size]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="fontSize"
                          value={key}
                          checked={currentFontSize === key}
                          onChange={() => setFontSize(key)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-900">{size.name}</span>
                        <span 
                          className="text-gray-500"
                          style={{ fontSize: `${size.multiplier}rem` }}
                        >
                          Sample text
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility</h3>
              
              <div className="space-y-4">
                {/* Animations Toggle */}
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-900 font-medium">Animations</p>
                      <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      animations ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      animate={{ x: animations ? 28 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-900 font-medium">Reduced Motion</p>
                      <p className="text-sm text-gray-500">Minimize animations for accessibility</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      reducedMotion ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      animate={{ x: reducedMotion ? 28 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Sample Card</h4>
                  <p className="text-gray-600">
                    This is how your content will look with the current settings.
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                      Tag
                    </span>
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-800 rounded text-sm">
                      Another
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              All settings are saved automatically and persist across sessions
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </>
  );
};

export default SettingsModal;
