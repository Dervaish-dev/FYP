import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  CheckSquare, 
  BookOpen, 
  BarChart3, 
  Mic, 
  Users, 
  Settings as SettingsIcon,
  Brain,
  Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Settings from '../pages/Settings';

const Layout = ({ children }) => {
  // Mock user for now - no auth needed
  const user = { name: 'Dervaish Abbas', email: 'dervaishabbas@gmail.com' };
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/emotions', icon: Heart, label: 'Emotions' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/voice', icon: Mic, label: 'Voice' },
    { path: '/caregiver', icon: Users, label: 'Caregiver' },
    { path: '/wellness', icon: Activity, label: 'Wellness' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-background)' }}>
      {/* Header */}
      <motion.header 
        className="shadow-sm border-b"
        style={{ 
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <motion.div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  NeuroCompanion
                </h1>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                  AI Mental Health Companion
                </p>
              </div>
            </div>
            
            {/* User Info & Settings */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-sm" style={{ color: 'var(--theme-text)' }}>
                  {user?.name || 'User'}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <Settings />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 border-t z-50"
        style={{ 
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)'
        }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around py-3">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.button
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'text-white' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? 'var(--theme-primary)' : 'transparent',
                    color: isActive(item.path) ? 'white' : 'var(--theme-text)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

    </div>
  );
};

export default Layout;
