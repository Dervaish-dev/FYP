import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from '../components/DashboardCard';

const ActivityPage = () => {
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

  const weeklyData = [
    { day: 'Mon', steps: 8200, active: '2h 15m' },
    { day: 'Tue', steps: 12400, active: '3h 30m' },
    { day: 'Wed', steps: 6800, active: '1h 45m' },
    { day: 'Thu', steps: 15200, active: '4h 10m' },
    { day: 'Fri', steps: 9800, active: '2h 30m' },
    { day: 'Sat', steps: 11200, active: '3h 15m' },
    { day: 'Sun', steps: 7600, active: '2h 00m' },
  ];

  const maxSteps = Math.max(...weeklyData.map(d => d.steps));

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
            <Activity className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Activity Tracker</h1>
          </div>
          <p className="text-primary-100">
            Monitor your daily activity and movement patterns
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
          {/* Today's Stats */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Steps Walked"
                value="6,248"
                subtitle="steps"
                icon={Activity}
                color="primary"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-primary-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '62%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Goal: 10,000 steps</p>
              </DashboardCard>

              <DashboardCard
                title="Active Time"
                value="2h 16m"
                subtitle="today"
                icon={Clock}
                color="secondary"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: 5h active</p>
              </DashboardCard>

              <DashboardCard
                title="Distance"
                value="2.1"
                subtitle="km"
                icon={MapPin}
                color="success"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-green-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Goal: 6km daily</p>
              </DashboardCard>

              <DashboardCard
                title="Calories"
                value="1,124"
                subtitle="burned"
                icon={Zap}
                color="warning"
              >
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-yellow-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '56%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: 2,000 cal</p>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Overview</h2>
            <DashboardCard
              title="7-Day Activity Trend"
              value="+12%"
              subtitle="vs last week"
              icon={TrendingUp}
              color="primary"
              className="h-80"
            >
              <div className="mt-6 h-48 flex items-end justify-between space-x-2">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs text-gray-500">{day.steps.toLocaleString()}</div>
                    <div
                      className="w-8 bg-primary-500 rounded-t"
                      style={{ 
                        height: `${(day.steps / maxSteps) * 120}px`,
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
                    {weeklyData.reduce((sum, day) => sum + day.steps, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-primary-600">Total Steps</div>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="text-lg font-bold text-secondary-700">
                    {Math.round(weeklyData.reduce((sum, day) => sum + day.steps, 0) / 7).toLocaleString()}
                  </div>
                  <div className="text-sm text-secondary-600">Daily Average</div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Activity Breakdown */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCard
                title="Exercise Sessions"
                value="3"
                subtitle="completed today"
                icon={Target}
                color="success"
              >
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-800">Morning Walk</span>
                    </div>
                    <span className="text-sm text-green-600">45 min</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-800">Yoga Session</span>
                    </div>
                    <span className="text-sm text-green-600">30 min</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-800">Evening Stroll</span>
                    </div>
                    <span className="text-sm text-green-600">25 min</span>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Activity Goals"
                value="75%"
                subtitle="weekly progress"
                icon={BarChart3}
                color="primary"
              >
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Steps Goal</span>
                      <span className="text-gray-900">62%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-primary-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '62%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Active Time</span>
                      <span className="text-gray-900">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Exercise Sessions</span>
                      <span className="text-gray-900">100%</span>
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
                </div>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Insights</h2>
            <DashboardCard
              title="AI Recommendations"
              value="2"
              subtitle="suggestions"
              icon={Calendar}
              color="secondary"
            >
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-900 mb-1">Increase Morning Activity</h4>
                  <p className="text-sm text-blue-700">
                    Your morning activity levels are lower than optimal. Consider a 10-minute walk after breakfast.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium text-green-900 mb-1">Great Consistency!</h4>
                  <p className="text-sm text-green-700">
                    You've maintained consistent activity levels this week. Keep up the excellent work!
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

export default ActivityPage;
