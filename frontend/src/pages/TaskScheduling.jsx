import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  Share2,
  Bell,
  Plus,
  Play
} from 'lucide-react';

const TaskScheduling = () => {
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

  const taskData = [
    { day: 'F', completed: 8, total: 10 },
    { day: 'S', completed: 9, total: 10 },
    { day: 'S', completed: 6, total: 10 },
    { day: 'M', completed: 7, total: 10 },
    { day: 'T', completed: 9, total: 10 },
    { day: 'W', completed: 8, total: 10 },
    { day: 'T', completed: 7, total: 10 }
  ];

  const maxTasks = Math.max(...taskData.map(d => d.total));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Time and Back Button */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="text-2xl font-bold text-gray-900">9:41</div>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">TASK SCHEDULING</h1>
            </div>

            {/* Share and Notifications */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell size={20} />
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
          {/* Task Completion Status */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">7 TASKS COMPLETED</h2>
                    <p className="text-sm text-gray-600">Today's task completion rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ON TRACK
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Goal: 10 tasks</span>
                <span>70% complete</span>
              </div>
            </div>
          </motion.div>

          {/* Task Categories */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Work Tasks */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">3</div>
                    <div className="text-sm text-gray-600">Work Tasks</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">All completed</p>
              </div>

              {/* Personal Tasks */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">Personal Tasks</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">All completed</p>
              </div>

              {/* Health Tasks */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">Health Tasks</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">All completed</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Task Chart */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Task Progress</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Task Completion Trends</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">DAILY</button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg font-medium">WEEKLY</button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">MONTHLY</button>
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between space-x-2">
                {taskData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs text-gray-500">{day.completed}/{day.total}</div>
                    <div
                      className="w-8 bg-gradient-to-t from-green-400 to-emerald-500 rounded-t"
                      style={{ 
                        height: `${(day.completed / maxTasks) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-xs font-medium text-gray-700">{day.day}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="w-full h-px bg-gray-200 relative">
                  <div className="absolute left-1/2 top-0 w-16 h-px bg-green-400 transform -translate-x-1/2" />
                  <div className="absolute left-1/2 -top-2 transform -translate-x-1/2 text-xs text-gray-500">
                    Target: 8 tasks/day
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Task Management */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Add Task */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Add Task</h3>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-sm text-gray-700">Complete morning routine</span>
                    <span className="text-xs text-gray-500 ml-auto">9:00 AM</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-sm text-gray-700">Review weekly goals</span>
                    <span className="text-xs text-gray-500 ml-auto">2:00 PM</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-gray-400 rounded" />
                    <span className="text-sm text-gray-500">Evening reflection</span>
                    <span className="text-xs text-gray-500 ml-auto">8:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Task Insights */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Task Insights</h3>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    +12% This Week
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Productivity Boost:</span> Your task completion rate has improved by 12% this week. 
                          Keep up the excellent work!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Time Management:</span> You're completing tasks 15 minutes faster on average. 
                          Your routine optimization is working!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Recommendation:</span> Consider adding a 5-minute break between tasks 
                          to maintain focus and prevent burnout.
                        </p>
                      </div>
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
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around py-4">
            {[
              { icon: BarChart3, label: 'Dashboard', active: false, path: '/adaptive' },
              { icon: BarChart3, label: 'Emotions', active: false, path: '/emotions' },
              { icon: Target, label: 'Tasks', active: true, path: '/tasks' },
              { icon: Calendar, label: 'Journal', active: false, path: '/insights' },
              { icon: BarChart3, label: 'Analytics', active: false, path: '/wellness' }
            ].map((item, index) => (
              <Link key={index} to={item.path}>
                <motion.button
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-green-100 text-green-600' 
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
    </div>
  );
};

export default TaskScheduling;
