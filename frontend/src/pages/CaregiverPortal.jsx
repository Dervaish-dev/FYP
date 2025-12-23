import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Heart,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Activity,
  BarChart3,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const CaregiverPortal = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const emotionTrendData = [
    { date: 'Mon', mood: 7, stress: 3, energy: 6 },
    { date: 'Tue', mood: 8, stress: 2, energy: 7 },
    { date: 'Wed', mood: 6, stress: 5, energy: 5 },
    { date: 'Thu', mood: 7, stress: 4, energy: 6 },
    { date: 'Fri', mood: 8, stress: 3, energy: 7 },
    { date: 'Sat', mood: 9, stress: 1, energy: 8 },
    { date: 'Sun', mood: 8, stress: 2, energy: 7 }
  ];

  const taskCompletionData = [
    { day: 'Mon', completed: 4, total: 6 },
    { day: 'Tue', completed: 5, total: 6 },
    { day: 'Wed', completed: 3, total: 6 },
    { day: 'Thu', completed: 5, total: 6 },
    { day: 'Fri', completed: 6, total: 6 },
    { day: 'Sat', completed: 4, total: 5 },
    { day: 'Sun', completed: 5, total: 5 }
  ];

  const emotionDistribution = [
    { name: 'Happy', value: 45, color: '#10b981' },
    { name: 'Calm', value: 25, color: '#3b82f6' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
    { name: 'Stressed', value: 10, color: '#f59e0b' },
    { name: 'Sad', value: 5, color: '#ef4444' }
  ];

  const recentReports = [
    {
      id: 1,
      date: '2024-01-15',
      mood: 'Positive',
      tasksCompleted: '85%',
      sleepQuality: 'Good',
      medicationAdherence: '100%',
      notes: 'Patient showed improved mood after weekend activities. Recommended maintaining current routine.',
      recommendations: ['Continue current medication schedule', 'Encourage outdoor activities', 'Monitor stress levels']
    },
    {
      id: 2,
      date: '2024-01-14',
      mood: 'Stable',
      tasksCompleted: '70%',
      sleepQuality: 'Fair',
      medicationAdherence: '100%',
      notes: 'Patient experienced mild stress mid-week but managed well with coping strategies.',
      recommendations: ['Practice relaxation techniques', 'Maintain sleep schedule', 'Continue task management']
    },
    {
      id: 3,
      date: '2024-01-13',
      mood: 'Positive',
      tasksCompleted: '90%',
      sleepQuality: 'Excellent',
      medicationAdherence: '100%',
      notes: 'Excellent progress this week. Patient engaged well with wellness activities.',
      recommendations: ['Keep up current routine', 'Consider adding new activities', 'Schedule follow-up in 3 days']
    }
  ];

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

  const averageMood = (emotionTrendData.reduce((sum, day) => sum + day.mood, 0) / emotionTrendData.length).toFixed(1);
  const averageTaskCompletion = (taskCompletionData.reduce((sum, day) => sum + (day.completed / day.total), 0) / taskCompletionData.length * 100).toFixed(0);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  Caregiver Portal
                </h1>
                <p className="text-lg opacity-70" style={{ color: 'var(--text-color)' }}>
                  Monitor patient progress and well-being
                </p>
              </div>
              <div className="flex space-x-2">
                {['week', 'month', 'quarter'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'text-white'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: selectedTimeframe === timeframe ? 'var(--primary-500)' : 'transparent',
                      color: selectedTimeframe === timeframe ? 'white' : 'var(--text-color)'
                    }}
                  >
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Average Mood</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{averageMood}/10</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp size={12} className="mr-1" />
                      +0.5 from last week
                    </p>
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
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{averageTaskCompletion}%</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp size={12} className="mr-1" />
                      +8% from last week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Target className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
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
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Sleep Quality</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>7.2/10</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp size={12} className="mr-1" />
                      +0.3 from last week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Clock className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
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
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Medication Adherence</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>100%</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      Perfect compliance
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                    <Activity className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emotion Trend Chart */}
            <motion.div variants={itemVariants}>
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                  <span>Emotion Trend Analysis</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={emotionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-color)" opacity={0.7} />
                    <YAxis stroke="var(--text-color)" opacity={0.7} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border-color)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--text-color)' }}
                      itemStyle={{ color: 'var(--text-color)' }}
                    />
                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} name="Mood" />
                    <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={3} name="Stress" />
                    <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={3} name="Energy" />
                  </LineChart>
                </ResponsiveContainer>
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
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                  <Target className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                  <span>Task Completion Rate</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="day" stroke="var(--text-color)" opacity={0.7} />
                    <YAxis stroke="var(--text-color)" opacity={0.7} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border-color)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--text-color)' }}
                      itemStyle={{ color: 'var(--text-color)' }}
                    />
                    <Bar dataKey="completed" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Emotion Distribution */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <PieChart className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                <span>Emotion Distribution</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        borderColor: 'var(--border-color)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--text-color)' }}
                      itemStyle={{ color: 'var(--text-color)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {emotionDistribution.map((emotion, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: emotion.color }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-color)' }}>
                        {emotion.name}: {emotion.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <MessageSquare className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                <span>Recent Care Reports</span>
              </h3>
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: 'var(--border-color)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                            Mood: {report.mood}
                          </span>
                          <span className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                            Tasks: {report.tasksCompleted}
                          </span>
                          <span className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                            Sleep: {report.sleepQuality}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Good</span>
                      </div>
                    </div>
                    <p className="text-sm opacity-80 mb-3" style={{ color: 'var(--text-color)' }}>
                      {report.notes}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.recommendations.map((rec, recIndex) => (
                        <span
                          key={recIndex}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-600)'
                          }}
                        >
                          {rec}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <Brain className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                <span>AI Recommendations</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>Priority Action</span>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-color)' }}>
                    Continue current medication schedule as adherence is perfect. Consider introducing new wellness activities.
                  </p>
                </div>
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>Quick Win</span>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-color)' }}>
                    Patient shows improved mood on weekends. Encourage more outdoor activities during weekdays.
                  </p>
                </div>
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>Monitor</span>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-color)' }}>
                    Watch for mid-week stress patterns. Consider implementing stress management techniques.
                  </p>
                </div>
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>Positive Trend</span>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--text-color)' }}>
                    Overall improvement in mood and task completion. Current treatment plan is effective.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CaregiverPortal;
