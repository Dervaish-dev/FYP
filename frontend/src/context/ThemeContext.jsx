import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-theme');
    return saved || 'ocean';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-fontSize');
    return saved ? parseInt(saved) : 16;
  });
  
  const [adaptiveMode, setAdaptiveMode] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-adaptiveMode');
    return saved === 'true';
  });

  // Theme definitions
  const themes = {
    ocean: {
      name: 'Ocean',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        background: '#f0f9ff',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    coral: {
      name: 'Coral',
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        background: '#fff7ed',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    midnight: {
      name: 'Midnight',
      colors: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        background: '#1e293b',
        card: '#334155',
        text: '#ffffff',
        border: '#475569'
      }
    },
    mint: {
      name: 'Mint',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        background: '#ecfdf5',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    lavender: {
      name: 'Lavender',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        background: '#faf5ff',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    golden: {
      name: 'Golden',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        background: '#fffbeb',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    // Emotion-based themes
    'theme-happy': {
      name: 'Happy',
      colors: {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        background: '#fef3c7',
        card: '#ffffff',
        text: '#111827',
        border: '#fde68a'
      }
    },
    'theme-calm': {
      name: 'Calm',
      colors: {
        primary: '#a78bfa',
        secondary: '#8b5cf6',
        background: '#f3f4f6',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    'theme-neutral': {
      name: 'Neutral',
      colors: {
        primary: '#9ca3af',
        secondary: '#6b7280',
        background: '#f9fafb',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb'
      }
    },
    'theme-balance': {
      name: 'Balance',
      colors: {
        primary: '#14b8a6',
        secondary: '#0d9488',
        background: '#f0fdfa',
        card: '#ffffff',
        text: '#111827',
        border: '#ccfbf1'
      }
    }
  };

  const currentTheme = themes[theme];

  // Apply theme and font size to document with smooth transitions
  useEffect(() => {
    if (currentTheme) {
      const root = document.documentElement;
      
      // Add transition class for smooth theme changes
      root.classList.add('theme-transition');
      
      // Set CSS custom properties
      root.style.setProperty('--theme-primary', currentTheme.colors.primary);
      root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
      root.style.setProperty('--theme-background', currentTheme.colors.background);
      root.style.setProperty('--theme-card', currentTheme.colors.card);
      root.style.setProperty('--theme-text', currentTheme.colors.text);
      root.style.setProperty('--theme-border', currentTheme.colors.border);
      
      // Set font size
      root.style.fontSize = `${fontSize}px`;
      
      // Set data attribute for theme
      root.setAttribute('data-theme', theme);
      
      // Apply to body with smooth transition
      document.body.style.transition = 'background-color 1.5s ease, color 1.5s ease';
      document.body.style.backgroundColor = currentTheme.colors.background;
      document.body.style.color = currentTheme.colors.text;
      
      // Remove transition class after animation
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 1500);
    }
  }, [theme, fontSize, currentTheme]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('neurocompanion-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('neurocompanion-fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('neurocompanion-adaptiveMode', adaptiveMode.toString());
  }, [adaptiveMode]);

  // Adaptive UI function with emotion-based theme mapping
  const applyAdaptiveTheme = (emotion) => {
    if (!adaptiveMode) return;
    
    const emotionThemeMap = {
      happy: 'theme-happy',       // bright yellows / sky blue
      sad: 'theme-calm',          // pastel lavender / white
      angry: 'theme-neutral',     // beige / muted grey
      stressed: 'theme-neutral',
      calm: 'theme-balance',      // teal / mint
      neutral: 'theme-balance',
      excited: 'theme-happy',
      worried: 'theme-neutral',
      confused: 'theme-neutral',
      surprised: 'theme-happy'
    };
    
    const newTheme = emotionThemeMap[emotion.toLowerCase()] || 'theme-balance';
    
    if (newTheme !== theme) {
      console.log(`🎨 Adapting theme based on emotion: ${emotion} → ${newTheme}`);
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    adaptiveMode,
    setAdaptiveMode,
    currentTheme,
    themes,
    applyAdaptiveTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};