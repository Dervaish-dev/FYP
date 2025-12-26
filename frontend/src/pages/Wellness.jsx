import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Wind,
  Heart,
  Clock,
  Calendar,
  Activity,
  Brain,
  Zap,
  CheckCircle,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Plus,
  Trash2,
  Save,
  Loader,
  TrendingUp,
  Target,
  Sparkles,
  Coffee,
  Sunrise,
  Sunset
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { wellnessAPI, journalAPI } from '../utils/api';
import api from '../utils/api';

const Wellness = () => {
  // Theme integration
  const { theme } = useTheme();
  const { user } = useAuth(); // Use authenticated user

  // Sleep Routine Tracker States
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepData, setSleepData] = useState([]);
  const [sleepLoading, setSleepLoading] = useState(false);

  // Breathing Exercise States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [breathingSessionComplete, setBreathingSessionComplete] = useState(false);
  const [breathingHistory, setBreathingHistory] = useState([]);

  // Mood Summary States
  const [moodSummary, setMoodSummary] = useState({
    averageSleep: 7.2,
    happyDays: 3,
    stressedDays: 2,
    calmDays: 2,
    recommendation: "You've been sleeping well this week! Keep up the good routine 🌟"
  });
  const [moodData, setMoodData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Load all wellness data on component mount
  useEffect(() => {
    if (user?.id) {
      loadAllWellnessData();
    }
  }, [user]);

  // Load all wellness data
  const loadAllWellnessData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSleepData(),
        loadMoodAnalytics(),
        loadBreathingHistory()
      ]);
    } catch (error) {
      console.error('Error loading wellness data:', error);
      toast.error('Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load breathing history
  const loadBreathingHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const history = await wellnessAPI.getBreathingHistory(user.id);
      setBreathingHistory(history || []);
    } catch (error) {
      console.error('Error loading breathing history:', error);
    }
  }, [user]);

  // Load sleep data
  const loadSleepData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await wellnessAPI.getSleepData(user.id);
      // Map backend data to frontend format if necessary, or just use it
      // Backend returns array of objects with bedtime, wakeTime, sleepDuration, etc.
      setSleepData(data || []);
    } catch (error) {
      console.error('Error loading sleep data:', error);
      toast.error('Failed to load sleep history');
    }
  }, [user]);

  // Load mood analytics
  const loadMoodAnalytics = useCallback(async () => {
    if (!user?.id) return;
    
    setAnalyticsLoading(true);
    try {
      // Fetch real emotion/mood data from journal entries
      const [journalData, emotionData] = await Promise.all([
        journalAPI.listByUser(user.id).catch(() => []),
        api.get(`/emotions/history/${user.id}?limit=30`).catch(() => ({ data: { data: { emotions: [] } } }))
      ]);

      const journals = Array.isArray(journalData) ? journalData : [];
      const emotions = emotionData?.data?.data?.emotions || [];

      // Combine journal moods and emotion data
      const allMoodData = [];
      
      // Group by day of week
      const dayMap = {};
      const today = new Date();
      
      // Get last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        dayMap[dayName] = { day: dayName, moods: [], sleep: 7.5 };
      }

      // Add journal moods
      journals.forEach(entry => {
        if (entry.emotion || entry.mood) {
          const entryDate = new Date(entry.createdAt || entry.timestamp);
          const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (dayMap[dayName]) {
            dayMap[dayName].moods.push(entry.emotion || entry.mood);
          }
        }
      });

      // Add emotion history
      emotions.forEach(emotion => {
        const emotionDate = new Date(emotion.timestamp || emotion.createdAt);
        const dayName = emotionDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayMap[dayName]) {
          dayMap[dayName].moods.push(emotion.emotion);
        }
      });

      // Calculate dominant mood for each day
      const moodData = Object.values(dayMap).map(dayData => {
        let dominantMood = 'neutral';
        if (dayData.moods.length > 0) {
          // Count mood frequencies
          const moodCounts = {};
          dayData.moods.forEach(mood => {
            const normalizedMood = mood.toLowerCase();
            moodCounts[normalizedMood] = (moodCounts[normalizedMood] || 0) + 1;
          });
          // Get most frequent mood
          dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
        }
        return { ...dayData, mood: dominantMood };
      });

      setMoodData(moodData);

      // Calculate mood summary from real data
      const allMoods = moodData.map(d => d.mood);
      const happyDays = allMoods.filter(m => ['happy', 'excited', 'grateful', 'hopeful', 'optimistic'].includes(m)).length;
      const stressedDays = allMoods.filter(m => ['stressed', 'anxious', 'worried', 'overwhelmed'].includes(m)).length;
      const calmDays = allMoods.filter(m => ['calm', 'peaceful', 'relaxed', 'neutral'].includes(m)).length;
      
      // Get sleep data if available
      const avgSleep = sleepData.length > 0
        ? sleepData.reduce((sum, d) => sum + (d.sleepDuration || 7.5), 0) / sleepData.length
        : 7.5;

      setMoodSummary({
        averageSleep: parseFloat(avgSleep.toFixed(1)),
        happyDays,
        stressedDays,
        calmDays,
        recommendation: happyDays >= 3
          ? "You're having a great week emotionally! Keep up the positive momentum 🌟"
          : stressedDays >= 3
          ? "You've had some stressful days. Try relaxation exercises and self-care 💙"
          : avgSleep < 7
          ? "You've been sleeping less lately. Try a relaxing routine before bed 🌙"
          : "Balanced week! Keep maintaining your wellness routines 💪"
      });
    } catch (error) {
      console.error('Error loading mood analytics:', error);
      // Fallback to safe defaults
      setMoodData([
        { day: 'Mon', mood: 'neutral', sleep: 7.5 },
        { day: 'Tue', mood: 'neutral', sleep: 7.5 },
        { day: 'Wed', mood: 'neutral', sleep: 7.5 },
        { day: 'Thu', mood: 'neutral', sleep: 7.5 },
        { day: 'Fri', mood: 'neutral', sleep: 7.5 },
        { day: 'Sat', mood: 'neutral', sleep: 7.5 },
        { day: 'Sun', mood: 'neutral', sleep: 7.5 }
      ]);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [user, sleepData]);

  // Check if sleep entry exists for today
  const todaysSleepEntry = sleepData.find(entry => {
    const entryDate = new Date(entry.createdAt);
    const today = new Date();
    return entryDate.getFullYear() === today.getFullYear() &&
           entryDate.getMonth() === today.getMonth() &&
           entryDate.getDate() === today.getDate();
  });

  // Save sleep data
  const saveSleepData = useCallback(async () => {
    if (!user?.id || todaysSleepEntry) return;

    setSleepLoading(true);
    try {
      const sleepDuration = calculateSleepDuration(bedtime, wakeTime);
      const qualityObj = getSleepQuality(sleepDuration); // returns { emoji, quality, text }

      // Backend expects quality number 1-10 usually, checking schema...
      // Schema says sleepQuality: Number (1-10).
      // Let's map "good/average/poor" to a number for now, or assume the user inputs it.
      // The current UI relies on calculated duration for 'quality text'.
      // Let's map duration-based quality to a score:
      // Good (7-9h) -> 8, Average (5-7h) -> 6, Poor (<5h) -> 4.
      let numericQuality = 5;
      if (qualityObj.quality === 'good') numericQuality = 8;
      else if (qualityObj.quality === 'average') numericQuality = 6;
      else numericQuality = 4;

      const data = {
        userId: user.id,
        bedtime,
        wakeTime,
        sleepDuration: parseFloat(sleepDuration),
        sleepQuality: numericQuality
      };

      await wellnessAPI.logSleep(data);

      toast.success('Sleep data updated successfully! 🌙');
      await Promise.all([loadSleepData(), loadMoodAnalytics()]);
    } catch (error) {
      console.error('Error saving sleep data:', error);
      toast.error('Failed to save sleep data');
    } finally {
      setSleepLoading(false);
    }
  }, [bedtime, wakeTime, user, loadSleepData, loadMoodAnalytics, todaysSleepEntry]);

  // Calculate sleep duration
  const calculateSleepDuration = (bedtime, wakeTime) => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    // Handle overnight sleep
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return (wakeMinutes - bedMinutes) / 60;
  };

  // Get sleep quality emoji and description
  const getSleepQuality = (hours) => {
    if (hours >= 7 && hours <= 9) return { emoji: '😴', quality: 'good', text: 'Good' };
    if (hours >= 5 && hours < 7) return { emoji: '😐', quality: 'average', text: 'Average' };
    return { emoji: '🫠', quality: 'poor', text: 'Poor' };
  };

  // Breathing exercise functions
  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
    setBreathingProgress(0);
    setBreathingSessionComplete(false);
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
    setBreathingProgress(0);
  };

  // Breathing animation effect - Circular breathing
  useEffect(() => {
    if (!breathingActive) return;

    const phases = [
      { name: 'inhale', duration: 4000, instruction: 'Inhale slowly...' },
      { name: 'hold', duration: 2000, instruction: 'Hold your breath...' },
      { name: 'exhale', duration: 4000, instruction: 'Exhale gently...' },
      { name: 'pause', duration: 2000, instruction: 'Pause and relax...' }
    ];

    let currentPhaseIndex = 0;
    let cycleCount = 0;
    let progress = 0;

    const interval = setInterval(() => {
      const currentPhase = phases[currentPhaseIndex];
      setBreathingPhase(currentPhase.name);

      progress += 100 / (currentPhase.duration / 100);
      setBreathingProgress(progress);

      if (progress >= 100) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        progress = 0;
        setBreathingProgress(0);

        if (currentPhaseIndex === 0) {
          cycleCount++;
          setBreathingCycle(cycleCount);

          if (cycleCount >= 4) {
            setBreathingActive(false);
            setBreathingSessionComplete(true);
            toast.success('Nice work 🌿 Your breathing is more relaxed now.');
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [breathingActive]);

  // Get breathing instruction text
  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Inhale slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Exhale gently...';
      case 'pause': return 'Pause and relax...';
      default: return 'Ready to begin';
    }
  };

  // Get breathing circle size for animation
  const getBreathingCircleSize = () => {
    const progress = breathingProgress / 100;
    switch (breathingPhase) {
      case 'inhale':
        return 100 + (progress * 100); // Expand from 100 to 200
      case 'hold':
        return 200; // Stay expanded
      case 'exhale':
        return 200 - (progress * 100); // Contract from 200 to 100
      case 'pause':
        return 100; // Stay contracted
      default:
        return 100;
    }
  };

  // Process data for charts
  // Use real data if available, otherwise empty array
  const processedSleepData = sleepData.length > 0
    ? sleepData.slice(0, 7).reverse().map(entry => ({
      day: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: entry.sleepDuration || 0
    }))
    : [];

  const averageSleep = processedSleepData.length > 0
    ? (processedSleepData.reduce((sum, day) => sum + day.hours, 0) / processedSleepData.length).toFixed(1)
    : '0.0';

  // Mood distribution for pie chart
  const moodDistribution = [
    { name: 'Happy', value: moodSummary.happyDays, color: '#10b981' },
    { name: 'Calm', value: moodSummary.calmDays, color: '#3b82f6' },
    { name: 'Stressed', value: moodSummary.stressedDays, color: '#f59e0b' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };


  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
      <div
        className="min-h-screen p-6"
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <Loader
                  className="h-8 w-8 animate-spin mx-auto mb-4"
                  style={{ color: 'var(--accent-color)' }}
                />
                <p style={{ color: 'var(--theme-text)' }}>Loading wellness data...</p>
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Header */}
              <motion.div variants={cardVariants} className="text-center mb-8">
                <h1
                  className="text-4xl font-bold mb-2"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Health & Wellness
                </h1>
                <p
                  className="text-lg opacity-70"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Track your wellness journey with personalized insights
                </p>
              </motion.div>

              {/* 🌙 Sleep Routine Tracker */}
              <motion.div variants={cardVariants}>
                <div
                  className="rounded-3xl p-8 shadow-xl border"
                  style={{
                    backgroundColor: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <div className="flex items-center mb-6">
                    <Moon
                      className="h-8 w-8 mr-3"
                      style={{ color: 'var(--accent-color)' }}
                    />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      Sleep Routine Tracker
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-3"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <Sunset className="inline h-4 w-4 mr-2" />
                        Bedtime
                      </label>
                      <input
                        type="time"
                        value={bedtime}
                        onChange={(e) => setBedtime(e.target.value)}
                        className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:border-transparent text-lg"
                        style={{
                          backgroundColor: 'var(--theme-background)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-3"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <Sunrise className="inline h-4 w-4 mr-2" />
                        Wake-up Time
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:border-transparent text-lg"
                        style={{
                          backgroundColor: 'var(--theme-background)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div
                      className="text-center rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--theme-background)' }}
                    >
                      <div
                        className="text-3xl font-bold mb-2"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        {calculateSleepDuration(bedtime, wakeTime).toFixed(1)}h
                      </div>
                      <div
                        className="text-sm font-medium opacity-70"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        Sleep Duration
                      </div>
                    </div>
                    <div
                      className="text-center rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--theme-background)' }}
                    >
                      <div className="text-4xl mb-2">
                        {getSleepQuality(calculateSleepDuration(bedtime, wakeTime)).emoji}
                      </div>
                      <div
                        className="text-sm font-medium opacity-70"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {getSleepQuality(calculateSleepDuration(bedtime, wakeTime)).text}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <motion.button
                        onClick={saveSleepData}
                        disabled={sleepLoading || !!todaysSleepEntry}
                        className="w-full px-6 py-4 font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
                        whileHover={!todaysSleepEntry ? { scale: 1.05 } : {}}
                        whileTap={!todaysSleepEntry ? { scale: 0.95 } : {}}
                      >
                        {sleepLoading ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        <span>{sleepLoading ? 'Saving...' : todaysSleepEntry ? 'Already logged today' : 'Save Sleep Data'}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Sleep Chart */}
                  <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: 'var(--theme-background)' }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4 flex items-center"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      <Target
                        className="h-5 w-5 mr-2"
                        style={{ color: 'var(--accent-color)' }}
                      />
                      Weekly Sleep Trend
                    </h3>
                    <div className="h-64">
                      {processedSleepData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={processedSleepData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis
                              dataKey="day"
                              stroke="#9CA3AF"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              domain={[0, 12]}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                              }}
                              formatter={(value) => [`${value} hours`, 'Sleep']}
                            />
                            <Bar
                              dataKey="hours"
                              fill="#3B82F6"
                              radius={[4, 4, 0, 0]}
                              stroke="none"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                          <Moon className="h-12 w-12 mb-2" style={{ color: 'var(--theme-text)' }} />
                          <p style={{ color: 'var(--theme-text)' }}>No sleep data recorded yet</p>
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-4">
                      <span
                        className="text-sm opacity-70"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        Average: <span
                          className="font-semibold"
                          style={{ color: 'var(--accent-color)' }}
                        >
                          {averageSleep} hours
                        </span> per night
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 🌬️ Breathing Exercise Guide */}
              <motion.div variants={cardVariants}>
                <Link to="/breathing" className="block">
                  <motion.div
                    className="rounded-3xl p-8 shadow-xl border cursor-pointer transition-all duration-300 hover:shadow-2xl"
                    style={{
                      backgroundColor: 'var(--theme-card)',
                      borderColor: 'var(--theme-border)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wind
                          className="h-10 w-10 mr-4"
                          style={{ color: 'var(--accent-color)' }}
                        />
                        <div>
                          <h2
                            className="text-2xl font-bold mb-2"
                            style={{ color: 'var(--theme-text)' }}
                          >
                            Breathing Exercises
                          </h2>
                          <p
                            className="text-sm opacity-70"
                            style={{ color: 'var(--theme-text)' }}
                          >
                            Calm your mind and reduce stress with guided routines
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/breathing';
                        }}
                        className="px-8 py-4 font-semibold rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 text-white whitespace-nowrap ml-4"
                        style={{ backgroundColor: 'var(--primary-500)' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Start a Routine</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Breathing History */}
              {breathingHistory.length > 0 && (
                <motion.div variants={cardVariants}>
                  <div
                    className="rounded-3xl p-8 shadow-xl border"
                    style={{
                      backgroundColor: 'var(--theme-card)',
                      borderColor: 'var(--theme-border)'
                    }}
                  >
                    <div className="flex items-center mb-6">
                      <Activity
                        className="h-8 w-8 mr-3"
                        style={{ color: 'var(--accent-color)' }}
                      />
                      <h2
                        className="text-2xl font-bold"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        Breathing History
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {breathingHistory.slice(0, 5).map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ backgroundColor: 'var(--theme-background)' }}
                        >
                          <div className="flex items-center">
                            <div
                              className="p-3 rounded-full mr-4"
                              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                            >
                              <Wind className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                                {session.exerciseType === '478' ? '4-7-8 Breathing' : 
                                 session.exerciseType === 'box' ? 'Box Breathing' : 
                                 session.exerciseType === 'relaxation' ? 'Deep Relaxation' : 'Breathing Session'}
                              </div>
                              <div className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                                {new Date(session.createdAt).toLocaleDateString()} • {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold" style={{ color: 'var(--accent-color)' }}>
                              {Math.round(session.duration)}s
                            </div>
                            <div className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                              {session.cycles} cycles
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 📈 Mood Summary & Weekly Insights */}
              <motion.div variants={cardVariants}>
                <div
                  className="rounded-3xl p-8 shadow-xl border"
                  style={{
                    backgroundColor: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <div className="flex items-center mb-6">
                    <Heart
                      className="h-8 w-8 mr-3"
                      style={{ color: 'var(--accent-color)' }}
                    />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      Mood Summary & Weekly Insights
                    </h2>
                  </div>

                  <div className="text-center mb-8">
                    <h3
                      className="text-xl font-semibold mb-2 opacity-70"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      Here's how your week went 🌤️
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mood Distribution Chart */}
                    <div
                      className="rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--theme-background)' }}
                    >
                      <h4
                        className="text-lg font-semibold mb-4 flex items-center"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <Activity
                          className="h-5 w-5 mr-2"
                          style={{ color: 'var(--accent-color)' }}
                        />
                        Mood Distribution
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={moodDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ value, name, percent }) => value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                            >
                              {moodDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--theme-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                color: 'var(--theme-text)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weekly Stats */}
                    <div className="space-y-6">
                      <div
                        className="rounded-2xl p-6"
                        style={{ backgroundColor: 'var(--theme-background)' }}
                      >
                        <h4
                          className="text-lg font-semibold mb-4 flex items-center"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          <Coffee
                            className="h-5 w-5 mr-2"
                            style={{ color: 'var(--accent-color)' }}
                          />
                          Weekly Stats
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--theme-text)' }}>Average Sleep</span>
                            <span
                              className="font-bold"
                              style={{ color: 'var(--accent-color)' }}
                            >
                              {moodSummary.averageSleep}h
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--theme-text)' }}>Happy Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#10b981' }}
                            >
                              {moodSummary.happyDays}/7
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--theme-text)' }}>Calm Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#3b82f6' }}
                            >
                              {moodSummary.calmDays}/7
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--theme-text)' }}>Stressed Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#f59e0b' }}
                            >
                              {moodSummary.stressedDays}/7
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Motivational Footer */}
              <motion.div variants={cardVariants} className="text-center py-8">
                <div
                  className="rounded-2xl p-6 border"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--accent-color)'
                  }}
                >
                  <p
                    className="text-lg font-medium"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    Remember: small steps today lead to big changes tomorrow 🌱
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wellness;