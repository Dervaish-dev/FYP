import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Heart, Brain, Zap, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { wellnessAPI } from '../utils/api';

const BreathingExercises = () => {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);

  // Breathing Exercise States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [breathingSessionComplete, setBreathingSessionComplete] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('478'); // 4-7-8 breathing
  const [breathingStartTime, setBreathingStartTime] = useState(null);
  const [breathingHistory, setBreathingHistory] = useState([]);
  const [breathingStats, setBreathingStats] = useState({
    totalExercises: 0,
    totalDuration: 0,
    totalCycles: 0
  });

  const exercises = [
    {
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Natural tranquilizer for the nervous system',
      icon: Brain,
      phases: [
        { name: 'inhale', duration: 4000, instruction: 'Inhale through nose (4s)' },
        { name: 'hold', duration: 7000, instruction: 'Hold your breath (7s)' },
        { name: 'exhale', duration: 8000, instruction: 'Exhale through mouth (8s)' }
      ],
      cycles: 4,
      color: '#3b82f6'
    },
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Used by Navy SEALs for focus and calm',
      icon: Zap,
      phases: [
        { name: 'inhale', duration: 4000, instruction: 'Inhale slowly (4s)' },
        { name: 'hold', duration: 4000, instruction: 'Hold your breath (4s)' },
        { name: 'exhale', duration: 4000, instruction: 'Exhale gently (4s)' },
        { name: 'hold', duration: 4000, instruction: 'Hold empty (4s)' }
      ],
      cycles: 4,
      color: '#10b981'
    },
    {
      id: 'relaxation',
      name: 'Deep Relaxation',
      description: 'Perfect for stress relief and sleep preparation',
      icon: Heart,
      phases: [
        { name: 'inhale', duration: 5000, instruction: 'Breathe in deeply (5s)' },
        { name: 'hold', duration: 2000, instruction: 'Hold gently (2s)' },
        { name: 'exhale', duration: 7000, instruction: 'Exhale slowly (7s)' }
      ],
      cycles: 5,
      color: '#a855f7'
    }
  ];

  const currentExercise = exercises.find(ex => ex.id === selectedExercise) || exercises[0];

  // Load breathing history on mount
  useEffect(() => {
    const loadBreathingData = async () => {
      if (!user?.id) return;

      try {
        const data = await wellnessAPI.getBreathingData(user.id);
        setBreathingHistory(data.history || []);
        setBreathingStats(data.statistics || {
          totalExercises: 0,
          totalDuration: 0,
          totalCycles: 0
        });
      } catch (error) {
        console.error('Error loading breathing data:', error);
      }
    };

    loadBreathingData();
  }, [user]);

  // Log completed breathing exercise
  const logBreathingExercise = async (duration, cycles) => {
    if (!user?.id) return;

    try {
      await wellnessAPI.logBreathing({
        userId: user.id,
        duration: Math.round(duration / 60), // Convert to minutes
        cycles: cycles
      });

      // Reload data after logging
      const data = await wellnessAPI.getBreathingData(user.id);
      setBreathingHistory(data.history || []);
      setBreathingStats(data.statistics || {});
    } catch (error) {
      console.error('Error logging breathing exercise:', error);
    }
  };

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
    setBreathingProgress(0);
    setBreathingSessionComplete(false);
    setBreathingStartTime(Date.now());
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingCycle(0);
    setBreathingPhase('inhale');
    setBreathingProgress(0);
  };

  const resetExercise = () => {
    stopBreathingExercise();
    setBreathingSessionComplete(false);
  };

  // Breathing animation effect
  useEffect(() => {
    if (!breathingActive || !currentExercise) return;

    const phases = currentExercise.phases;
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

          if (cycleCount >= currentExercise.cycles) {
            setBreathingActive(false);
            setBreathingSessionComplete(true);

            // Log the completed session
            if (breathingStartTime) {
              const duration = (Date.now() - breathingStartTime) / 1000; // in seconds
              logBreathingExercise(duration, cycleCount);
            }
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [breathingActive, currentExercise]);

  const getCurrentInstruction = () => {
    if (!currentExercise) return 'Ready to begin';
    const phase = currentExercise.phases.find(p => p.name === breathingPhase);
    return phase ? phase.instruction : 'Ready to begin';
  };

  const getBreathingCircleSize = () => {
    const progress = breathingProgress / 100;
    switch (breathingPhase) {
      case 'inhale':
        return 100 + (progress * 120); // Expand from 100 to 220
      case 'hold':
        return 220; // Stay at max size during hold
      case 'exhale':
        return 220 - (progress * 120); // Contract from 220 to 100
      default:
        return 100;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
              Breathing Exercises
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
              Guided breathing techniques for relaxation and focus
            </p>
          </div>

          {/* Exercise Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercises.map((exercise) => {
              const Icon = exercise.icon;
              const isSelected = selectedExercise === exercise.id;
              return (
                <motion.button
                  key={exercise.id}
                  onClick={() => {
                    if (!breathingActive) {
                      setSelectedExercise(exercise.id);
                      resetExercise();
                    }
                  }}
                  disabled={breathingActive}
                  className={`rounded-xl p-6 border-2 transition-all duration-300 text-left ${breathingActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                    }`}
                  style={{
                    backgroundColor: 'var(--theme-card)',
                    borderColor: isSelected ? exercise.color : 'var(--theme-border)',
                    opacity: breathingActive && !isSelected ? 0.5 : 1
                  }}
                  whileHover={!breathingActive ? { scale: 1.02 } : {}}
                  whileTap={!breathingActive ? { scale: 0.98 } : {}}
                >
                  <Icon className="h-8 w-8 mb-3" style={{ color: exercise.color }} />
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--theme-text)' }}>
                    {exercise.name}
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    {exercise.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Main Breathing Animation */}
          <div
            className="rounded-3xl p-8 shadow-xl border"
            style={{
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="flex items-center mb-6 justify-center">
              <Wind
                className="h-8 w-8 mr-3"
                style={{ color: currentExercise.color }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--theme-text)' }}
              >
                {currentExercise.name}
              </h2>
            </div>

            {/* Breathing Animation Circle */}
            <div className="flex justify-center mb-8">
              <div
                className="relative w-96 h-96 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                {/* Animated gradient background */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle at center, ${currentExercise.color}40 0%, transparent 70%)`,
                    opacity: breathingActive ? 0.6 : 0.2,
                    transition: 'opacity 1s ease-in-out'
                  }}
                />

                {/* Main breathing circle */}
                <motion.div
                  className="absolute rounded-full border-4 shadow-2xl"
                  animate={{
                    width: getBreathingCircleSize(),
                    height: getBreathingCircleSize()
                  }}
                  transition={{
                    width: { duration: 0.1, ease: "linear" },
                    height: { duration: 0.1, ease: "linear" }
                  }}
                  style={{
                    borderColor: currentExercise.color,
                    backgroundColor: `${currentExercise.color}20`,
                    boxShadow: `0 0 40px ${currentExercise.color}60`,
                    opacity: breathingActive ? 0.8 : 0.5
                  }}
                />

                {/* Floating particles */}
                {breathingActive && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentExercise.color }}
                        animate={{
                          x: [0, Math.cos(i * 45 * Math.PI / 180) * 120, 0],
                          y: [0, Math.sin(i * 45 * Math.PI / 180) * 120, 0],
                          opacity: [0, 0.8, 0],
                          scale: [0, 1.5, 0]
                        }}
                        transition={{
                          duration: 4,
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
                    className="text-6xl font-bold mb-4"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    {breathingCycle}/{currentExercise.cycles}
                  </div>
                  <div
                    className="text-2xl font-medium px-4"
                    style={{ color: currentExercise.color }}
                  >
                    {breathingActive ? getCurrentInstruction() : 'Ready to begin'}
                  </div>
                  {breathingActive && (
                    <div className="mt-6">
                      <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: currentExercise.color,
                            width: `${breathingProgress}%`
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
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
                  className="px-8 py-4 font-semibold rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                  style={{ backgroundColor: currentExercise.color }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-6 w-6" />
                  <span>Start Exercise</span>
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

              {(breathingSessionComplete || breathingCycle > 0) && !breathingActive && (
                <motion.button
                  onClick={resetExercise}
                  className="px-8 py-4 font-semibold rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 border-2"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                    backgroundColor: 'var(--theme-background)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <RotateCcw className="h-6 w-6" />
                  <span>Reset</span>
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
                    className="rounded-xl p-6 border-2"
                    style={{
                      backgroundColor: 'var(--theme-background)',
                      borderColor: currentExercise.color
                    }}
                  >
                    <div className="text-4xl mb-2">🌿</div>
                    <div
                      className="font-bold text-xl mb-2"
                      style={{ color: currentExercise.color }}
                    >
                      Exercise Complete!
                    </div>
                    <div
                      className="opacity-70"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      Great work! Your breathing is more relaxed now.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Benefits Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="text-3xl mb-3">😌</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Reduces Stress</h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                Calms the nervous system and lowers cortisol levels
              </p>
            </div>
            <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Improves Focus</h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                Increases oxygen flow to the brain for better concentration
              </p>
            </div>
            <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="text-3xl mb-3">💤</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Better Sleep</h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                Prepares your body for restful and deep sleep
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BreathingExercises;
