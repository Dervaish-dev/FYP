import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = ({ isOpen, onClose }) => {
  const { theme: currentThemeKey, setTheme, themes } = useTheme();

  const handleThemeChange = (themeKey) => {
    setTheme(themeKey);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--theme-card)',
          color: 'var(--theme-text)'
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Palette className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Choose Theme</h2>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--theme-muted-text)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--theme-text)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--theme-muted-text)'}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(themes).map(([key, theme]) => (
            <motion.button
              key={key}
              onClick={() => handleThemeChange(key)}
              className="relative p-4 rounded-xl border-2 transition-all duration-300"
              style={{
                borderColor: currentThemeKey === key ? 'var(--theme-primary)' : 'var(--theme-border)',
                backgroundColor: currentThemeKey === key ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Theme color preview */}
                  <div className="flex space-x-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>{theme.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--theme-muted-text)' }}>
                      {key === 'ocean' && 'Fresh and calming'}
                      {key === 'coral' && 'Warm and energetic'}
                      {key === 'midnight' && 'Professional and focused'}
                      {key === 'mint' && 'Natural and refreshing'}
                      {key === 'lavender' && 'Creative and peaceful'}
                      {key === 'golden' && 'Cozy and inviting'}
                      {key.startsWith('theme-') && 'Emotion-based theme'}
                    </p>
                  </div>
                </div>

                {currentThemeKey === key && (
                  <motion.div
                    className="flex items-center justify-center w-6 h-6 rounded-full"
                    style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check size={14} />
                  </motion.div>
                )}
              </div>

              {/* Theme preview gradient */}
              <div
                className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
                }}
              />
            </motion.button>
          ))}
        </div>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--theme-muted-text)' }}>
            Themes will be applied instantly across the entire application
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSelector;
