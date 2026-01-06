import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, BookOpen, CheckSquare, Activity, TrendingUp,
  TrendingDown, Minus, Calendar, Clock, Brain, AlertCircle, Mail,
  Target, BarChart3, MessageSquare, Star, Zap, Download
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CaregiverLayout from '../components/CaregiverLayout';
import {
  LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, Line, Bar, Pie
} from 'recharts';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    fetchPatientDetail();
  }, [patientId]);

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('caregiverToken');
      const response = await fetch(`/api/caregiver/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch patient details');
      }

      // Parse the backend response correctly
      const { patient: patientInfo, data, summary } = result;
      
      // Transform emotions to include emoji (matches all 10 supported emotions)
      const emotionEmojiMap = {
        happy: '😊',
        sad: '😔',
        calm: '😌',
        stressed: '😟',
        angry: '😠',
        neutral: '😐',
        excited: '🤩',
        worried: '😥',
        confused: '🤔',
        surprised: '😲',
        // Legacy emotions (kept for backward compatibility)
        anxious: '😰',
        frustrated: '😤',
        grateful: '🙏',
        peaceful: '☮️',
        content: '😊'
      };
      
      const recentEmotions = data.emotions.slice(0, 7).map(e => ({
        emotion: e.emotion,
        emoji: emotionEmojiMap[e.emotion?.toLowerCase()] || '😊',
        timestamp: e.timestamp,
        intensity: e.intensity
      }));

      // Calculate emotion trend data for chart (last 7 days)
      const emotionTrendData = calculateEmotionTrend(data.emotions);
      
      // Calculate task completion data
      const taskCompletionData = calculateTaskCompletion(data.tasks);
      
      // Calculate emotion distribution
      const emotionDistribution = calculateEmotionDistribution(data.emotions);
      
      // Generate care reports from recent journals
      const recentReports = generateCareReports(data.journals, data.emotions, data.tasks);
      
      // Generate AI recommendations
      const aiRecommendations = generateAIRecommendations(summary, data);

      // Set complete patient object
      setPatient({
        id: patientInfo.id,
        name: patientInfo.name,
        email: patientInfo.email,
        joinedDate: patientInfo.createdAt,
        lastActive: data.emotions[0]?.timestamp || patientInfo.createdAt,
        moodTrend: summary.moodTrend,
        wellnessScore: summary.wellnessScore,
        tasksCompleted: summary.completedTasks,
        totalTasks: summary.totalTasks,
        journalCount: summary.totalJournals,
        activityLevel: data.emotions.length > 10 ? 'active' : data.emotions.length > 5 ? 'moderate' : 'low',
        recentEmotions,
        emotionTrendData,
        taskCompletionData,
        emotionDistribution,
        recentReports,
        aiRecommendations,
        // Raw data for future use
        allEmotions: data.emotions,
        allTasks: data.tasks,
        allJournals: data.journals,
        allWellness: data.wellness
      });
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('caregiverToken');
      const response = await fetch(`/api/caregiver/patient/${patientId}/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Weekly-Report-${patient.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error(err.message || 'Failed to download report');
    }
  };

  // Helper function to convert mood score to text
  const getMoodLabel = (score) => {
    if (score <= 2) return 'Very Poor';
    if (score <= 4) return 'Poor';
    if (score <= 6) return 'Fair';
    if (score <= 8) return 'Good';
    return 'Excellent';
  };

  // Helper function to convert stress score to text
  const getStressLabel = (score) => {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'High';
    return 'Very High';
  };

  // Helper function to convert energy score to text
  const getEnergyLabel = (score) => {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Fair';
    if (score <= 8) return 'Good';
    return 'Excellent';
  };

  // Helper function to calculate emotion trend for chart
  const calculateEmotionTrend = (emotions) => {
    const last14Days = []; // Show 2 weeks to see week separation
    const today = new Date();
    const dayToWeek = {};
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = date.toDateString();
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Track week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      dayToWeek[dateKey] = weekKey;
      
      // Get all emotions for this day
      const dayEmotions = emotions.filter(e => {
        const emotionDate = new Date(e.timestamp || e.createdAt || e.date);
        return emotionDate.toDateString() === dateString;
      });
      
      const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'content', 'calm', 'hopeful'];
      const negativeEmotions = ['sad', 'anxious', 'angry', 'frustrated', 'stressed', 'worried'];
      
      let moodScore = 5;
      let stressScore = 5;
      let energyScore = 5;
      
      if (dayEmotions.length > 0) {
        // Calculate averages instead of just counts
        const positiveCount = dayEmotions.filter(e => positiveEmotions.includes(e.emotion?.toLowerCase())).length;
        const negativeCount = dayEmotions.filter(e => negativeEmotions.includes(e.emotion?.toLowerCase())).length;
        const avgIntensity = dayEmotions.reduce((sum, e) => sum + (e.intensity || 5), 0) / dayEmotions.length;
        
        // Use the average intensity for mood, adjusted by positive/negative ratio
        moodScore = Math.min(10, Math.max(1, avgIntensity + (positiveCount > 0 ? 1 : 0) - (negativeCount > 0 ? 1 : 0)));
        stressScore = negativeCount > 0 ? Math.min(10, 7 + (negativeCount / dayEmotions.length)) : 2;
        energyScore = Math.round(avgIntensity);
      }
      
      last14Days.push({
        dateKey,
        weekKey,
        date: dayName,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: parseFloat(moodScore.toFixed(1)),
        stress: parseFloat(stressScore.toFixed(1)),
        energy: parseFloat(energyScore.toFixed(1)),
        entryCount: dayEmotions.length
      });
    }
    
    return last14Days;
  };

  // Helper function to calculate task completion
  const calculateTaskCompletion = (tasks) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt || t.date);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(t => t.status === 'done').length;
      const total = dayTasks.length || 1; // Avoid division by zero
      
      last7Days.push({
        day: dayName,
        completed,
        total
      });
    }
    
    return last7Days;
  };

  // Helper function to calculate emotion distribution
  const calculateEmotionDistribution = (emotions) => {
    const emotionCounts = {};
    const emotionColors = {
      happy: '#10b981',
      excited: '#10b981',
      grateful: '#10b981',
      peaceful: '#3b82f6',
      calm: '#3b82f6',
      content: '#3b82f6',
      neutral: '#6b7280',
      stressed: '#f59e0b',
      frustrated: '#f59e0b',
      worried: '#f59e0b',
      confused: '#9ca3af',
      surprised: '#8b5cf6',
      anxious: '#ef4444',
      sad: '#ef4444',
      angry: '#ef4444'
    };
    
    emotions.forEach(e => {
      const emotion = e.emotion?.toLowerCase() || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // Group into categories (updated to include all 10 emotions)
    const distribution = {
      'Happy': 0,
      'Calm': 0,
      'Neutral': 0,
      'Stressed': 0,
      'Confused': 0,
      'Sad': 0
    };
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (['happy', 'excited', 'grateful'].includes(emotion)) distribution['Happy'] += count;
      else if (['calm', 'peaceful', 'content'].includes(emotion)) distribution['Calm'] += count;
      else if (['stressed', 'frustrated', 'worried'].includes(emotion)) distribution['Stressed'] += count;
      else if (['confused', 'surprised'].includes(emotion)) distribution['Confused'] += count;
      else if (['sad', 'anxious', 'angry'].includes(emotion)) distribution['Sad'] += count;
      else distribution['Neutral'] += count;
    });
    
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0) || 1;
    
    const categoryColors = {
      'happy': '#10b981',
      'calm': '#3b82f6',
      'neutral': '#6b7280',
      'stressed': '#f59e0b',
      'confused': '#9ca3af',
      'sad': '#ef4444'
    };
    
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value: Math.round((value / total) * 100),
        color: categoryColors[name.toLowerCase()] || '#6b7280'
      }))
      .filter(item => item.value > 0);
  };

  // Helper function to generate care reports
  const generateCareReports = (journals, emotions, tasks) => {
    const reports = journals.slice(0, 3).map((journal, index) => {
      const journalDate = new Date(journal.createdAt || journal.date);
      const dayEmotions = emotions.filter(e => {
        const emotionDate = new Date(e.timestamp);
        return emotionDate.toDateString() === journalDate.toDateString();
      });
      
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt || t.date);
        return taskDate.toDateString() === journalDate.toDateString();
      });
      
      const completedTasks = dayTasks.filter(t => t.status === 'done').length;
      const completionRate = dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0;
      
      const positiveEmotions = dayEmotions.filter(e => 
        ['happy', 'excited', 'grateful', 'peaceful', 'content'].includes(e.emotion?.toLowerCase())
      );
      
      const mood = positiveEmotions.length > dayEmotions.length / 2 ? 'Positive' : 
                   positiveEmotions.length === dayEmotions.length / 2 ? 'Stable' : 'Needs Support';
      
      return {
        id: index + 1,
        date: journalDate.toISOString().split('T')[0],
        mood,
        tasksCompleted: `${completionRate}%`,
        sleepQuality: 'Good', // Default if no wellness data
        medicationAdherence: '100%', // Default
        notes: journal.content?.substring(0, 150) || 'Patient showed consistent engagement with wellness activities.',
        recommendations: generateRecommendations(mood, completionRate, dayEmotions)
      };
    });
    
    return reports.length > 0 ? reports : [];
  };

  // Helper function to generate recommendations
  const generateRecommendations = (mood, completionRate, emotions) => {
    const recs = [];
    
    if (mood === 'Positive') {
      recs.push('Continue current routine');
      recs.push('Consider adding new activities');
    } else if (mood === 'Needs Support') {
      recs.push('Monitor stress levels closely');
      recs.push('Practice relaxation techniques');
    }
    
    if (completionRate > 80) {
      recs.push('Excellent task management');
    } else if (completionRate < 50) {
      recs.push('Review task difficulty');
      recs.push('Break tasks into smaller steps');
    }
    
    if (emotions.some(e => ['anxious', 'stressed'].includes(e.emotion?.toLowerCase()))) {
      recs.push('Schedule stress management session');
    }
    
    return recs.slice(0, 3);
  };

  // Helper function to generate AI recommendations
  const generateAIRecommendations = (summary, data) => {
    const recommendations = [];
    
    // Wellness score based
    if (summary.wellnessScore >= 80) {
      recommendations.push('Patient shows excellent overall wellness. Continue current treatment plan and consider introducing new wellness activities to maintain engagement.');
    } else if (summary.wellnessScore < 60) {
      recommendations.push('Wellness score indicates need for intervention. Consider reviewing current strategies and adjusting treatment plan to better support patient needs.');
    }
    
    // Mood trend based
    if (summary.moodTrend === 'improving') {
      recommendations.push('Positive mood trend observed. Current interventions are effective. Maintain consistency in routine and support systems.');
    } else if (summary.moodTrend === 'declining') {
      recommendations.push('Declining mood trend detected. Schedule check-in session to discuss challenges and adjust support strategies accordingly.');
    }
    
    // Task completion based
    const taskCompletionRate = summary.totalTasks > 0 ? (summary.completedTasks / summary.totalTasks) * 100 : 0;
    if (taskCompletionRate > 80) {
      recommendations.push('Excellent task completion rate. Patient demonstrates strong self-management skills. Consider gradually increasing task complexity.');
    } else if (taskCompletionRate < 50) {
      recommendations.push('Low task completion rate may indicate overwhelming workload or motivation challenges. Consider simplifying tasks or providing additional support.');
    }
    
    // Journal activity based
    if (summary.totalJournals > 10) {
      recommendations.push('High journaling activity shows strong engagement with self-reflection. Review journal entries for insights into patient\'s emotional patterns.');
    } else if (summary.totalJournals < 3) {
      recommendations.push('Limited journaling activity. Encourage regular journaling as it can provide valuable insights and support emotional processing.');
    }
    
    return recommendations;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-green-600 bg-green-50';
    if (trend === 'declining') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <CaregiverLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }} />
            <p style={{ color: 'var(--theme-text)' }}>Loading patient details...</p>
          </div>
        </div>
      </CaregiverLayout>
    );
  }

  if (error || !patient) {
    return (
      <CaregiverLayout>
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
              {error || 'Patient not found'}
            </p>
          </div>
          <button
            onClick={() => navigate('/caregiver/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </CaregiverLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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

  const averageMood = patient.emotionTrendData.length > 0 
    ? (patient.emotionTrendData.reduce((sum, day) => sum + day.mood, 0) / patient.emotionTrendData.length).toFixed(1)
    : 'N/A';
    
  const averageTaskCompletion = patient.taskCompletionData.length > 0
    ? (patient.taskCompletionData.reduce((sum, day) => sum + (day.completed / day.total), 0) / patient.taskCompletionData.length * 100).toFixed(0)
    : '0';

  return (
    <CaregiverLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/caregiver/dashboard')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg mb-6 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
      >
        <ArrowLeft className="w-4 h-4" style={{ color: 'var(--theme-text)' }} />
        <span style={{ color: 'var(--theme-text)' }}>Back to Patients</span>
      </button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
          {/* Patient Header */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <span className="text-2xl font-bold text-white">
                    {patient.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
                    {patient.name}
                  </h1>
                  <p className="opacity-70 mb-2" style={{ color: 'var(--theme-text)' }}>
                    {patient.email}
                  </p>
                  <div className="flex items-center gap-4 text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last active: {new Date(patient.lastActive).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined: {new Date(patient.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTrendColor(patient.moodTrend)}`}>
                  {getTrendIcon(patient.moodTrend)}
                  <span className="text-sm font-medium capitalize">{patient.moodTrend}</span>
                </div>
                
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 active:scale-95 shadow-sm"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                
                {/* Timeframe selector */}
                <div className="flex gap-2 mt-1">
                  {['week', 'month', 'quarter'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedTimeframe === timeframe ? 'text-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: selectedTimeframe === timeframe ? 'var(--theme-primary)' : 'transparent',
                        color: selectedTimeframe === timeframe ? 'white' : 'var(--theme-text)'
                      }}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Average Mood</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{averageMood}/10</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp size={12} className="mr-1" />
                      {patient.moodTrend === 'improving' ? 'Improving' : 'Stable'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                    <Heart className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Task Completion</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{averageTaskCompletion}%</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <Target size={12} className="mr-1" />
                      {patient.tasksCompleted}/{patient.totalTasks} completed
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                    <Target className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Wellness Score</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{patient.wellnessScore}/100</p>
                    <p className="text-xs flex items-center mt-1" style={{ color: 'var(--theme-text)' }}>
                      <Brain size={12} className="mr-1" />
                      Overall health
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                    <Brain className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Journal Entries</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{patient.journalCount}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--theme-text)' }}>
                      Activity: {patient.activityLevel}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                    <Activity className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Trend Chart */}
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Emotion Trend Analysis</span>
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={patient.emotionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--theme-text)" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="var(--theme-text)" 
                      style={{ fontSize: '11px' }}
                      domain={[0, 10]}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--theme-card)', 
                        borderColor: 'var(--theme-border)', 
                        borderRadius: '0.75rem',
                        color: 'var(--theme-text)',
                        padding: '10px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Mood') return [getMoodLabel(value), name];
                        if (name === 'Stress') return [getStressLabel(value), name];
                        if (name === 'Energy') return [getEnergyLabel(value), name];
                        return [value.toFixed(1), name];
                      }}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#10b981" 
                      strokeWidth={2.5} 
                      name="Mood"
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5} 
                      name="Stress"
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5} 
                      name="Energy"
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Task Completion Chart */}
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <Target className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Task Completion Rate</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={patient.taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                    <XAxis dataKey="day" stroke="var(--theme-text)" style={{ fontSize: '12px' }} />
                    <YAxis stroke="var(--theme-text)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--theme-card)', 
                        borderColor: 'var(--theme-border)', 
                        borderRadius: '0.75rem',
                        color: 'var(--theme-text)'
                      }}
                    />
                    <Bar dataKey="completed" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Emotion Distribution */}
          {patient.emotionDistribution && patient.emotionDistribution.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <Heart className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Emotion Distribution</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={patient.emotionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {patient.emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'var(--theme-card)', 
                          borderColor: 'var(--theme-border)', 
                          borderRadius: '0.75rem',
                          color: 'var(--theme-text)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {patient.emotionDistribution.map((emotion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: emotion.color }} />
                        <span className="text-sm" style={{ color: 'var(--theme-text)' }}>
                          {emotion.name}: {emotion.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Emotions Timeline */}
          {patient.recentEmotions && patient.recentEmotions.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <Heart className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  Recent Emotions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {patient.recentEmotions.map((emotion, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3 text-center hover:shadow-md transition-shadow"
                      style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--theme-border)' }}
                    >
                      <span className="text-3xl mb-2 block">{emotion.emoji}</span>
                      <p className="text-sm font-medium capitalize mb-1" style={{ color: 'var(--theme-text)' }}>
                        {emotion.emotion}
                      </p>
                      <p className="text-xs opacity-50" style={{ color: 'var(--theme-text)' }}>
                        {new Date(emotion.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Care Reports */}
          {patient.recentReports && patient.recentReports.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <MessageSquare className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Recent Care Reports</span>
                </h3>
                <div className="space-y-4">
                  {patient.recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      className="p-4 border rounded-lg"
                      style={{ borderColor: 'var(--theme-border)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                            {new Date(report.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                              Mood: {report.mood}
                            </span>
                            <span className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                              Tasks: {report.tasksCompleted}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm opacity-80 mb-3" style={{ color: 'var(--theme-text)' }}>
                        {report.notes}
                      </p>
                      {report.recommendations && report.recommendations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {report.recommendations.map((rec, recIndex) => (
                            <span
                              key={recIndex}
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ 
                                backgroundColor: 'var(--theme-primary)',
                                color: 'white',
                                opacity: 0.8
                              }}
                            >
                              {rec}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Recommendations */}
          {patient.aiRecommendations && patient.aiRecommendations.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <Brain className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  AI Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.aiRecommendations.map((rec, index) => {
                    const icons = [
                      { icon: Star, color: 'text-yellow-500', label: 'Priority' },
                      { icon: Zap, color: 'text-blue-500', label: 'Action' },
                      { icon: AlertCircle, color: 'text-orange-500', label: 'Monitor' },
                      { icon: TrendingUp, color: 'text-green-500', label: 'Progress' }
                    ];
                    const { icon: Icon, color, label } = icons[index % icons.length];
                    
                    return (
                      <div key={index} className="p-4 border rounded-lg" style={{ borderColor: 'var(--theme-border)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{label}</span>
                        </div>
                        <p className="text-sm opacity-80" style={{ color: 'var(--theme-text)' }}>
                          {rec}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        <ToastContainer position="bottom-right" />
    </CaregiverLayout>
  );
};

export default PatientDetail;
