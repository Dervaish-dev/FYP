import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Heart, 
  Calendar,
  Activity,
  Moon,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BarChart3,
  ChevronRight,
  Bell,
  Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SettingsModal from '../components/SettingsModal';

const AdaptiveDashboard = () => {
  const { currentTheme, animations } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Time and Status */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">LIVE</span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">NeuroCompanion</h1>
                <p className="text-sm text-gray-600">{user?.name || 'Your AI Mental Health Companion'}</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell size={20} />
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setShowSettings(true)}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Date Selector */}
      <motion.div 
        className="bg-white border-b border-gray-100"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-6">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    day === 'THU' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {15 + index}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Live Status Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      LIVE
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      Dervaish is focused and calm
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>Emotion: Calm</span>
                    <span>•</span>
                    <span>Stress: Low</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDate(currentTime)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Emotion Recognition */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">38%</div>
                    <div className="text-sm text-gray-600">Emotion Stability</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '38%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Task Completion */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">62%</div>
                    <div className="text-sm text-gray-600">Task Completion</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '62%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Moon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">87%</div>
                    <div className="text-sm text-gray-600">Sleep Quality</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
              </div>

              {/* Wellness Index */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">76%</div>
                    <div className="text-sm text-gray-600">Wellness Index</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '76%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Behavior Tracking */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Behavior Patterns</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Today's Patterns</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>2 New Insights</span>
                  <ChevronRight size={16} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Focus Sessions</div>
                  <div className="text-xs text-gray-600">3 completed</div>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Breathing Exercises</div>
                  <div className="text-xs text-gray-600">5 sessions</div>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Journal Entries</div>
                  <div className="text-xs text-gray-600">2 entries</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Insights</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">INSIGHTS</h3>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  2 New Notifications
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">31 Jan</span> Your emotional patterns show increased stability this week. 
                        Consider maintaining your current routine for continued progress.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Task Completion:</span> You're 15% ahead of your weekly goal. 
                        Great job maintaining consistency!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Wellness Trends</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">DAILY</button>
                  <button className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-lg font-medium">WEEKLY</button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">MONTHLY</button>
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between space-x-2">
                {[
                  { day: 'F', value: 90, label: '90%' },
                  { day: 'S', value: 95, label: '95%' },
                  { day: 'S', value: 63, label: '63%' },
                  { day: 'M', value: 74, label: '74%' },
                  { day: 'T', value: 88, label: '88%' },
                  { day: 'W', value: 62, label: '62%' },
                  { day: 'T', value: 76, label: '76%' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div
                      className="w-8 bg-gradient-to-t from-orange-400 to-yellow-500 rounded-t"
                      style={{ 
                        height: `${(item.value / 100) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs font-medium text-gray-700">{item.day}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="w-full h-px bg-gray-200 relative">
                  <div className="absolute left-1/2 top-0 w-16 h-px bg-orange-400 transform -translate-x-1/2" />
                  <div className="absolute left-1/2 -top-2 transform -translate-x-1/2 text-xs text-gray-500">
                    Target: 75%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around py-4">
            {[
              { icon: Brain, label: 'Dashboard', active: true, path: '/adaptive' },
              { icon: Heart, label: 'Emotions', active: false, path: '/emotions' },
              { icon: Target, label: 'Tasks', active: false, path: '/tasks' },
              { icon: Calendar, label: 'Journal', active: false, path: '/insights' },
              { icon: BarChart3, label: 'Analytics', active: false, path: '/wellness' }
            ].map((item, index) => (
              <Link key={index} to={item.path}>
                <motion.button
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
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
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default AdaptiveDashboard;