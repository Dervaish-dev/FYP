import React from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Clock, 
  Zap,
  TrendingUp,
  Activity,
  Heart,
  Target,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from '../components/DashboardCard';

const SleepPage = () => {
  const { currentTheme, animations } = useTheme();

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

  const sleepData = [
    { day: 'Mon', duration: '8h 15m', quality: 85, deep: '2h 30m', rem: '1h 45m' },
    { day: 'Tue', duration: '7h 45m', quality: 78, deep: '2h 15m', rem: '1h 30m' },
    { day: 'Wed', duration: '8h 30m', quality: 92, deep: '2h 45m', rem: '1h 50m' },
    { day: 'Thu', duration: '7h 20m', quality: 75, deep: '2h 00m', rem: '1h 25m' },
    { day: 'Fri', duration: '8h 45m', quality: 88, deep: '2h 35m', rem: '1h 55m' },
    { day: 'Sat', duration: '9h 15m', quality: 95, deep: '3h 00m', rem: '2h 10m' },
    { day: 'Sun', duration: '8h 00m', quality: 82, deep: '2h 20m', rem: '1h 40m' },
  ];

  const maxQuality = Math.max(...sleepData.map(d => d.quality));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div 
        className="gradient-bg text-white py-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Moon className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Sleep Analytics</h1>
          </div>
          <p className="text-primary-100">
            Track your sleep patterns and optimize your rest
          </p>
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
          {/* Last Night's Sleep */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Last Night's Sleep</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total Sleep"
                value="8h 32m"
                subtitle="last night"
                icon={Moon}
                color="primary"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-primary-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: 8h 30m</p>
              </DashboardCard>

              <DashboardCard
                title="Sleep Quality"
                value="87%"
                subtitle="excellent"
                icon={Heart}
                color="success"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-green-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Above average</p>
              </DashboardCard>

              <DashboardCard
                title="Deep Sleep"
                value="2h 35m"
                subtitle="31% of total"
                icon={Zap}
                color="secondary"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '31%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Optimal range: 20-25%</p>
              </DashboardCard>

              <DashboardCard
                title="REM Sleep"
                value="1h 55m"
                subtitle="23% of total"
                icon={Activity}
                color="warning"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-yellow-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '23%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: 20-25%</p>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Sleep Quality Chart */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Sleep Quality</h2>
            <DashboardCard
              title="7-Day Sleep Quality Trend"
              value="+5%"
              subtitle="vs last week"
              icon={TrendingUp}
              color="primary"
              className="h-80"
            >
              <div className="mt-6 h-48 flex items-end justify-between space-x-2">
                {sleepData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs text-gray-500">{day.quality}%</div>
                    <div
                      className="w-8 bg-primary-500 rounded-t"
                      style={{ 
                        height: `${(day.quality / maxQuality) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs font-medium text-gray-700">{day.day}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <div className="text-lg font-bold text-primary-700">
                    {Math.round(sleepData.reduce((sum, day) => sum + day.quality, 0) / 7)}%
                  </div>
                  <div className="text-sm text-primary-600">Avg Quality</div>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="text-lg font-bold text-secondary-700">
                    {Math.round(sleepData.reduce((sum, day) => sum + day.quality, 0) / 7) > 80 ? 'Excellent' : 'Good'}
                  </div>
                  <div className="text-sm text-secondary-600">Overall Rating</div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Sleep Stages */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sleep Stages Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCard
                title="Sleep Architecture"
                value="8h 32m"
                subtitle="total duration"
                icon={BarChart3}
                color="primary"
                className="h-80"
              >
                <div className="mt-6 h-48 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Light Sleep */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-blue-300"
                        initial={{ strokeDasharray: '0 188.4' }}
                        animate={{ strokeDasharray: '94.2 188.4' }}
                        transition={{ duration: 2, delay: 0.5 }}
                      />
                      {/* Deep Sleep */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-purple-500"
                        initial={{ strokeDasharray: '0 188.4' }}
                        animate={{ strokeDasharray: '56.5 188.4' }}
                        transition={{ duration: 2, delay: 1 }}
                        style={{ strokeDashoffset: '-94.2' }}
                      />
                      {/* REM Sleep */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-yellow-500"
                        initial={{ strokeDasharray: '0 188.4' }}
                        animate={{ strokeDasharray: '37.7 188.4' }}
                        transition={{ duration: 2, delay: 1.5 }}
                        style={{ strokeDashoffset: '-150.7' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-700">8h 32m</div>
                        <div className="text-xs text-gray-500">Total Sleep</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-300 rounded-full" />
                      <span className="text-gray-600">Light Sleep</span>
                    </div>
                    <span className="text-gray-900">4h 12m (50%)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span className="text-gray-600">Deep Sleep</span>
                    </div>
                    <span className="text-gray-900">2h 35m (30%)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-gray-600">REM Sleep</span>
                    </div>
                    <span className="text-gray-900">1h 45m (20%)</span>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Sleep Goals Progress"
                value="4/5"
                subtitle="goals met"
                icon={Target}
                color="success"
                className="h-80"
              >
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Sleep Duration</span>
                      <span className="text-gray-900">✓ Met</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Sleep Quality</span>
                      <span className="text-gray-900">✓ Met</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Deep Sleep</span>
                      <span className="text-gray-900">✓ Met</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">REM Sleep</span>
                      <span className="text-gray-900">✓ Met</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 1.1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Sleep Consistency</span>
                      <span className="text-gray-900">⚠ Partial</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-yellow-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, delay: 1.3 }}
                      />
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Sleep Insights */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sleep Insights & Recommendations</h2>
            <DashboardCard
              title="AI Sleep Analysis"
              value="3"
              subtitle="recommendations"
              icon={Moon}
              color="primary"
            >
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium text-green-900 mb-1">Excellent Sleep Quality</h4>
                  <p className="text-sm text-green-700">
                    Your sleep quality has been consistently excellent this week. Your sleep hygiene practices are working well.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-900 mb-1">Optimal Deep Sleep</h4>
                  <p className="text-sm text-blue-700">
                    Your deep sleep duration is in the optimal range. This contributes to better physical recovery and memory consolidation.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-900 mb-1">Sleep Consistency</h4>
                  <p className="text-sm text-yellow-700">
                    Try to maintain more consistent bedtimes. Going to bed within 30 minutes of your usual time can improve sleep quality.
                  </p>
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SleepPage;
