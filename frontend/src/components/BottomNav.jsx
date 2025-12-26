import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Wind,
  Heart,
  BookOpen,
  Settings,
  Brain
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/emotions', label: 'Mood', icon: Brain },
    { path: '/breathing', label: 'Breathing', icon: Wind },
    { path: '/wellness', label: 'Wellness', icon: Heart },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: 'var(--theme-background)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-6 gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-3 px-2 transition-all duration-200"
              >
                <motion.div
                  className="flex flex-col items-center justify-center w-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {active && (
                    <motion.div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                      layoutId="bottomNavIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                    />
                  )}

                  <Icon
                    size={24}
                    style={{
                      color: active ? 'var(--theme-primary)' : 'var(--theme-text)',
                      opacity: active ? 1 : 0.6,
                      marginBottom: '4px'
                    }}
                  />

                  <span
                    className="text-xs font-medium text-center"
                    style={{
                      color: active ? 'var(--theme-primary)' : 'var(--theme-text)',
                      opacity: active ? 1 : 0.6
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
