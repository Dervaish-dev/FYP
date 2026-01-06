import React, { createContext, useState, useEffect, useContext } from 'react';
import { themes as themeDefinitions } from '../utils/themes';
import { useAuth } from './AuthContext';
import { preferencesAPI } from '../utils/api';

const ThemeContext = createContext();

const BASE_THEMES = ['ocean', 'coral', 'midnight', 'mint', 'lavender'];
const isBaseTheme = (key) => BASE_THEMES.includes(key);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();

  // Helper to get initial selected theme from storage
  const getInitialSelectedTheme = () => {
    const saved = localStorage.getItem('neurocompanion-selectedTheme');
    return saved || 'ocean';
  };

  const [selectedTheme, setSelectedTheme] = useState(getInitialSelectedTheme);

  const [theme, setTheme] = useState(() => {
    const rawAdaptive = localStorage.getItem('neurocompanion-adaptiveMode');
    const savedAdaptive = rawAdaptive === null ? true : rawAdaptive === 'true';
    
    const initialBase = getInitialSelectedTheme();
    const savedLastTheme = localStorage.getItem('neurocompanion-theme');

    const lastTheme = savedLastTheme || initialBase;

    return savedAdaptive ? lastTheme : initialBase;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-fontSize');
    return saved ? parseInt(saved) : 16;
  });
  
  const [adaptiveMode, setAdaptiveMode] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-adaptiveMode');
    return saved === null ? true : saved === 'true';
  });

  // Sync preferences from database on login
  useEffect(() => {
    const syncPreferences = async () => {
      if (!user?.id) return;
      try {
        const prefs = await preferencesAPI.fetch(user.id);
        if (prefs) {
          if (prefs.defaultTheme && isBaseTheme(prefs.defaultTheme)) {
            setSelectedTheme(prefs.defaultTheme);
            if (!adaptiveMode || !localStorage.getItem('neurocompanion-theme')) {
              setTheme(prefs.defaultTheme);
            }
            localStorage.setItem('neurocompanion-selectedTheme', prefs.defaultTheme);
          }
          if (prefs.adaptiveMode !== undefined) {
            setAdaptiveMode(prefs.adaptiveMode);
            localStorage.setItem('neurocompanion-adaptiveMode', prefs.adaptiveMode);
          }
          if (prefs.fontSize) {
            setFontSize(prefs.fontSize);
            localStorage.setItem('neurocompanion-fontSize', prefs.fontSize);
          }
        }
      } catch (err) {
        console.warn('Could not sync preferences from server', err);
      }
    };
    syncPreferences();
  }, [user?.id]);

  const buildThemeFromDefinition = (key, def) => {
    const primaryScale = def?.colors?.primary;
    const secondaryScale = def?.colors?.secondary;
    const background = def?.colors?.background;

    const primary = primaryScale?.[500] || '#0ea5e9';
    const secondary = secondaryScale?.[500] || primaryScale?.[600] || primary;
    const backgroundColor = background?.light || '#f0f9ff';

    const isDark = key === 'midnight';
    
    // More comprehensive theme colors
    let card, text, border, accent, mutedText, mutedBg;
    
    if (isDark) {
      card = background?.medium || '#1e293b';
      text = '#ffffff';
      border = primaryScale?.[700] || '#334155';
      accent = primaryScale?.[400] || '#7dd3fc';
      mutedText = '#cbd5e1';
      mutedBg = 'rgba(203, 213, 225, 0.1)';
    } else {
      // For light themes: use theme-specific background for card to create visual distinction
      // Card is slightly different from page background to show depth
      card = background?.medium || primaryScale?.[50] || '#f8fafc';
      text = primaryScale?.[900] || '#111827';
      border = primaryScale?.[200] || '#e5e7eb';
      accent = primaryScale?.[600] || primary;
      mutedText = primaryScale?.[700] || '#4b5563';
      mutedBg = primaryScale?.[100] || 'rgba(107, 114, 128, 0.1)';
    }

    return {
      name: def?.name || key,
      colors: {
        primary,
        secondary,
        background: backgroundColor,
        card,
        text,
        border,
        accent,
        mutedText,
        mutedBg
      },
      meta: { isDark }
    };
  };

  // Theme list exposed to Settings/Selectors
  const themes = {
    ocean: buildThemeFromDefinition('ocean', themeDefinitions?.ocean),
    coral: buildThemeFromDefinition('coral', themeDefinitions?.coral),
    midnight: buildThemeFromDefinition('midnight', themeDefinitions?.midnight),
    mint: buildThemeFromDefinition('mint', themeDefinitions?.mint),
    lavender: buildThemeFromDefinition('lavender', themeDefinitions?.lavender),

    // Emotion-based themes (kept for adaptive mode)
    'theme-happy': {
      name: 'Happy',
      colors: {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        background: '#fef3c7',
        card: '#ffffff',
        text: '#111827',
        border: '#fde68a',
        accent: '#f59e0b',
        mutedText: '#92400e',
        mutedBg: '#fef3c7'
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
        border: '#e5e7eb',
        accent: '#8b5cf6',
        mutedText: '#6b7280',
        mutedBg: '#f3f4f6'
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
        border: '#e5e7eb',
        accent: '#6b7280',
        mutedText: '#6b7280',
        mutedBg: '#f9fafb'
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
        border: '#ccfbf1',
        accent: '#0d9488',
        mutedText: '#115e59',
        mutedBg: '#f0fdfa'
      }
    }
  };

  const currentTheme = themes[theme];

  const hexToRgb = (hex) => {
    if (typeof hex !== 'string') return null;
    const normalized = hex.replace('#', '').trim();
    if (normalized.length !== 6) return null;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  };

  const rgbaFromHex = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  // Apply theme and font size to document
  useEffect(() => {
    if (currentTheme) {
      const root = document.documentElement;

      const activeThemeDef = themes[theme];
      const primaryScale = activeThemeDef?.colors?.primary;
      const secondaryScale = activeThemeDef?.colors?.secondary;
      
      // Set CSS custom properties - Comprehensive theme coverage
      root.style.setProperty('--theme-primary', activeThemeDef.colors.primary);
      root.style.setProperty('--theme-secondary', activeThemeDef.colors.secondary);
      root.style.setProperty('--theme-background', activeThemeDef.colors.background);
      root.style.setProperty('--theme-card', activeThemeDef.colors.card);
      root.style.setProperty('--theme-text', activeThemeDef.colors.text);
      root.style.setProperty('--theme-border', activeThemeDef.colors.border);
      root.style.setProperty('--theme-accent', activeThemeDef.colors.accent);
      root.style.setProperty('--theme-muted-text', activeThemeDef.colors.mutedText);
      root.style.setProperty('--theme-muted-bg', activeThemeDef.colors.mutedBg);

      // Back-compat variables
      root.style.setProperty('--card-bg', activeThemeDef.colors.card);
      root.style.setProperty('--text-color', activeThemeDef.colors.text);
      root.style.setProperty('--border-color', activeThemeDef.colors.border);

      // Determine colors for derived scales
      const p500 = typeof primaryScale === 'string' ? primaryScale : (primaryScale?.[500] || activeThemeDef.colors.primary);
      const p600 = typeof primaryScale === 'string' ? primaryScale : (primaryScale?.[600] || activeThemeDef.colors.secondary);
      const p100 = typeof primaryScale === 'object' && primaryScale?.[100] ? primaryScale[100] : rgbaFromHex(p500, 0.12);
      
      const primaryRgb = hexToRgb(p500);
      if (primaryRgb) {
        root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      }

      root.style.setProperty('--primary-500', p500);
      root.style.setProperty('--primary-600', p600);
      root.style.setProperty('--primary-100', p100);
      
      // Handle the 50-900 scale
      if (typeof primaryScale === 'object' && primaryScale !== null) {
        for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
          const value = primaryScale[step];
          if (value) root.style.setProperty(`--primary-${step}`, value);
        }
      } else {
        // Fallback for adaptive themes without scales
        for (const step of [50, 200, 300, 400, 700, 800, 900]) {
          root.style.setProperty(`--primary-${step}`, p500);
        }
        // Special case for light/dark steps if we want some contrast
        root.style.setProperty('--primary-50', rgbaFromHex(p500, 0.05));
        root.style.setProperty('--primary-100', rgbaFromHex(p500, 0.12));
      }
      
      // Set font size
      root.style.fontSize = `${fontSize}px`;
      
      // Set data attribute for theme
      root.setAttribute('data-theme', theme);
      
      // Apply to body
      document.body.style.backgroundColor = currentTheme.colors.background;
      document.body.style.color = currentTheme.colors.text;
    }
  }, [theme, fontSize, currentTheme]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('neurocompanion-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('neurocompanion-selectedTheme', selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem('neurocompanion-fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('neurocompanion-adaptiveMode', adaptiveMode.toString());
    if (!adaptiveMode) {
      setTheme(selectedTheme);
    }
  }, [adaptiveMode, selectedTheme]);

  // Adaptive UI function with emotion-based theme mapping
  const applyAdaptiveTheme = (emotion) => {
    if (!adaptiveMode) return;
    
    const emotionThemeMap = {
      happy: 'theme-happy',
      sad: 'theme-calm',
      angry: 'theme-neutral',
      stressed: 'theme-neutral',
      calm: 'theme-balance',
      neutral: 'theme-balance',
      excited: 'theme-happy',
      worried: 'theme-neutral',
      confused: 'theme-neutral',
      surprised: 'theme-happy',
      depressed: 'theme-calm',
      anxious: 'theme-neutral',
      frustrated: 'theme-neutral',
      overwhelmed: 'theme-neutral',
      lonely: 'theme-calm',
      grateful: 'theme-happy',
      hopeful: 'theme-happy',
      peaceful: 'theme-balance',
      content: 'theme-happy',
      nervous: 'theme-neutral',
      optimistic: 'theme-happy',
      pessimistic: 'theme-neutral'
    };
    
    const newTheme = emotionThemeMap[emotion.toLowerCase()] || 'theme-balance';
    
    console.log(`🎨 Applying adaptive theme: ${emotion} → ${newTheme}`);
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    selectedTheme,
    setSelectedTheme,
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
