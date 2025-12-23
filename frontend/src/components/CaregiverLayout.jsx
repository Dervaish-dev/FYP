import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Settings,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CaregiverLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/caregiver/dashboard', label: 'Patients', icon: Users },
    { path: '/caregiver/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  NeuroCompanion
                </h1>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                  Caregiver Portal
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="text-right">
              <p className="font-medium text-sm" style={{ color: 'var(--theme-text)' }}>
                {user?.name || 'Caregiver'}
              </p>
              <p className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>
                {user?.email || 'caregiver@example.com'}
              </p>
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
            {navItems.map((item) => (
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

export default CaregiverLayout;
