import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Activity,
  User,
  LogOut,
  Wind
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Settings from '../pages/Settings';

const Layout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/emotions', icon: Brain, label: 'Mood' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
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
                  Hi {user?.name || 'User'} 👋
                </p>
              </div>
              <div className="relative">
                <button
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{
                    color: 'var(--theme-text)',
                    backgroundColor: isDropdownOpen ? 'rgba(0,0,0,0.05)' : 'transparent'
                  }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <SettingsIcon size={20} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden z-50"
                      style={{
                        backgroundColor: 'var(--theme-card)',
                        borderColor: 'var(--theme-border)'
                      }}
                    >
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-opacity-10 transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <User size={18} />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-opacity-10 transition-colors border-t"
                        style={{
                          color: 'var(--theme-text)',
                          borderColor: 'var(--theme-border)'
                        }}
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <motion.nav
          className="rounded-3xl border shadow-xl px-2 py-3"
          style={{
            backgroundColor: 'var(--theme-card)',
            borderColor: 'var(--theme-border)'
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.button
                  className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 rounded-2xl ${isActive(item.path)
                    ? ''
                    : ''
                    }`}
                  style={{
                    backgroundColor: isActive(item.path) ? 'var(--theme-primary)' : 'transparent',
                    color: isActive(item.path) ? 'white' : 'var(--theme-text)',
                    opacity: isActive(item.path) ? 1 : 0.6
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={24} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.nav>
      </div>
    </div>
  );
};

export default Layout;
