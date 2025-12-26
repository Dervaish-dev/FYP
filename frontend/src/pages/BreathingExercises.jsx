import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Heart, Brain, Zap, Activity, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { wellnessAPI } from '../utils/api';

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

const BreathingExercises = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Breathing Exercise States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhaseIndex, setBreathingPhaseIndex] = useState(0);
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

  const currentExercise = exercises.find(ex => ex.id === selectedExercise) || exercises[0];

  // Log completed breathing exercise
  const logBreathingExercise = async (duration, cycles) => {
    if (!user?.id) return;

    try {
      await wellnessAPI.logBreathing({
        userId: user.id,
        duration: duration,
        cycles: cycles,
        exerciseType: selectedExercise
      });
      console.log('Breathing exercise logged:', { userId: user.id, duration, cycles });
      
      // Refresh history
      fetchBreathingHistory();
    } catch (error) {
      console.error('Error logging breathing exercise:', error);
    }
  };

  const fetchBreathingHistory = async () => {
    if (!user?.id) return;
    try {
      const response = await wellnessAPI.getBreathingHistory(user.id);
      // The API returns { history: [...], statistics: {...} }
      const history = response.history || [];
      setBreathingHistory(history);
      
      // Calculate stats from history if not provided in response, or use response stats
      if (response.statistics) {
        setBreathingStats(response.statistics);
      } else {
        const totalExercises = history.length;
        const totalDuration = history.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalCycles = history.reduce((acc, curr) => acc + (curr.cycles || 0), 0);
        
        setBreathingStats({
          totalExercises,
          totalDuration,
          totalCycles
        });
      }
    } catch (error) {
      console.error('Error fetching breathing history:', error);
    }
  };

  useEffect(() => {
    fetchBreathingHistory();
  }, [user?.id]);

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCycle(1);
    setBreathingPhaseIndex(0);
    setBreathingProgress(0);
    setBreathingSessionComplete(false);
    setBreathingStartTime(Date.now());
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingCycle(0);
    setBreathingPhaseIndex(0);
    setBreathingProgress(0);
  };

  const resetExercise = () => {
    stopBreathingExercise();
    setBreathingSessionComplete(false);
  };

  // Breathing animation effect
  useEffect(() => {
    if (!breathingActive || !currentExercise) return;

    let animationFrameId;
    const startTime = Date.now();
    const phases = currentExercise.phases;
    const phaseDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    const totalDuration = phaseDuration * currentExercise.cycles;

    const animate = () => {
      const now = Date.now();
      const elapsedTime = now - startTime;

      if (elapsedTime >= totalDuration) {
        setBreathingActive(false);
        setBreathingSessionComplete(true);
        setBreathingProgress(0);
        setBreathingPhaseIndex(0);
        setBreathingCycle(currentExercise.cycles);
        
        // Log the completed session
        if (breathingStartTime) {
          const duration = (Date.now() - breathingStartTime) / 1000; // in seconds
          logBreathingExercise(duration, currentExercise.cycles);
        }
        return;
      }

      // Calculate current cycle
      const currentCycleIndex = Math.floor(elapsedTime / phaseDuration);
      const timeInCurrentCycle = elapsedTime % phaseDuration;

      // Determine current phase
      let accumulatedPhaseTime = 0;
      let phaseIndex = 0;
      
      for (let i = 0; i < phases.length; i++) {
        if (timeInCurrentCycle < accumulatedPhaseTime + phases[i].duration) {
          phaseIndex = i;
          break;
        }
        accumulatedPhaseTime += phases[i].duration;
      }

      const currentPhaseObj = phases[phaseIndex];
      const timeInPhase = timeInCurrentCycle - accumulatedPhaseTime;
      const progress = Math.min((timeInPhase / currentPhaseObj.duration) * 100, 100);

      setBreathingPhaseIndex(phaseIndex);
      setBreathingProgress(progress);
      setBreathingCycle(currentCycleIndex + 1);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [breathingActive, currentExercise]);

  const getCurrentInstruction = () => {
    if (!currentExercise) return 'Ready to begin';
    const phase = currentExercise.phases[breathingPhaseIndex];
    return phase ? phase.instruction : 'Ready to begin';
  };

  const getBreathingCircleSize = () => {
    if (!currentExercise) return 100;
    const currentPhaseObj = currentExercise.phases[breathingPhaseIndex];
    const progress = breathingProgress / 100;

    if (currentPhaseObj.name === 'inhale') {
      return 100 + (progress * 120); // Expand from 100 to 220
    } else if (currentPhaseObj.name === 'exhale') {
      return 220 - (progress * 120); // Contract from 220 to 100
    } else if (currentPhaseObj.name === 'hold') {
      // Check previous phase to decide if holding full or empty
      const prevPhaseIndex = (breathingPhaseIndex - 1 + currentExercise.phases.length) % currentExercise.phases.length;
      const prevPhase = currentExercise.phases[prevPhaseIndex];
      
      if (prevPhase.name === 'inhale') return 220; // Hold full
      if (prevPhase.name === 'exhale') return 100; // Hold empty
      return 220;
    }
    return 100;
  };

  // Calculate smooth circle size based on current phase and progress
  const smoothCircleSize = getBreathingCircleSize();

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-4 md:p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
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
            className="rounded-3xl p-6 md:p-8 shadow-xl border overflow-hidden"
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
            <div className="flex justify-center mb-8 overflow-hidden">
              <div
                className="relative w-80 h-80 md:w-96 md:h-96 rounded-full flex items-center justify-center overflow-hidden"
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
                    width: smoothCircleSize,
                    height: smoothCircleSize,
                    opacity: breathingActive ? 0.8 : 0.5,
                  }}
                  style={{
                    borderColor: currentExercise.color,
                    backgroundColor: `${currentExercise.color}20`,
                    boxShadow: `0 0 40px ${currentExercise.color}60`,
                  }}
                  transition={{ duration: 0 }}
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
                      <div className="w-40 md:w-48 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
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
            <div className="flex justify-center space-x-3 flex-wrap gap-3">
              {!breathingActive ? (
                <motion.button
                  onClick={startBreathingExercise}
                  className="px-6 md:px-8 py-3 md:py-4 font-semibold rounded-xl flex items-center space-x-2 md:space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 text-white text-sm md:text-base"
                  style={{ backgroundColor: currentExercise.color }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-5 w-5 md:h-6 md:w-6" />
                  <span>Start Exercise</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={stopBreathingExercise}
                  className="px-6 md:px-8 py-3 md:py-4 font-semibold rounded-xl flex items-center space-x-2 md:space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 text-white text-sm md:text-base"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                  <span>Stop Exercise</span>
                </motion.button>
              )}

              {(breathingSessionComplete || breathingCycle > 0) && !breathingActive && (
                <motion.button
                  onClick={resetExercise}
                  className="px-6 md:px-8 py-3 md:py-4 font-semibold rounded-xl flex items-center space-x-2 md:space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 border-2 text-sm md:text-base"
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

          {/* History & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stats Card */}
            <div className="rounded-3xl p-8 shadow-xl border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center mb-6">
                <Activity className="h-8 w-8 mr-3" style={{ color: 'var(--accent-color)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>Your Progress</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-color)' }}>{breathingStats.totalExercises}</div>
                  <div className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Total Sessions</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: '#10b981' }}>{Math.round(breathingStats.totalDuration / 60)}</div>
                  <div className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Minutes Breathed</div>
                </div>
              </div>
            </div>

            {/* Recent History */}
            <div className="rounded-3xl p-8 shadow-xl border" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center mb-6">
                <Clock className="h-8 w-8 mr-3" style={{ color: 'var(--accent-color)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>Recent Sessions</h2>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {breathingHistory.length === 0 ? (
                  <div className="text-center opacity-50 py-8" style={{ color: 'var(--theme-text)' }}>
                    <p>No breathing sessions yet.</p>
                    <p className="text-sm mt-2">Complete an exercise to see your history!</p>
                  </div>
                ) : (
                  breathingHistory.slice(0, 5).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-background)' }}>
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                          {session.exerciseType === '478' ? '4-7-8 Breathing' : 
                           session.exerciseType === 'box' ? 'Box Breathing' : 
                           session.exerciseType === 'relaxation' ? 'Deep Relaxation' : 'Breathing Session'}
                        </div>
                        <div className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>
                          {new Date(session.createdAt).toLocaleDateString()} • {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: 'var(--accent-color)' }}>{Math.round(session.duration)}s</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BreathingExercises;
