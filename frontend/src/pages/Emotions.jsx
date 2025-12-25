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
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { buildUserContextString } from '../utils/userPreferences';
import { useNotifications, NOTIFICATION_TYPES } from '../components/NotificationCenter';

const Emotions = () => {
  const { adaptiveMode, applyAdaptiveTheme } = useTheme();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const userId = user?._id || user?.id;
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [aiInsights, setAiInsights] = useState([]);

  // Fetch emotion history from backend
  useEffect(() => {
    if (userId) {
      fetchEmotionHistory();
    }
    // Cleanup webcam on unmount
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userId]);

  // Generate AI insights based on emotion history
  useEffect(() => {
    if (emotionHistory.length > 0) {
      generateAIInsights(emotionHistory);
    }
  }, [emotionHistory]);

  const generateAIInsights = (emotions) => {
    try {
      const insights = [];
      
      // Analyze emotion patterns
      const emotionCounts = {};
      const emotionsByHour = {};
      
      emotions.forEach(entry => {
        const emotion = entry.emotion?.toLowerCase() || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        
        // Track time patterns
        if (entry.timestamp || entry.createdAt) {
          const hour = new Date(entry.timestamp || entry.createdAt).getHours();
          emotionsByHour[hour] = emotionsByHour[hour] || [];
          emotionsByHour[hour].push(emotion);
        }
      });

      // Find dominant emotion
      const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      const dominantEmotion = sortedEmotions[0]?.[0];
      const dominantCount = sortedEmotions[0]?.[1] || 0;
      const percentage = Math.round((dominantCount / emotions.length) * 100);

      // Insight 1: Dominant emotion pattern
      if (dominantEmotion) {
        const positiveEmotions = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful'];
        if (positiveEmotions.includes(dominantEmotion)) {
          insights.push(`Your emotions are ${percentage}% ${dominantEmotion}. You're maintaining positive emotional wellness! 🌟`);
        } else if (dominantEmotion === 'stressed' || dominantEmotion === 'anxious') {
          insights.push(`You've been feeling ${dominantEmotion} ${percentage}% of the time. Consider relaxation techniques and breathing exercises.`);
        } else {
          insights.push(`Your most common emotion is ${dominantEmotion} (${percentage}%). Track patterns to understand triggers better.`);
        }
      }

      // Insight 2: Time-based patterns
      const morningEmotions = [];
      const eveningEmotions = [];
      
      Object.entries(emotionsByHour).forEach(([hour, emotions]) => {
        const h = parseInt(hour);
        if (h >= 6 && h < 12) {
          morningEmotions.push(...emotions);
        } else if (h >= 18 && h < 24) {
          eveningEmotions.push(...emotions);
        }
      });

      if (morningEmotions.length > 0 && eveningEmotions.length > 0) {
        const positiveEmotions = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful'];
        const morningPositive = morningEmotions.filter(e => positiveEmotions.includes(e)).length;
        const eveningPositive = eveningEmotions.filter(e => positiveEmotions.includes(e)).length;
        
        const morningPerc = Math.round((morningPositive / morningEmotions.length) * 100);
        const eveningPerc = Math.round((eveningPositive / eveningEmotions.length) * 100);
        
        if (morningPerc > eveningPerc + 20) {
          insights.push("Your mood tends to be better in the mornings. Consider handling important tasks earlier in the day.");
        } else if (eveningPerc > morningPerc + 20) {
          insights.push("You feel more positive in the evenings. Evening routines seem to work well for you!");
        }
      }

      // Insight 3: Variety analysis
      const uniqueEmotions = Object.keys(emotionCounts).length;
      if (uniqueEmotions <= 2) {
        insights.push("Your emotions show consistent patterns. This could indicate stable routines or limited emotional expression.");
      } else if (uniqueEmotions >= 5) {
        insights.push("You experience a diverse range of emotions, which is healthy and normal. Keep tracking to identify triggers.");
      }

      // Fallback insights if not enough data
      if (insights.length === 0) {
        insights.push(
          "Track your emotions regularly to discover personalized patterns and insights.",
          "Consistent emotion tracking helps identify triggers and improve self-awareness.",
          "Your emotional data is building. Check back soon for personalized insights!"
        );
      }

      setAiInsights(insights.slice(0, 3)); // Keep max 3 insights
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback insights
      setAiInsights([
        "Track your emotions regularly to discover personalized patterns and insights.",
        "Mindfulness and self-awareness are key to emotional wellness.",
        "Your emotional journey is unique. Keep tracking to understand yourself better."
      ]);
    }
  };

  // Effect to handle video stream when it changes
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      console.log('🔄 Attaching stream to video element');
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().then(() => {
        console.log('✅ Video playing successfully');
      }).catch(err => {
        console.error('❌ Video play error:', err);
      });
    }
  }, [webcamStream]);

  const fetchEmotionHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.get(`/emotions/history/${userId}?limit=20`);
      if (response.data.success && response.data.data.emotions) {
        setEmotionHistory(response.data.data.emotions);
      }
    } catch (error) {
      console.error('Error fetching emotion history:', error);
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('neurocompanion-emotion-history');
      if (saved) {
        setEmotionHistory(JSON.parse(saved));
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Save emotion to backend
  const saveEmotionToBackend = async (emotionData) => {
    try {
      await api.post('/emotions/history', {
        userId,
        ...emotionData
      });
    } catch (error) {
      console.error('Error saving emotion to backend:', error);
      // Still save to localStorage as fallback
      const current = JSON.parse(localStorage.getItem('neurocompanion-emotion-history') || '[]');
      localStorage.setItem('neurocompanion-emotion-history', JSON.stringify([emotionData, ...current]));
    }
  };

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
      // Use HuggingFace facial emotion detection for better accuracy
      const response = await api.post('/emotion/analyze-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const detectedEmotionResult = response.data.emotion;
      const intensityFromModel = response.data.intensity;
      const confidenceFromModel = response.data.confidence;
      const allResults = response.data.allResults || [];
      
      console.log('HuggingFace emotion detection:', { 
        emotion: detectedEmotionResult, 
        confidence: confidenceFromModel,
        allResults 
      });
      
      setDetectedEmotion(detectedEmotionResult);
      setUploadSuccess(true);

      // Apply adaptive theme if enabled
      if (adaptiveMode) {
        applyAdaptiveTheme(detectedEmotionResult.toLowerCase());
      }

      // Add to emotion history with enhanced data
      const newEntry = {
        id: Date.now(),
        emotion: detectedEmotionResult.toLowerCase(),
        intensity: Number.isFinite(intensityFromModel) ? intensityFromModel : emotionIntensity,
        confidence: Number.isFinite(confidenceFromModel) ? confidenceFromModel : 0.75,
        note: '',
        timestamp: new Date().toISOString(),
        source: 'ai-facial-analysis'
      };
      
      // Save to backend
      await saveEmotionToBackend(newEntry);
      
      // Update local state and refresh from backend
      await fetchEmotionHistory();

      // Trigger emotion-based notifications
      if (detectedEmotionResult.toLowerCase() === 'sad' || detectedEmotionResult.toLowerCase() === 'depressed') {
        addNotification(
          '🌿 You seem a little down. Take a deep breath and remember you\'re stronger than you know! 💙',
          NOTIFICATION_TYPES.SUPPORT,
          '🌿'
        );
      } else if (detectedEmotionResult.toLowerCase() === 'stressed' || detectedEmotionResult.toLowerCase() === 'anxious') {
        addNotification(
          '🌸 Feeling overwhelmed? Try taking a short break or doing some deep breathing! 💫',
          NOTIFICATION_TYPES.SUPPORT,
          '🌸'
        );
      } else if (detectedEmotionResult.toLowerCase() === 'happy' || detectedEmotionResult.toLowerCase() === 'excited') {
        addNotification(
          '😄 Love that positive energy! Keep spreading those good vibes! ✨',
          NOTIFICATION_TYPES.CELEBRATION,
          '😄'
        );
      } else if (detectedEmotionResult.toLowerCase() === 'angry' || detectedEmotionResult.toLowerCase() === 'frustrated') {
        addNotification(
          '🤗 It\'s okay to feel this way. Try some gentle breathing or a quick walk! 🌿',
          NOTIFICATION_TYPES.SUPPORT,
          '🤗'
        );
      }

      // Reset file input to allow re-upload
      e.target.value = '';

    } catch (error) {
      console.error('Emotion analysis error:', error);
      const data = error.response?.data;
      const message =
        data?.message ||
        data?.error ||
        'Failed to analyze emotion. Please try again.';
      const details = data?.details ? `\n\n${data.details}` : '';
      setUploadError(`${message}${details}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Webcam functions
  const startWebcam = async () => {
    try {
      console.log('🎥 Starting webcam...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      console.log('✅ Got media stream:', stream.id);
      console.log('📊 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      setWebcamStream(stream);
      setWebcamActive(true);
      setUploadError('');
    } catch (error) {
      console.error('❌ Error accessing webcam:', error);
      setUploadError(`Unable to access webcam: ${error.message}. Please check permissions.`);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setWebcamActive(false);
    setPreviewImage(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      setUploadError('Camera not ready. Please try again.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is actually playing
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.error('Video not ready:', video.readyState);
      setUploadError('Camera still loading. Please wait a moment and try again.');
      return;
    }
    
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    console.log('Capturing photo:', canvas.width, 'x', canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setUploadError('Failed to capture photo');
        return;
      }

      const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
      stopWebcam();

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      setIsAnalyzing(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await api.post('/emotion/analyze-face', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const detectedEmotionResult = response.data.emotion;
        const intensityFromModel = response.data.intensity;
        const confidenceFromModel = response.data.confidence;
        
        setDetectedEmotion(detectedEmotionResult);
        setUploadSuccess(true);

        if (adaptiveMode) {
          applyAdaptiveTheme(detectedEmotionResult.toLowerCase());
        }

        setSelectedEmotion(detectedEmotionResult);
        if (Number.isFinite(intensityFromModel)) {
          setEmotionIntensity(intensityFromModel);
        }

        const newEntry = {
          id: Date.now(),
          emotion: detectedEmotionResult.toLowerCase(),
          intensity: Number.isFinite(intensityFromModel) ? intensityFromModel : emotionIntensity,
          confidence: Number.isFinite(confidenceFromModel) ? confidenceFromModel : 0.75,
          note: '',
          timestamp: new Date().toISOString(),
          source: 'ai-webcam-analysis'
        };
        
        await saveEmotionToBackend(newEntry);
        await fetchEmotionHistory();

        addNotification(
          `📸 Webcam Analysis: ${detectedEmotionResult} (${(confidenceFromModel * 100).toFixed(0)}% confident)`,
          NOTIFICATION_TYPES.INFO,
          '📸'
        );
      } catch (error) {
        console.error('Error analyzing webcam capture:', error);
        setUploadError(error.response?.data?.error || 'Failed to analyze photo. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleManualEmotionSelect = async (emotion) => {
    if (!emotion) return;
    
    try {
      setIsSaving(true);
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
        emotion: emotion.toLowerCase(),
        intensity: emotionIntensity,
        confidence: 1.0, // Manual selection has 100% confidence
        note: '',
        timestamp: new Date().toISOString(),
        source: 'manual'
      };
      
      // Save to backend
      await saveEmotionToBackend(newEntry);
      
      // Update local state and refresh from backend
      await fetchEmotionHistory();

      // Show success notification
      addNotification(
        '✅ Emotion saved successfully!',
        NOTIFICATION_TYPES.SUCCESS,
        '✅'
      );

      // Trigger emotion-based notifications for manual selection
      if (emotion.toLowerCase() === 'sad' || emotion.toLowerCase() === 'depressed') {
        addNotification(
          '🌿 Thanks for sharing how you feel. Remember, it\'s okay to not be okay sometimes! 💙',
          NOTIFICATION_TYPES.SUPPORT,
          '🌿'
        );
      } else if (emotion.toLowerCase() === 'stressed' || emotion.toLowerCase() === 'anxious') {
        addNotification(
          '🌸 Acknowledging stress is the first step! Try some gentle breathing exercises! 💫',
          NOTIFICATION_TYPES.SUPPORT,
          '🌸'
        );
      } else if (emotion.toLowerCase() === 'happy' || emotion.toLowerCase() === 'excited') {
        addNotification(
          '😄 Wonderful! Your positive energy is contagious! Keep shining! ✨',
          NOTIFICATION_TYPES.CELEBRATION,
          '😄'
        );
      } else if (emotion.toLowerCase() === 'angry' || emotion.toLowerCase() === 'frustrated') {
        addNotification(
          '🤗 It\'s healthy to recognize anger. Try some deep breathing or gentle movement! 🌿',
          NOTIFICATION_TYPES.SUPPORT,
          '🤗'
        );
      }
      
      // Reset selection after successful save
      setTimeout(() => {
        setSelectedEmotion('');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving emotion:', error);
      addNotification(
        '❌ Failed to save emotion. Please try again.',
        NOTIFICATION_TYPES.ERROR,
        '❌'
      );
    } finally {
      setIsSaving(false);
    }
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
      date: new Date(entry.timestamp || entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
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
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                  >
                    <option value="" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>Choose your current emotion</option>
                    <option value="Happy" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😊 Happy</option>
                    <option value="Sad" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😔 Sad</option>
                    <option value="Calm" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😌 Calm</option>
                    <option value="Stressed" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😟 Stressed</option>
                    <option value="Angry" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😠 Angry</option>
                    <option value="Neutral" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😐 Neutral</option>
                    <option value="Excited" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>🤩 Excited</option>
                    <option value="Worried" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😥 Worried</option>
                    <option value="Confused" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>🤔 Confused</option>
                    <option value="Surprised" style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-text)' }}>😲 Surprised</option>
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

                  {/* Save Button */}
                  <button
                    onClick={() => handleManualEmotionSelect(selectedEmotion)}
                    disabled={!selectedEmotion || isSaving}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{ 
                      backgroundColor: selectedEmotion ? 'var(--theme-primary)' : 'var(--theme-border)'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Save Emotion</span>
                      </>
                    )}
                  </button>

                  {/* Manual Selection Result */}
                  {selectedEmotion && !isSaving && (
                    <motion.div
                      className="p-3 rounded-lg border mt-4"
                      style={{ 
                        borderColor: 'var(--theme-primary)',
                        backgroundColor: 'var(--theme-primary-50)'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>
                            Selected: {selectedEmotion}
                          </p>
                          <p className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>
                            Intensity: {emotionIntensity}/10 • Click "Save Emotion" to record
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Image Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
                    Capture or Upload for AI Analysis
                  </h3>
                  
                  {/* Webcam Section */}
                  {!webcamActive ? (
                    <div className="mb-4">
                      <button
                        onClick={startWebcam}
                        disabled={isAnalyzing}
                        className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border-2"
                        style={{ 
                          borderColor: 'var(--theme-primary)',
                          color: 'var(--theme-primary)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <Camera className="h-5 w-5" />
                        <span>Use Webcam</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 space-y-3">
                      <div className="text-sm mb-2 font-semibold" style={{ color: 'var(--theme-primary)' }}>
                        📹 Webcam Active {webcamStream && `(Stream ID: ${webcamStream.id.slice(0, 8)}...)`}
                      </div>
                      <div className="relative rounded-lg overflow-hidden border-2 bg-black" style={{ borderColor: 'var(--theme-primary)' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-cover"
                          style={{ minHeight: '256px' }}
                          onLoadedMetadata={() => console.log('📹 Video metadata loaded')}
                          onPlay={() => console.log('▶️ Video started playing')}
                          onError={(e) => console.error('❌ Video error:', e)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={capturePhoto}
                          disabled={isAnalyzing}
                          className="flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
                          style={{ backgroundColor: 'var(--theme-primary)' }}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="h-5 w-5" />
                              <span>Capture</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={stopWebcam}
                          disabled={isAnalyzing}
                          className="py-2 px-4 rounded-lg font-semibold transition-all duration-300 border"
                          style={{ 
                            borderColor: 'var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
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
                        disabled={isAnalyzing || webcamActive}
                      />
                      <div className="flex flex-col items-center space-y-2">
                        {isAnalyzing ? (
                          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--theme-primary)' }} />
                        ) : (
                          <Upload className="h-8 w-8" style={{ color: 'var(--theme-primary)' }} />
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
                            Intensity: {entry.intensity}/10
                          </span>
                        </div>
                      </div>
                      <div className="text-sm opacity-60" style={{ color: 'var(--theme-text)' }}>
                        {new Date(entry.timestamp || entry.date).toLocaleDateString()}
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