import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Settings, 
  Home, 
  Heart, 
  CheckSquare, 
  BookOpen, 
  Mic, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  BarChart3,
  PieChart,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const CaregiverDashboard = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for caregiver dashboard
  const mockData = {
    emotions: [
      { date: 'Oct 18', emotion: 'Sad', tasksCompleted: 2, totalTasks: 5, recommendation: 'Consider relaxation or therapist check-in.' },
      { date: 'Oct 19', emotion: 'Calm', tasksCompleted: 5, totalTasks: 5, recommendation: 'Stable mood. Keep consistent schedule.' },
      { date: 'Oct 20', emotion: 'Happy', tasksCompleted: 4, totalTasks: 6, recommendation: 'Great progress! Continue current routine.' },
      { date: 'Oct 21', emotion: 'Stressed', tasksCompleted: 3, totalTasks: 5, recommendation: 'Consider stress management techniques.' },
      { date: 'Oct 22', emotion: 'Calm', tasksCompleted: 6, totalTasks: 6, recommendation: 'Excellent day! Maintain this momentum.' },
      { date: 'Oct 23', emotion: 'Happy', tasksCompleted: 5, totalTasks: 7, recommendation: 'Positive trend continues.' },
      { date: 'Oct 24', emotion: 'Neutral', tasksCompleted: 4, totalTasks: 5, recommendation: 'Stable day. Monitor for changes.' }
    ],
    emotionBreakdown: [
      { emotion: 'Happy', count: 15, percentage: 35, color: 'bg-green-500' },
      { emotion: 'Calm', count: 12, percentage: 28, color: 'bg-blue-500' },
      { emotion: 'Neutral', count: 8, percentage: 19, color: 'bg-gray-500' },
      { emotion: 'Stressed', count: 5, percentage: 12, color: 'bg-red-500' },
      { emotion: 'Sad', count: 3, percentage: 6, color: 'bg-purple-500' }
    ],
    taskCompletion: {
      total: 156,
      completed: 128,
      percentage: 82
    },
    sleepData: [
      { day: 'Mon', hours: 7.5 },
      { day: 'Tue', hours: 8.0 },
      { day: 'Wed', hours: 6.5 },
      { day: 'Thu', hours: 7.8 },
      { day: 'Fri', hours: 8.2 },
      { day: 'Sat', hours: 9.0 },
      { day: 'Sun', hours: 8.5 }
    ],
    aiRecommendations: [
      {
        type: 'warning',
        message: 'Based on recent mood data, you may want to schedule a therapy session if low mood persists for more than 3 days.',
        priority: 'high'
      },
      {
        type: 'suggestion',
        message: 'Consider implementing a consistent bedtime routine to improve sleep quality.',
        priority: 'medium'
      },
      {
        type: 'positive',
        message: 'Great job maintaining task completion rates above 80% this week!',
        priority: 'low'
      }
    ]
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'Happy': 'text-green-600',
      'Calm': 'text-blue-600',
      'Neutral': 'text-gray-600',
      'Stressed': 'text-red-600',
      'Sad': 'text-purple-600'
    };
    return colors[emotion] || colors.Neutral;
  };

  const getEmotionBgColor = (emotion) => {
    const colors = {
      'Happy': 'bg-green-100',
      'Calm': 'bg-blue-100',
      'Neutral': 'bg-gray-100',
      'Stressed': 'bg-red-100',
      'Sad': 'bg-purple-100'
    };
    return colors[emotion] || colors.Neutral;
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'suggestion':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background.light }}>
      {/* Header */}
      <motion.header 
        className="shadow-lg"
        style={{ backgroundColor: currentTheme.colors.primary[600] }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="h-10 w-10 bg-white rounded-full flex items-center justify-center"
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
                <Users className="h-6 w-6" style={{ color: currentTheme.colors.primary[600] }} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Caregiver Dashboard</h1>
                <p className="text-white/80 text-sm">Monitor Progress & Provide Support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <p className="font-medium">{user?.name}</p>
                <p className="text-white/80 text-sm">{formatDate(currentTime)}</p>
                <p className="text-white/80 text-sm">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Task Completion</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.taskCompletion.percentage}%</p>
                <p className="text-sm text-gray-500">{mockData.taskCompletion.completed}/{mockData.taskCompletion.total} tasks</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Sleep</p>
                <p className="text-2xl font-bold text-gray-900">7.8h</p>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Mood Trend</p>
                <p className="text-2xl font-bold text-gray-900">↗️</p>
                <p className="text-sm text-gray-500">Improving</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Days</p>
                <p className="text-2xl font-bold text-gray-900">6/7</p>
                <p className="text-sm text-gray-500">This week</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emotion Breakdown Chart */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Emotion Breakdown (Last 30 Days)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {mockData.emotionBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-4 w-4 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.emotion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {mockData.emotionBreakdown.map((item, index) => {
                    const cumulativePercentage = mockData.emotionBreakdown
                      .slice(0, index)
                      .reduce((sum, prev) => sum + prev.percentage, 0);
                    const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                    const strokeDashoffset = 100 - cumulativePercentage;
                    
                    return (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color.replace('bg-', '').replace('-500', '-500')}
                        strokeWidth="8"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">43</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Progress Table */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Progress Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Emotion</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tasks Completed</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {mockData.emotions.map((day, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{day.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEmotionBgColor(day.emotion)} ${getEmotionColor(day.emotion)}`}>
                        {day.emotion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {day.tasksCompleted}/{day.totalTasks}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{day.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            {mockData.aiRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200">
                {getRecommendationIcon(recommendation.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{recommendation.message}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sleep Chart */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sleep Quality Trend</h3>
          <div className="flex items-end space-x-2 h-32">
            {mockData.sleepData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="bg-blue-500 rounded-t-lg transition-all duration-1000"
                  style={{ 
                    height: `${(day.hours / 10) * 100}px`,
                    width: '24px'
                  }}
                ></div>
                <span className="text-xs text-gray-600">{day.day}</span>
                <span className="text-xs font-medium text-gray-900">{day.hours}h</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around py-4">
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 transition-colors">
              <Home size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 transition-colors">
              <Heart size={20} />
              <span className="text-xs">Emotions</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 transition-colors">
              <CheckSquare size={20} />
              <span className="text-xs">Tasks</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 transition-colors">
              <BookOpen size={20} />
              <span className="text-xs">Journal</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-blue-600">
              <Users size={20} />
              <span className="text-xs">Caregiver</span>
            </button>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default CaregiverDashboard;
