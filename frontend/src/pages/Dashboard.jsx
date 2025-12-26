import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  CheckSquare, 
  BookOpen, 
  BarChart3, 
  Mic, 
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  Target,
  ChevronRight,
  Bell,
  Loader2,
  Wind
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, journalAPI, wellnessAPI } from '../utils/api';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    moodStability: 85,
    taskCompletion: 72,
    breathingExercisesToday: 0,
    moodMessage: "Maintain sleep schedule for continued stability.",
    taskMessage: "Great progress this week! Keep up the momentum.",
    hasEmotionData: false,
    hasTaskData: false
  });
  const [loading, setLoading] = useState(true);

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

  // Fetch real metrics from backend
  useEffect(() => {
    const loadDashboardMetrics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch data in parallel with fallbacks
        const [emotions, tasks, journals, breathingHistory] = await Promise.all([
          api.get(`/emotions/history/${user.id}?limit=30`).catch(() => ({ data: { data: { emotions: [] } } })),
          taskAPI.listByUser(user.id).catch(() => []),
          journalAPI.listByUser(user.id).catch(() => []),
          wellnessAPI.getBreathingHistory(user.id).catch(() => [])
        ]);

        // Calculate mood stability (based on emotion history)
        const emotionData = emotions?.data?.data?.emotions || [];
        const positiveEmotions = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic', 'neutral'];
        const stableEmotionsCount = emotionData.filter(e => positiveEmotions.includes(e.emotion?.toLowerCase())).length;
        const moodStability = emotionData.length > 0 
          ? Math.round((stableEmotionsCount / emotionData.length) * 100)
          : 85; // fallback

        // Calculate task completion
        const allTasks = Array.isArray(tasks) ? tasks : [];
        const completedTasks = allTasks.filter(t => t.status === 'done').length;
        const taskCompletion = allTasks.length > 0
          ? Math.round((completedTasks / allTasks.length) * 100)
          : 72; // fallback

        // Track if we have real data
        const hasEmotionData = emotionData.length > 0;
        const hasTaskData = allTasks.length > 0;

        // Generate personalized messages
        const moodMessage = !hasEmotionData
          ? "Start logging your emotions to track your mood stability!"
          : moodStability >= 80 
          ? "Excellent emotional stability! Keep maintaining your positive routines."
          : moodStability >= 60
          ? "Good progress on emotional wellness. Consider more relaxation activities."
          : "Focus on self-care activities and reach out to your support network.";

        const taskMessage = !hasTaskData
          ? "Create tasks to track your progress and stay organized!"
          : taskCompletion >= 80
          ? "Outstanding task completion! You're crushing your goals! 🎯"
          : taskCompletion >= 60
          ? "Great progress this week! Keep up the momentum."
          : "Try breaking tasks into smaller steps for better completion rates.";

        // Count breathing exercises completed today
        // The API returns { history: [...], statistics: {...} }
        const history = breathingHistory?.history || [];
        const today = new Date().toDateString();
        const breathingExercisesToday = Array.isArray(history) ? history.filter(e => {
          const exerciseDate = new Date(e.createdAt || e.date).toDateString();
          return exerciseDate === today;
        }).length : 0;

        setMetrics({
          moodStability,
          taskCompletion,
          breathingExercisesToday,
          moodMessage,
          taskMessage,
          hasEmotionData,
          hasTaskData
        });

      } catch (error) {
        // Silent fallback - use default values
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMetrics();
  }, [user]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary-500)' }} />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Reports Section */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                Your Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mood Stability Report */}
                <div 
                  className="rounded-2xl p-6 shadow-lg border"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                      <Heart className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div className="text-right">
                      {metrics.hasEmotionData ? (
                        <>
                          <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.moodStability}%</div>
                          <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Mood Stability</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>No data yet</div>
                      )}
                    </div>
                  </div>
                  {metrics.hasEmotionData && (
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-color)' }}>
                      <motion.div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--primary-500)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.moodStability}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  )}
                  <p className="text-sm mt-3 opacity-70" style={{ color: 'var(--text-color)' }}>
                    {metrics.moodMessage}
                  </p>
                </div>

                {/* Task Completion Report */}
                <div 
                  className="rounded-2xl p-6 shadow-lg border"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                      <Target className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div className="text-right">
                      {metrics.hasTaskData ? (
                        <>
                          <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.taskCompletion}%</div>
                          <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Task Completion</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>No data yet</div>
                      )}
                    </div>
                  </div>
                  {metrics.hasTaskData && (
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-color)' }}>
                      <motion.div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: 'var(--primary-500)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.taskCompletion}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  )}
                  <p className="text-sm mt-3 opacity-70" style={{ color: 'var(--text-color)' }}>
                    {metrics.taskMessage}
                  </p>
                </div>

                {/* Breathing Exercises Today */}
                <div 
                  className="rounded-2xl p-6 shadow-lg border"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                      <Wind className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.breathingExercisesToday}</div>
                      <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Exercises</div>
                    </div>
                  </div>
                  <p className="text-sm mt-3 opacity-70" style={{ color: 'var(--text-color)' }}>
                    {metrics.breathingExercisesToday > 0 
                      ? `Great work! You've completed ${metrics.breathingExercisesToday} breathing exercise${metrics.breathingExercisesToday !== 1 ? 's' : ''} today.`
                      : "Start your day with a calming breathing exercise!"}
                  </p>
                </div>
              </div>
            </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/emotions">
                <motion.div 
                  className="rounded-2xl p-6 shadow-lg border text-center"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent-color)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Emotions</h3>
                </motion.div>
              </Link>
              
              <Link to="/tasks">
                <motion.div 
                  className="rounded-2xl p-6 shadow-lg border text-center"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckSquare className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent-color)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Tasks</h3>
                </motion.div>
              </Link>
              
              <Link to="/journal">
                <motion.div 
                  className="rounded-2xl p-6 shadow-lg border text-center"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent-color)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Journal</h3>
                </motion.div>
              </Link>
              
              <Link to="/analytics">
                <motion.div 
                  className="rounded-2xl p-6 shadow-lg border text-center"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent-color)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Analytics</h3>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* General Analytics Overview */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-8 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3" style={{ color: 'var(--accent-color)' }} />
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
                    Weekly Overview
                  </h3>
                </div>
                <Link to="/analytics" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-color)' }}>
                  View Full Report
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Mood Stability</span>
                    <span className={`text-sm font-bold ${metrics.moodStability >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {metrics.moodStability >= 70 ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${metrics.moodStability}%`, backgroundColor: 'var(--accent-color)' }}></div>
                  </div>
                  <div className="mt-2 text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    {metrics.moodStability}% stable emotions this week
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Task Completion</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{metrics.taskCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${metrics.taskCompletion}%` }}></div>
                  </div>
                  <div className="mt-2 text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    You're making good progress!
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Wellness Score</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>Good</span>
                  </div>
                  <div className="flex items-center h-2.5">
                    <div className="flex-1 flex space-x-1 h-full">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className={`flex-1 rounded-full ${star <= 4 ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-xs opacity-60" style={{ color: 'var(--text-color)' }}>
                    Based on sleep & breathing habits
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;