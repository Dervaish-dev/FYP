import React, { useState, useEffect, useCallback } from 'react';
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
import { wellnessAPI } from '../utils/api';

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
        loadMoodAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading wellness data:', error);
      toast.error('Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  }, []);

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
    setAnalyticsLoading(true);
    try {
      // Mock analytics data for now
      const mockMoodData = [
        { day: 'Mon', mood: 'happy', sleep: 7.5 },
        { day: 'Tue', mood: 'calm', sleep: 8.0 },
        { day: 'Wed', mood: 'stressed', sleep: 6.5 },
        { day: 'Thu', mood: 'happy', sleep: 7.8 },
        { day: 'Fri', mood: 'calm', sleep: 8.2 },
        { day: 'Sat', mood: 'happy', sleep: 9.0 },
        { day: 'Sun', mood: 'calm', sleep: 7.0 }
      ];

      setMoodData(mockMoodData);

      // Calculate mood summary
      const happyDays = mockMoodData.filter(d => d.mood === 'happy').length;
      const stressedDays = mockMoodData.filter(d => d.mood === 'stressed').length;
      const calmDays = mockMoodData.filter(d => d.mood === 'calm').length;
      const avgSleep = mockMoodData.reduce((sum, d) => sum + d.sleep, 0) / mockMoodData.length;

      setMoodSummary({
        averageSleep: parseFloat(avgSleep.toFixed(1)),
        happyDays,
        stressedDays,
        calmDays,
        recommendation: avgSleep < 7 ?
          "You've been sleeping less lately. Try a relaxing routine before bed 🌙" :
          "Great sleep routine! You're well-rested and energized 💪"
      });
    } catch (error) {
      console.error('Error loading mood analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Save sleep data
  const saveSleepData = useCallback(async () => {
    if (!user?.id) return;

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
  }, [bedtime, wakeTime, user, loadSleepData, loadMoodAnalytics]);

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
  // Use real data if available, otherwise mock for visualization
  const processedSleepData = sleepData.length > 0
    ? sleepData.slice(0, 7).reverse().map(entry => ({
      day: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: entry.sleepDuration || 0
    }))
    : [
      { day: 'Mon', hours: 7.5 },
      { day: 'Tue', hours: 8.2 },
      { day: 'Wed', hours: 6.8 },
      { day: 'Thu', hours: 7.9 },
      { day: 'Fri', hours: 8.5 },
      { day: 'Sat', hours: 9.1 },
      { day: 'Sun', hours: 8.3 }
    ];

  const averageSleep = processedSleepData.length > 0
    ? (processedSleepData.reduce((sum, day) => sum + day.hours, 0) / processedSleepData.length).toFixed(1)
    : '8.0';

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
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
      <div
        className="min-h-screen p-6"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)'
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
                <p style={{ color: 'var(--text-color)' }}>Loading wellness data...</p>
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
                  style={{ color: 'var(--text-color)' }}
                >
                  Health & Wellness
                </h1>
                <p
                  className="text-lg opacity-70"
                  style={{ color: 'var(--text-color)' }}
                >
                  Track your wellness journey with personalized insights
                </p>
              </motion.div>

              {/* 🌙 Sleep Routine Tracker */}
              <motion.div variants={cardVariants}>
                <div
                  className="rounded-3xl p-8 shadow-xl border"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center mb-6">
                    <Moon
                      className="h-8 w-8 mr-3"
                      style={{ color: 'var(--accent-color)' }}
                    />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Sleep Routine Tracker
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-3"
                        style={{ color: 'var(--text-color)' }}
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
                          backgroundColor: 'var(--bg-color)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-3"
                        style={{ color: 'var(--text-color)' }}
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
                          backgroundColor: 'var(--bg-color)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div
                      className="text-center rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--bg-color)' }}
                    >
                      <div
                        className="text-3xl font-bold mb-2"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        {calculateSleepDuration(bedtime, wakeTime).toFixed(1)}h
                      </div>
                      <div
                        className="text-sm font-medium opacity-70"
                        style={{ color: 'var(--text-color)' }}
                      >
                        Sleep Duration
                      </div>
                    </div>
                    <div
                      className="text-center rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--bg-color)' }}
                    >
                      <div className="text-4xl mb-2">
                        {getSleepQuality(calculateSleepDuration(bedtime, wakeTime)).emoji}
                      </div>
                      <div
                        className="text-sm font-medium opacity-70"
                        style={{ color: 'var(--text-color)' }}
                      >
                        {getSleepQuality(calculateSleepDuration(bedtime, wakeTime)).text}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <motion.button
                        onClick={saveSleepData}
                        disabled={sleepLoading}
                        className="w-full px-6 py-4 font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {sleepLoading ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        <span>{sleepLoading ? 'Saving...' : 'Save Sleep Data'}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Sleep Chart */}
                  <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: 'var(--bg-color)' }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4 flex items-center"
                      style={{ color: 'var(--text-color)' }}
                    >
                      <Target
                        className="h-5 w-5 mr-2"
                        style={{ color: 'var(--accent-color)' }}
                      />
                      Weekly Sleep Trend
                    </h3>
                    <div className="h-64">
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
                    </div>
                    <div className="text-center mt-4">
                      <span
                        className="text-sm opacity-70"
                        style={{ color: 'var(--text-color)' }}
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
                <div
                  className="rounded-3xl p-8 shadow-xl border"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center mb-6">
                    <Wind
                      className="h-8 w-8 mr-3"
                      style={{ color: 'var(--accent-color)' }}
                    />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      🫁 Guided Breathing Exercise
                    </h2>
                  </div>

                  <p
                    className="mb-8 text-center opacity-70"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Follow the expanding circle to calm your breathing
                  </p>

                  {/* Breathing Animation */}
                  <div className="flex justify-center mb-8">
                    <div
                      className="relative w-96 h-96 rounded-3xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-color)' }}
                    >
                      {/* Animated gradient background */}
                      <div
                        className="absolute inset-0 rounded-3xl opacity-20"
                        style={{
                          background: `radial-gradient(circle at center, var(--accent-color) 0%, transparent 70%)`,
                          animation: breathingActive ? 'pulse 4s ease-in-out infinite' : 'none'
                        }}
                      />

                      {/* Breathing circle with smooth animation */}
                      <motion.div
                        className="absolute rounded-full border-4 shadow-lg"
                        animate={{
                          width: getBreathingCircleSize(),
                          height: getBreathingCircleSize(),
                          opacity: breathingActive ? [0.6, 1, 0.6] : 0.4,
                          scale: breathingActive ? [0.9, 1.1, 0.9] : 1
                        }}
                        transition={{
                          duration: breathingActive ? 4 : 0.5,
                          repeat: breathingActive ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                        style={{
                          borderColor: 'var(--accent-color)',
                          backgroundColor: `rgba(${theme === 'dark' ? '59, 130, 246' : '14, 165, 233'}, 0.1)`,
                          filter: 'drop-shadow(0 0 20px var(--accent-color))'
                        }}
                      />

                      {/* Floating particles effect */}
                      {breathingActive && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full"
                              style={{ backgroundColor: 'var(--accent-color)' }}
                              animate={{
                                x: [0, Math.cos(i * 60 * Math.PI / 180) * 100, 0],
                                y: [0, Math.sin(i * 60 * Math.PI / 180) * 100, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Center content */}
                      <div className="text-center z-20 relative">
                        <div
                          className="text-5xl font-bold mb-3"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {breathingCycle}/4
                        </div>
                        <div
                          className="text-xl font-medium"
                          style={{ color: 'var(--accent-color)' }}
                        >
                          {breathingActive ? getBreathingInstruction() : 'Ready to begin'}
                        </div>
                        {breathingActive && (
                          <div
                            className="mt-4 text-sm opacity-70"
                            style={{ color: 'var(--text-color)' }}
                          >
                            Phase: {breathingPhase}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    {!breathingActive ? (
                      <motion.button
                        onClick={startBreathingExercise}
                        className="px-8 py-4 font-semibold rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="h-6 w-6" />
                        <span>Start Breathing Exercise</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={stopBreathingExercise}
                        className="px-8 py-4 font-semibold rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Pause className="h-6 w-6" />
                        <span>Stop Exercise</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Session Complete Message */}
                  <AnimatePresence>
                    {breathingSessionComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 text-center"
                      >
                        <div
                          className="rounded-xl p-4 border"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'var(--accent-color)'
                          }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: 'var(--accent-color)' }}
                          >
                            🌿 Session Complete! Your breathing is more relaxed now.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* 📈 Mood Summary & Weekly Insights */}
              <motion.div variants={cardVariants}>
                <div
                  className="rounded-3xl p-8 shadow-xl border"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center mb-6">
                    <Heart
                      className="h-8 w-8 mr-3"
                      style={{ color: 'var(--accent-color)' }}
                    />
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      📈 Mood Summary & Weekly Insights
                    </h2>
                  </div>

                  <div className="text-center mb-8">
                    <h3
                      className="text-xl font-semibold mb-2 opacity-70"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Here's how your week went 🌤️
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mood Distribution Chart */}
                    <div
                      className="rounded-2xl p-6"
                      style={{ backgroundColor: 'var(--bg-color)' }}
                    >
                      <h4
                        className="text-lg font-semibold mb-4 flex items-center"
                        style={{ color: 'var(--text-color)' }}
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
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {moodDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                color: 'var(--text-color)'
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
                        style={{ backgroundColor: 'var(--bg-color)' }}
                      >
                        <h4
                          className="text-lg font-semibold mb-4 flex items-center"
                          style={{ color: 'var(--text-color)' }}
                        >
                          <Coffee
                            className="h-5 w-5 mr-2"
                            style={{ color: 'var(--accent-color)' }}
                          />
                          Weekly Stats
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-color)' }}>Average Sleep</span>
                            <span
                              className="font-bold"
                              style={{ color: 'var(--accent-color)' }}
                            >
                              {moodSummary.averageSleep}h
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-color)' }}>Happy Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#10b981' }}
                            >
                              {moodSummary.happyDays}/7
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-color)' }}>Calm Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#3b82f6' }}
                            >
                              {moodSummary.calmDays}/7
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-color)' }}>Stressed Days</span>
                            <span
                              className="font-bold"
                              style={{ color: '#f59e0b' }}
                            >
                              {moodSummary.stressedDays}/7
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div
                        className="rounded-2xl p-6 border"
                        style={{
                          backgroundColor: 'var(--bg-color)',
                          borderColor: 'var(--accent-color)'
                        }}
                      >
                        <h4
                          className="text-lg font-semibold mb-3 flex items-center"
                          style={{ color: 'var(--text-color)' }}
                        >
                          <Sparkles
                            className="h-5 w-5 mr-2"
                            style={{ color: 'var(--accent-color)' }}
                          />
                          AI Recommendation
                        </h4>
                        <p
                          className="leading-relaxed"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {moodSummary.recommendation}
                        </p>
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
                    backgroundColor: 'var(--bg-color)',
                    borderColor: 'var(--accent-color)'
                  }}
                >
                  <p
                    className="text-lg font-medium"
                    style={{ color: 'var(--text-color)' }}
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