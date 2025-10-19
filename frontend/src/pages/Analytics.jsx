import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Heart,
  Brain,
  Zap
} from 'lucide-react';

const Analytics = () => {
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

  // Mock data
  const weeklyData = [
    { day: 'Mon', mood: 8, tasks: 5 },
    { day: 'Tue', mood: 7, tasks: 4 },
    { day: 'Wed', mood: 6, tasks: 6 },
    { day: 'Thu', mood: 9, tasks: 7 },
    { day: 'Fri', mood: 8, tasks: 5 },
    { day: 'Sat', mood: 7, tasks: 3 },
    { day: 'Sun', mood: 8, tasks: 4 }
  ];

  const averageHappiness = Math.round(weeklyData.reduce((sum, day) => sum + day.mood, 0) / weeklyData.length * 10);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              Analytics
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--text-color)' }}>
              Track your progress and insights
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>This Week's Average</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{averageHappiness}%</p>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Happiness</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Heart className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>

              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Task Completion</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>68%</p>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>This Week</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Activity className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>

              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Focus Sessions</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>12</p>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>This Week</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Brain className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>

              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Energy Level</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>7.2</p>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Out of 10</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Zap className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mood Chart */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                Mood Intensity (Last 7 Days)
              </h2>
              <div className="h-64 flex items-end justify-between space-x-2">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs opacity-70" style={{ color: 'var(--text-color)' }}>
                      {day.mood}/10
                    </div>
                    <div
                      className="w-8 rounded-t-lg transition-all duration-1000"
                      style={{ 
                        backgroundColor: 'var(--accent-color)',
                        height: `${(day.mood / 10) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>
                      {day.day}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Task Completion Chart */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                Task Completion Trend
              </h2>
              <div className="h-64 flex items-end justify-between space-x-2">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs opacity-70" style={{ color: 'var(--text-color)' }}>
                      {day.tasks}/7
                    </div>
                    <div
                      className="w-8 rounded-t-lg transition-all duration-1000"
                      style={{ 
                        backgroundColor: 'var(--primary-500)',
                        height: `${(day.tasks / 7) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>
                      {day.day}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                AI Insights
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--primary-50)' }}>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 mt-1" style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                        Positive Trend Detected
                      </p>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                        Your mood has been consistently high this week. Consider maintaining your current routine.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--primary-50)' }}>
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 mt-1" style={{ color: 'var(--primary-600)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                        Focus Pattern Analysis
                      </p>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                        You're most productive in the morning. Try scheduling important tasks before noon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
