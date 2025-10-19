import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  Calendar,
  Clock,
  Zap,
  Target,
  BarChart3,
  Upload,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const Emotions = () => {
  const { adaptiveMode, applyAdaptiveTheme } = useTheme();
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState(() => {
    const saved = localStorage.getItem('neurocompanion-emotion-history');
    return saved ? JSON.parse(saved) : [
      { 
        id: Date.now() - 7, 
        date: '2024-01-15', 
        emotion: 'happy', 
        intensity: 8, 
        confidence: 0.85,
        note: 'Great day at work!',
        timestamp: new Date('2024-01-15').toISOString(),
        source: 'manual'
      },
      { 
        id: Date.now() - 6, 
        date: '2024-01-14', 
        emotion: 'calm', 
        intensity: 6, 
        confidence: 0.78,
        note: 'Peaceful evening',
        timestamp: new Date('2024-01-14').toISOString(),
        source: 'manual'
      },
      { 
        id: Date.now() - 5, 
        date: '2024-01-13', 
        emotion: 'stressed', 
        intensity: 7, 
        confidence: 0.82,
        note: 'Busy day',
        timestamp: new Date('2024-01-13').toISOString(),
        source: 'manual'
      }
    ];
  });
  const [aiInsights, setAiInsights] = useState([
    "Your mood tends to be higher on weekends. Consider incorporating more relaxation activities during weekdays.",
    "Stress levels correlate with work days. Try implementing better work-life balance strategies.",
    "Meditation and mindfulness activities show positive correlation with your emotional well-being."
  ]);

  // Sync emotion history to localStorage
  useEffect(() => {
    localStorage.setItem('neurocompanion-emotion-history', JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  const emotions = [
    { key: 'happy', label: 'Happy', emoji: '😊', color: '#10b981', icon: Smile },
    { key: 'calm', label: 'Calm', emoji: '😌', color: '#3b82f6', icon: Heart },
    { key: 'neutral', label: 'Neutral', emoji: '😐', color: '#6b7280', icon: Meh },
    { key: 'stressed', label: 'Stressed', emoji: '😟', color: '#f59e0b', icon: Activity },
    { key: 'sad', label: 'Sad', emoji: '😔', color: '#ef4444', icon: Frown },
    { key: 'angry', label: 'Angry', emoji: '😠', color: '#dc2626', icon: Frown },
    { key: 'excited', label: 'Excited', emoji: '🤩', color: '#a855f7', icon: Zap },
    { key: 'worried', label: 'Worried', emoji: '😥', color: '#f97316', icon: AlertCircle },
    { key: 'confused', label: 'Confused', emoji: '🤔', color: '#64748b', icon: Brain },
    { key: 'surprised', label: 'Surprised', emoji: '😲', color: '#ec4899', icon: Target }
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

  const handleEmotionSelect = (emotion) => {
    setCurrentEmotion(emotion);
    
    // Apply adaptive theme if enabled
    if (adaptiveMode) {
      applyAdaptiveTheme(emotion);
    }
    
    // Simulate AI analysis
    setTimeout(() => {
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        emotion: emotion,
        intensity: emotionIntensity,
        note: `Feeling ${emotion} today`
      };
      setEmotionHistory(prev => [newEntry, ...prev.slice(0, 6)]);
    }, 1000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setUploadError('');
    setUploadSuccess(false);
    setIsAnalyzing(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // Prepare form data
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/emotion/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const detectedEmotionResult = response.data.emotion;
      const confidence = Math.random() * 0.3 + 0.7; // Mock confidence score
      
      setDetectedEmotion(detectedEmotionResult);
      setUploadSuccess(true);

      // Apply adaptive theme if enabled
      if (adaptiveMode) {
        applyAdaptiveTheme(detectedEmotionResult.toLowerCase());
      }

      // Add to emotion history with enhanced data
      const newEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        emotion: detectedEmotionResult.toLowerCase(),
        intensity: emotionIntensity,
        confidence: confidence,
        note: `AI detected: ${detectedEmotionResult}`,
        timestamp: new Date().toISOString(),
        source: 'ai-analysis'
      };
      setEmotionHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries

      // Reset file input to allow re-upload
      e.target.value = '';

    } catch (error) {
      console.error('Emotion analysis error:', error);
      setUploadError(error.response?.data?.error || 'Failed to analyze emotion. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setDetectedEmotion('');
    setUploadError('');
    setUploadSuccess(false);
    setPreviewImage(null);
    
    // Apply adaptive theme if enabled
    if (adaptiveMode) {
      applyAdaptiveTheme(emotion.toLowerCase());
    }

    // Add to emotion history with enhanced data
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      emotion: emotion.toLowerCase(),
      intensity: emotionIntensity,
      confidence: 1.0, // Manual selection has 100% confidence
      note: `Manually selected: ${emotion}`,
      timestamp: new Date().toISOString(),
      source: 'manual'
    };
    setEmotionHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
  };

  const getEmotionData = () => {
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion.key] = emotionHistory.filter(entry => entry.emotion === emotion.key).length;
      return acc;
    }, {});
    
    return emotions.map(emotion => ({
      name: emotion.label,
      value: emotionCounts[emotion.key],
      color: emotion.color
    }));
  };

  const getWeeklyTrend = () => {
    return emotionHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      intensity: entry.intensity,
      emotion: entry.emotion
    }));
  };

  const averageIntensity = emotionHistory.length > 0 
    ? (emotionHistory.reduce((sum, entry) => sum + entry.intensity, 0) / emotionHistory.length).toFixed(1)
    : 0;

  const currentEmotionData = emotions.find(e => e.key === currentEmotion);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
              Emotion Recognition & Analysis
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
              Track and understand your emotional patterns
            </p>
          </motion.div>

          {/* Emotion Recognition & Analysis */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Heart className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                <span>Emotion Recognition & Analysis</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manual Emotion Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
                    Select Your Emotion
                  </h3>
                  
                  <select
                    className="w-full p-3 border rounded-lg mb-4"
                    style={{
                      backgroundColor: 'var(--theme-card)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                    value={selectedEmotion}
                    onChange={(e) => handleManualEmotionSelect(e.target.value)}
                  >
                    <option value="">Choose your current emotion</option>
                    <option value="Happy">Happy</option>
                    <option value="Sad">Sad</option>
                    <option value="Calm">Calm</option>
                    <option value="Stressed">Stressed</option>
                    <option value="Angry">Angry</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Excited">Excited</option>
                    <option value="Worried">Worried</option>
                    <option value="Confused">Confused</option>
                    <option value="Surprised">Surprised</option>
                  </select>

                  {/* Intensity Slider */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
                      Intensity: {emotionIntensity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={emotionIntensity}
                      onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--theme-primary) 0%, var(--theme-primary) ${(emotionIntensity - 1) * 11.11}%, var(--theme-border) ${(emotionIntensity - 1) * 11.11}%, var(--theme-border) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs opacity-70 mt-1" style={{ color: 'var(--theme-text)' }}>
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Manual Selection Result */}
                  {selectedEmotion && (
                    <motion.div
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: 'var(--theme-primary)',
                        backgroundColor: 'var(--theme-primary-50)'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                            Selected: {selectedEmotion}
                          </p>
                          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                            Intensity: {emotionIntensity}/10
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Image Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
                    Upload Picture for AI Analysis
                  </h3>
                  
                  <div className="text-center mb-4">
                    <div className="text-gray-500 text-sm mb-4">— OR —</div>
                    
                    <label 
                      className="border-2 border-dashed rounded-lg p-8 cursor-pointer hover:opacity-80 transition-all duration-300 block"
                      style={{ 
                        borderColor: 'var(--theme-border)',
                        backgroundColor: 'var(--theme-background)'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isAnalyzing}
                      />
                      <div className="flex flex-col items-center space-y-2">
                        {isAnalyzing ? (
                          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--theme-primary)' }} />
                        ) : (
                          <Camera className="h-8 w-8" style={{ color: 'var(--theme-primary)' }} />
                        )}
                        <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
                          {isAnalyzing ? 'Analyzing...' : 'Upload a Picture'}
                        </span>
                        <span className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                          JPG, PNG, GIF up to 10MB
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {previewImage && (
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                        style={{ borderColor: 'var(--theme-border)' }}
                      />
                    </motion.div>
                  )}

                  {/* Analysis Results */}
                  {isAnalyzing && (
                    <motion.div
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: 'var(--theme-primary)',
                        backgroundColor: 'var(--theme-primary-50)'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--theme-primary)' }} />
                        <span style={{ color: 'var(--theme-text)' }}>Analyzing emotion...</span>
                      </div>
                    </motion.div>
                  )}

                  {detectedEmotion && uploadSuccess && (
                    <motion.div
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: 'var(--theme-primary)',
                        backgroundColor: 'var(--theme-primary-50)'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                            Detected Emotion: <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{detectedEmotion}</span>
                          </p>
                          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                            AI Analysis Complete
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {uploadError && (
                    <motion.div
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: '#ef4444',
                        backgroundColor: '#fef2f2'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{uploadError}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emotion Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Trend Chart */}
            <motion.div variants={itemVariants}>
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Weekly Emotion Trend</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getWeeklyTrend()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                    <XAxis dataKey="date" stroke="var(--theme-text)" opacity={0.7} />
                    <YAxis stroke="var(--theme-text)" opacity={0.7} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--theme-card)', 
                        borderColor: 'var(--theme-border)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--theme-text)' }}
                      itemStyle={{ color: 'var(--theme-text)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="var(--theme-primary)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--theme-primary)', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm opacity-70 text-center mt-2" style={{ color: 'var(--theme-text)' }}>
                  Average intensity: {averageIntensity}/10
                </p>
              </div>
            </motion.div>

            {/* Emotion Distribution */}
            <motion.div variants={itemVariants}>
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Emotion Distribution</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getEmotionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => {
                        // Only show label if percentage is > 5% to avoid clutter
                        return percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '';
                      }}
                    >
                      {getEmotionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--theme-card)', 
                        borderColor: 'var(--theme-border)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--theme-text)' }}
                      itemStyle={{ color: 'var(--theme-text)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend below chart to avoid overlap */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {getEmotionData().map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span style={{ color: 'var(--theme-text)' }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Emotion History */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Calendar className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Recent Emotion History</span>
              </h3>
              <div className="space-y-3">
                {emotionHistory.slice(0, 5).map((entry, index) => {
                  const emotionData = emotions.find(e => e.key === entry.emotion);
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                      style={{ borderColor: 'var(--theme-border)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="text-2xl">{emotionData?.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
                            {emotionData?.label}
                          </span>
                          <span className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                            {entry.intensity}/10
                          </span>
                        </div>
                        <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                          {entry.note}
                        </p>
                      </div>
                      <div className="text-sm opacity-60" style={{ color: 'var(--theme-text)' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* AI Emotion Insights */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Brain className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>AI Emotion Insights</span>
              </h3>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: 'var(--theme-border)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
                      <p className="opacity-80" style={{ color: 'var(--theme-text)' }}>
                        {insight}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Emotions;