import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Wellness = () => {
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathingCount, setBreathingCount] = useState(0);
  const [reminders, setReminders] = useState([
    { id: 1, text: 'Take medication', completed: false, time: '09:00' },
    { id: 2, text: 'Drink water', completed: true, time: '12:00' },
    { id: 3, text: 'Go for a walk', completed: false, time: '15:00' },
    { id: 4, text: 'Practice mindfulness', completed: false, time: '18:00' }
  ]);

  const sleepData = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 8.0 },
    { day: 'Wed', hours: 6.5 },
    { day: 'Thu', hours: 7.8 },
    { day: 'Fri', hours: 8.2 },
    { day: 'Sat', hours: 9.0 },
    { day: 'Sun', hours: 7.0 }
  ];

  const moodData = [
    { day: 'Mon', mood: 7 },
    { day: 'Tue', mood: 8 },
    { day: 'Wed', mood: 5 },
    { day: 'Thu', mood: 6 },
    { day: 'Fri', mood: 8 },
    { day: 'Sat', mood: 9 },
    { day: 'Sun', mood: 7 }
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

  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  // Breathing animation effect
  useEffect(() => {
    if (!breathingActive) return;

    const phases = ['inhale', 'hold', 'exhale'];
    let currentPhaseIndex = 0;
    let cycleCount = 0;

    const interval = setInterval(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      setBreathingPhase(phases[currentPhaseIndex]);

      if (currentPhaseIndex === 0) {
        cycleCount++;
        setBreathingCount(cycleCount);
      }
    }, 3000); // 3 seconds per phase

    return () => clearInterval(interval);
  }, [breathingActive]);

  const getBreathingInstructions = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out gently...';
      default: return 'Ready to begin';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale': return '#10b981'; // green
      case 'hold': return '#f59e0b'; // amber
      case 'exhale': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const averageSleep = (sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length).toFixed(1);
  const averageMood = (moodData.reduce((sum, day) => sum + day.mood, 0) / moodData.length).toFixed(1);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              Health & Wellness
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--text-color)' }}>
              Track your wellness journey
            </p>
          </motion.div>

          {/* Sleep Schedule Manager */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <Moon className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
                <span>Sleep Schedule Manager</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Bedtime</label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Sleep Duration Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sleepData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="var(--accent-color)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--accent-color)', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm opacity-70 text-center mt-2" style={{ color: 'var(--text-color)' }}>
                  Average: {averageSleep} hours per night
                </p>
              </div>
            </div>
          </motion.div>

          {/* Breathing Techniques Engine */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <Wind className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
                <span>Breathing Techniques Engine</span>
              </h2>
              
              <div className="text-center">
                <div className="mb-6">
                  <motion.div
                    className="mx-auto mb-4"
                    animate={breathingActive ? {
                      scale: breathingPhase === 'inhale' ? [1, 1.3] : 
                             breathingPhase === 'hold' ? [1.3, 1.3] : [1.3, 1],
                      backgroundColor: getBreathingColor()
                    } : {}}
                    transition={{ duration: 3, repeat: breathingActive ? Infinity : 0 }}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      backgroundColor: breathingActive ? getBreathingColor() : 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {breathingActive ? (
                      <span>{breathingCount}</span>
                    ) : (
                      <Play size={48} />
                    )}
                  </motion.div>
                </div>

                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  {breathingActive ? getBreathingInstructions() : 'Ready to begin breathing exercise'}
                </h3>
                
                <p className="opacity-70 mb-6" style={{ color: 'var(--text-color)' }}>
                  {breathingActive 
                    ? `Cycle ${breathingCount} - Follow the circle's rhythm`
                    : 'Click the circle to start a calming breathing exercise'
                  }
                </p>

                <div className="flex justify-center space-x-4">
                  {!breathingActive ? (
                    <motion.button
                      onClick={startBreathingExercise}
                      className="px-6 py-3 rounded-lg text-white font-medium"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Breathing Exercise
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={stopBreathingExercise}
                      className="px-6 py-3 rounded-lg text-white font-medium bg-red-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Stop Exercise
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Persistent Nudge Service */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <Bell className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
                <span>Wellness Reminders</span>
              </h2>
              
              <div className="space-y-4">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                    style={{ borderColor: 'var(--border-color)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {reminder.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${reminder.completed ? 'line-through opacity-60' : ''}`} style={{ color: 'var(--text-color)' }}>
                        {reminder.text}
                      </p>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                        {reminder.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mood Phase Tracker */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--text-color)' }}>
                <Heart className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
                <span>Mood Phase Tracker</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Weekly Mood Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={moodData}>
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
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Insights</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center space-x-3 mb-2">
                        <Activity className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>Average Mood</span>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>{averageMood}/10</p>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                        This week's emotional baseline
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center space-x-3 mb-2">
                        <Brain className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>Recommendation</span>
                      </div>
                      <p className="text-sm opacity-80" style={{ color: 'var(--text-color)' }}>
                        Your mood tends to be higher on weekends. Consider incorporating more relaxation activities during weekdays.
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

export default Wellness;