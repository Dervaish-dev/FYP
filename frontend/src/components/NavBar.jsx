import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Heart, 
  Moon, 
  Brain, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const { currentTheme, animations } = useTheme();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/wellness', label: 'Wellness', icon: Heart },
    { path: '/sleep', label: 'Sleep', icon: Moon },
    { path: '/insights', label: 'Insights', icon: Brain },
  ];

  const isActive = (path) => location.pathname === path;

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.1
      }
    })
  };

  return (
    <>
      <motion.nav 
        className="gradient-bg shadow-lg"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              variants={itemVariants}
              custom={0}
            >
              <motion.div 
                className="h-10 w-10 bg-white rounded-full flex items-center justify-center"
                animate={animations ? { 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Brain className="h-6 w-6 text-primary-600" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">NeuroCompanion</h1>
                <p className="text-primary-100 text-sm">Adaptive UI Engine</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  custom={index + 1}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Settings Button */}
            <motion.div
              variants={itemVariants}
              custom={navigationItems.length + 1}
            >
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-primary-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variants={itemVariants}
              custom={navigationItems.length + 2}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isMobileMenuOpen ? 1 : 0, 
              height: isMobileMenuOpen ? 'auto' : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default NavBar;
