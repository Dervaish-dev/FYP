import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Settings,
  Shield,
  Brain,
  LayoutDashboard,
  LogOut,
  ChevronDown
} from 'lucide-react';

const CaregiverLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get caregiver info from localStorage since AuthContext is for patients
  const caregiverInfo = JSON.parse(localStorage.getItem('caregiverInfo') || '{}');
  const user = caregiverInfo;

  const navItems = [
    { path: '/caregiver/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/caregiver/patients', label: 'Patients', icon: Users },
    { path: '/caregiver/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('caregiverToken');
    localStorage.removeItem('caregiverInfo');
    navigate('/caregiver/login');
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

            {/* User Info & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ backgroundColor: isDropdownOpen ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent' }}
              >
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-sm" style={{ color: 'var(--theme-text)' }}>
                    Hi, {user?.name?.split(' ')[0] || 'Caregiver'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--theme-border)' }}>
                  <span className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>
                    {user?.name?.charAt(0) || 'C'}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50"
                    style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
                      <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{user?.name || 'Caregiver'}</p>
                      <p className="text-xs opacity-70 truncate" style={{ color: 'var(--theme-text)' }}>{user?.email}</p>
                    </div>
                    
                    <div className="p-2">
                      <Link 
                        to="/caregiver/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-opacity-10"
                        style={{ color: 'var(--theme-text)' }}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-opacity-10 text-red-500 hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
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
            {navItems.map((item) => (
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

export default CaregiverLayout;
