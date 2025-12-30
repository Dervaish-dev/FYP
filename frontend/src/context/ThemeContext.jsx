import React, { createContext, useState, useEffect, useContext } from 'react';
import { themes as themeDefinitions } from '../utils/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const BASE_THEMES = ['ocean', 'coral', 'midnight', 'mint', 'lavender'];
  const isBaseTheme = (key) => BASE_THEMES.includes(key);

  const [theme, setTheme] = useState(() => {
    const savedAdaptive = localStorage.getItem('neurocompanion-adaptiveMode') === 'true';
    const savedSelected = localStorage.getItem('neurocompanion-selectedTheme');
    const savedLastTheme = localStorage.getItem('neurocompanion-theme');

    const selectedTheme = savedSelected || (savedLastTheme && isBaseTheme(savedLastTheme) ? savedLastTheme : null) || 'ocean';
    const lastTheme = savedLastTheme || selectedTheme;

    // If adaptive mode is ON, resume the last applied theme (could be emotion-based).
    // If adaptive mode is OFF, resume the user's selected base theme.
    return savedAdaptive ? lastTheme : selectedTheme;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-fontSize');
    return saved ? parseInt(saved) : 16;
  });
  
  const [adaptiveMode, setAdaptiveMode] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-adaptiveMode');
    return saved === 'true';
  });

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

      const baseThemeDefinition = themeDefinitions?.[theme];
      const primaryScale = baseThemeDefinition?.colors?.primary;
      const secondaryScale = baseThemeDefinition?.colors?.secondary;
      
      // Set CSS custom properties - Comprehensive theme coverage
      root.style.setProperty('--theme-primary', currentTheme.colors.primary);
      root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
      root.style.setProperty('--theme-background', currentTheme.colors.background);
      root.style.setProperty('--theme-card', currentTheme.colors.card);
      root.style.setProperty('--theme-text', currentTheme.colors.text);
      root.style.setProperty('--theme-border', currentTheme.colors.border);
      root.style.setProperty('--theme-accent', currentTheme.colors.accent);
      root.style.setProperty('--theme-muted-text', currentTheme.colors.mutedText);
      root.style.setProperty('--theme-muted-bg', currentTheme.colors.mutedBg);

      // Back-compat variables used across older dashboard pages
      root.style.setProperty('--card-bg', currentTheme.colors.card);
      root.style.setProperty('--text-color', currentTheme.colors.text);
      root.style.setProperty('--border-color', currentTheme.colors.border);

      const primary500 = primaryScale?.[500] || currentTheme.colors.primary;
      const primary600 = primaryScale?.[600] || currentTheme.colors.secondary;
      const primary100 =
        primaryScale?.[100] ||
        rgbaFromHex(primary500, 0.12) ||
        currentTheme.colors.background;

      const secondary500 = secondaryScale?.[500] || currentTheme.colors.border;
      const secondary600 = secondaryScale?.[600] || currentTheme.colors.border;
      const secondary100 =
        secondaryScale?.[100] ||
        rgbaFromHex(primary500, 0.08) ||
        currentTheme.colors.background;

      const primaryRgb = hexToRgb(primary500);
      if (primaryRgb) {
        root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      }

      root.style.setProperty('--primary-500', primary500);
      root.style.setProperty('--primary-600', primary600);
      root.style.setProperty('--primary-100', primary100);

      root.style.setProperty('--secondary-500', secondary500);
      root.style.setProperty('--secondary-600', secondary600);
      root.style.setProperty('--secondary-100', secondary100);

      // Optional full scale if available (improves consistency across pages)
      if (primaryScale) {
        for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
          const value = primaryScale?.[step];
          if (value) root.style.setProperty(`--primary-${step}`, value);
        }
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
    // Only persist user selection when it's a base theme. Adaptive emotion themes shouldn't overwrite it.
    if (isBaseTheme(theme)) {
      localStorage.setItem('neurocompanion-selectedTheme', theme);
    }
  }, [theme]);

  // When adaptive mode is turned OFF, revert to the user's selected base theme.
  useEffect(() => {
    if (adaptiveMode) return;
    const selected = localStorage.getItem('neurocompanion-selectedTheme');
    if (selected && isBaseTheme(selected) && theme !== selected) {
      setTheme(selected);
    }
  }, [adaptiveMode]);

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
