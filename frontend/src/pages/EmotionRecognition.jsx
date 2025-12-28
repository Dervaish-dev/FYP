import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Smile,
  Frown,
  Meh,
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronLeft,
  Share2,
  Bell
} from 'lucide-react';

const EmotionRecognition = () => {
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

  const emotionData = [
    { day: 'F', happy: 85, calm: 70, stressed: 15, sad: 5 },
    { day: 'S', happy: 90, calm: 75, stressed: 10, sad: 3 },
    { day: 'S', happy: 60, calm: 50, stressed: 35, sad: 15 },
    { day: 'M', happy: 75, calm: 65, stressed: 25, sad: 8 },
    { day: 'T', happy: 88, calm: 80, stressed: 12, sad: 4 },
    { day: 'W', happy: 70, calm: 60, stressed: 30, sad: 10 },
    { day: 'T', happy: 82, calm: 72, stressed: 18, sad: 6 }
  ];

  const maxValue = Math.max(...emotionData.map(d => Math.max(d.happy, d.calm, d.stressed, d.sad)));

  return (
    <div style={{ backgroundColor: 'var(--theme-background)' }} className="min-h-screen">
      {/* Header */}
      <motion.div 
        style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
        className="shadow-sm"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Time and Back Button */}
            <div className="flex items-center space-x-4">
              <button style={{ color: 'var(--theme-text)' }} className="p-2 hover:opacity-70 transition-opacity">
                <ChevronLeft size={20} />
              </button>
              <div style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">9:41</div>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h1 style={{ color: 'var(--theme-text)' }} className="text-xl font-bold">EMOTION RECOGNITION</h1>
            </div>

            {/* Share and Notifications */}
            <div className="flex items-center space-x-3">
              <button style={{ color: 'var(--theme-text)' }} className="p-2 hover:opacity-70 transition-opacity">
                <Share2 size={20} />
              </button>
              <button style={{ color: 'var(--theme-text)' }} className="p-2 hover:opacity-70 transition-opacity">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Date Selector */}
      <motion.div 
        style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
        className="border-b"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-6">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => (
                <div key={day} className="text-center">
                  <div style={{
                    backgroundColor: day === 'THU' ? 'var(--theme-primary)' : 'transparent',
                    color: day === 'THU' ? 'white' : 'var(--theme-text)',
                  }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                    {day}
                  </div>
                  <div style={{ color: 'var(--theme-muted-text)' }} className="text-xs mt-1">
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
          {/* Current Emotion Status */}
          <motion.div variants={itemVariants}>
            <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">76% EMOTION STABILITY</h2>
                    <p style={{ color: 'var(--theme-muted-text)' }} className="text-sm">Current emotional state: Calm & Focused</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    NORMAL
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-pink-400 to-rose-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '76%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Emotion Breakdown */}
          <motion.div variants={itemVariants}>
            <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold mb-6">Today's Emotions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Happy */}
              <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Smile className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">82%</div>
                    <div style={{ color: 'var(--theme-muted-text)' }} className="text-sm">Happy</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-yellow-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Calm */}
              <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">72%</div>
                    <div style={{ color: 'var(--theme-muted-text)' }} className="text-sm">Calm</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>

              {/* Stressed */}
              <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Frown className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">18%</div>
                    <div style={{ color: 'var(--theme-muted-text)' }} className="text-sm">Stressed</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-red-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '18%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
              </div>

              {/* Sad */}
              <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Meh className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold">6%</div>
                    <div style={{ color: 'var(--theme-muted-text)' }} className="text-sm">Sad</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gray-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '6%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Emotion Chart */}
          <motion.div variants={itemVariants}>
            <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold mb-6">Weekly Emotion Trends</h2>
            <div style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }} className="rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: 'var(--theme-text)' }} className="text-lg font-semibold">Emotion Analysis</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm rounded-lg" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-text)' }}>DAILY</button>
                  <button className="px-3 py-1 text-sm rounded-lg" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>WEEKLY</button>
                  <button className="px-3 py-1 text-sm rounded-lg" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-text)' }}>MONTHLY</button>
                </div>
              </div>
              
              <div className="h-64 flex items-end justify-between space-x-1">
                {emotionData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{day.happy}%</div>
                    <div className="flex flex-col space-y-1">
                      <div
                        className="w-6 bg-yellow-500 rounded-t"
                        style={{ 
                          height: `${(day.happy / maxValue) * 100}px`,
                          minHeight: '8px'
                        }}
                        title={`Happy: ${day.happy}%`}
                      />
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(day.calm / maxValue) * 100}px`,
                          minHeight: '8px'
                        }}
                        title={`Calm: ${day.calm}%`}
                      />
                      <div
                        className="w-6 bg-red-500 rounded-t"
                        style={{ 
                          height: `${(day.stressed / maxValue) * 100}px`,
                          minHeight: '8px'
                        }}
                        title={`Stressed: ${day.stressed}%`}
                      />
                      <div
                        className="w-6 bg-gray-500 rounded-t"
                        style={{ 
                          height: `${(day.sad / maxValue) * 100}px`,
                          minHeight: '8px'
                        }}
                        title={`Sad: ${day.sad}%`}
                      />
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>{day.day}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-xs" style={{ color: 'var(--theme-text)' }}>Happy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full" />
                  <span className="text-xs" style={{ color: 'var(--theme-text)' }}>Calm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-xs" style={{ color: 'var(--theme-text)' }}>Stressed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--theme-muted-text)' }} />
                  <span className="text-xs" style={{ color: 'var(--theme-text)' }}>Sad</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emotion Insights */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>AI Emotion Insights</h2>
            <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>EMOTION ANALYSIS</h3>
                <div className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  3 New Insights
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                      <Smile className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--theme-text)' }}>
                        <span className="font-medium">Positive Trend:</span> Your happiness levels have increased by 15% this week. 
                        Your morning routine seems to be working well!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--theme-text)' }}>
                        <span className="font-medium">Calm State:</span> Your meditation sessions are showing great results. 
                        Stress levels are consistently low.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--theme-text)' }}>
                        <span className="font-medium">Recommendation:</span> Consider adding 5 minutes of gratitude journaling 
                        to maintain your positive emotional state.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div 
        style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
        className="fixed bottom-0 left-0 right-0 border-t"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around py-4">
            {[
              { icon: Brain, label: 'Dashboard', active: false, path: '/adaptive' },
              { icon: Heart, label: 'Emotions', active: true, path: '/emotions' },
              { icon: BarChart3, label: 'Tasks', active: false, path: '/tasks' },
              { icon: Calendar, label: 'Journal', active: false, path: '/insights' },
              { icon: BarChart3, label: 'Analytics', active: false, path: '/wellness' }
            ].map((item, index) => (
              <Link key={index} to={item.path}>
                <motion.button
                  style={{
                    backgroundColor: item.active ? 'var(--theme-primary)' : 'transparent',
                    color: item.active ? 'white' : 'var(--theme-text)',
                  }}
                  className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors hover:opacity-70"
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
    </div>
  );
};

export default EmotionRecognition;
