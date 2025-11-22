import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText, 
  Heart, 
  Brain, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Clock,
  Target,
  Activity
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
  Bar,
  AreaChart,
  Area
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    journal: [],
    emotions: [],
    tasks: [],
    wellness: []
  });
  const [overallScore, setOverallScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  // Load data from all modules
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    // Load Journal data
    const journalData = JSON.parse(localStorage.getItem('neurocompanion-journal') || '[]');
    
    // Load Emotion data
    const emotionData = JSON.parse(localStorage.getItem('neurocompanion-emotion-history') || '[]');
    
    // If no emotion data exists, add some sample data for demonstration
    if (emotionData.length === 0) {
      const sampleEmotions = [
        { 
          id: Date.now() - 7, 
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          emotion: 'happy', 
          intensity: 8, 
          confidence: 0.85,
          note: 'Great day at work!',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual'
        },
        { 
          id: Date.now() - 6, 
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          emotion: 'calm', 
          intensity: 6, 
          confidence: 0.78,
          note: 'Peaceful evening',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual'
        },
        { 
          id: Date.now() - 5, 
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          emotion: 'stressed', 
          intensity: 7, 
          confidence: 0.82,
          note: 'Busy day',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual'
        },
        { 
          id: Date.now() - 4, 
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          emotion: 'excited', 
          intensity: 9, 
          confidence: 0.90,
          note: 'Excited about weekend plans',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual'
        },
        { 
          id: Date.now() - 3, 
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          emotion: 'neutral', 
          intensity: 5, 
          confidence: 0.75,
          note: 'Regular day',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual'
        }
      ];
      // Store sample data in localStorage for demonstration
      localStorage.setItem('neurocompanion-emotion-history', JSON.stringify(sampleEmotions));
      emotionData.push(...sampleEmotions);
    }
    
    // Load Task data
    const taskData = JSON.parse(localStorage.getItem('neurocompanion-tasks') || '[]');
    const taskHistory = JSON.parse(localStorage.getItem('neurocompanion-task-history') || '[]');
    
    // Load Wellness data
    const wellnessData = JSON.parse(localStorage.getItem('neurocompanion-wellness') || '[]');
    
    setAnalyticsData({
      journal: journalData,
      emotions: emotionData,
      tasks: [...taskData, ...taskHistory],
      wellness: wellnessData
    });

    // Calculate overall wellness score
    calculateOverallScore(journalData, emotionData, [...taskData, ...taskHistory], wellnessData);
  };

  const calculateOverallScore = (journal, emotions, tasks, wellness) => {
    let score = 0;
    let totalWeight = 0;

    // Journal mood analysis (40% weight)
    if (journal.length > 0) {
      const positiveMoods = journal.filter(entry => 
        ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic'].includes(entry.mood)
      ).length;
      const journalScore = (positiveMoods / journal.length) * 100;
      score += journalScore * 0.4;
      totalWeight += 0.4;
    }

    // Task completion (30% weight)
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const taskScore = (completedTasks / tasks.length) * 100;
      score += taskScore * 0.3;
      totalWeight += 0.3;
    }

    // Emotion stability (20% weight)
    if (emotions.length > 0) {
      const stableEmotions = emotions.filter(emotion => 
        ['happy', 'calm', 'neutral', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic'].includes(emotion.emotion)
      ).length;
      const emotionScore = (stableEmotions / emotions.length) * 100;
      score += emotionScore * 0.2;
      totalWeight += 0.2;
    }

    // Wellness activities (10% weight)
    if (wellness.length > 0) {
      const completedWellness = wellness.filter(activity => activity.completed).length;
      const wellnessScore = (completedWellness / wellness.length) * 100;
      score += wellnessScore * 0.1;
      totalWeight += 0.1;
    }

    const finalScore = totalWeight > 0 ? score / totalWeight : 50;
    setOverallScore(Math.round(finalScore));

    // Generate recommendations
    generateRecommendations(finalScore, journal, emotions, tasks);
  };

  const generateRecommendations = (score, journal, emotions, tasks) => {
    const recs = [];

    if (score < 75) {
      recs.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Consider Professional Support',
        description: 'Your wellness score suggests you might benefit from speaking with a mental health professional.',
        action: 'Find a therapist or counselor'
      });
    }

    if (score < 50) {
      recs.push({
        type: 'urgent',
        icon: AlertTriangle,
        title: 'Seek Immediate Support',
        description: 'Your wellness indicators suggest you should consider reaching out to a healthcare provider.',
        action: 'Contact a doctor or mental health professional'
      });
    }

    // Task-based recommendations
    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const completionRate = recentTasks.length > 0 ? 
      recentTasks.filter(task => task.status === 'done').length / recentTasks.length : 0;

    if (completionRate < 0.5) {
      recs.push({
        type: 'info',
        icon: Target,
        title: 'Improve Task Management',
        description: 'Consider breaking down larger tasks into smaller, manageable steps.',
        action: 'Use the task scheduling feature more effectively'
      });
    }

    // Emotion-based recommendations
    const recentEmotions = emotions.filter(emotion => 
      new Date(emotion.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const negativeEmotions = recentEmotions.filter(emotion => 
      ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'frustrated', 'overwhelmed', 'worried', 'confused', 'lonely', 'nervous', 'pessimistic'].includes(emotion.emotion)
    ).length;

    if (negativeEmotions > recentEmotions.length * 0.6) {
      recs.push({
        type: 'info',
        icon: Heart,
        title: 'Focus on Emotional Well-being',
        description: 'Consider practicing mindfulness or relaxation techniques.',
        action: 'Try the wellness breathing exercises'
      });
    }

    setRecommendations(recs);
  };

  // Prepare chart data
  const getMoodDistributionData = () => {
    // Process emotion history data
    const emotionCounts = analyticsData.emotions.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      happy: '#10B981',
      sad: '#EF4444',
      calm: '#3B82F6',
      stressed: '#F59E0B',
      anxious: '#8B5CF6',
      neutral: '#6B7280',
      excited: '#EC4899',
      worried: '#F97316',
      angry: '#DC2626',
      confused: '#64748B',
      surprised: '#EC4899',
      depressed: '#7C2D12',
      frustrated: '#F97316',
      overwhelmed: '#F59E0B',
      lonely: '#6B7280',
      grateful: '#10B981',
      hopeful: '#3B82F6',
      peaceful: '#10B981',
      content: '#10B981',
      nervous: '#F59E0B',
      optimistic: '#10B981',
      pessimistic: '#6B7280'
    };

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: count,
      color: colors[emotion] || '#6B7280'
    }));
  };

  const getWeeklyTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayEntries = analyticsData.journal.filter(entry => 
        entry.timestamp && entry.timestamp.startsWith(date)
      );
      
      const dayEmotions = analyticsData.emotions.filter(emotion => 
        emotion.timestamp && emotion.timestamp.startsWith(date)
      );
      
      const dayTasks = analyticsData.tasks.filter(task => 
        task.createdAt && task.createdAt.startsWith(date)
      );

      // Calculate average mood from both journal entries and emotion records
      let avgMood = 3; // Default neutral
      
      if (dayEmotions.length > 0) {
        // Use emotion intensity as mood score
        avgMood = dayEmotions.reduce((sum, emotion) => sum + emotion.intensity, 0) / dayEmotions.length;
      } else if (dayEntries.length > 0) {
        // Fallback to journal mood scoring
        avgMood = dayEntries.reduce((sum, entry) => {
          const moodScores = {
            happy: 5, excited: 5, grateful: 5, hopeful: 5, peaceful: 5, content: 5, optimistic: 5,
            calm: 4, neutral: 3,
            sad: 2, anxious: 2, worried: 2, confused: 2, lonely: 2, nervous: 2, pessimistic: 2,
            angry: 1, stressed: 1, depressed: 1, frustrated: 1, overwhelmed: 1
          };
          return sum + (moodScores[entry.mood] || 3);
        }, 0) / dayEntries.length;
      }

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: avgMood,
        tasks: dayTasks.length,
        entries: dayEntries.length + dayEmotions.length
      };
    });
  };

  const getTaskCompletionData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayTasks = analyticsData.tasks.filter(task => 
        task.createdAt && task.createdAt.startsWith(date)
      );
      const completedTasks = dayTasks.filter(task => task.status === 'done').length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedTasks,
        total: dayTasks.length
      };
    }).slice(-7); // Last 7 days
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('NeuroCompanion Wellness Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Overall Score
    doc.setFontSize(16);
    doc.text('Overall Wellness Score', 20, 50);
    doc.setFontSize(24);
    doc.text(`${overallScore}%`, 20, 65);
    
    // Score interpretation
    doc.setFontSize(12);
    let scoreInterpretation = '';
    if (overallScore >= 80) scoreInterpretation = 'Excellent - You\'re doing great!';
    else if (overallScore >= 60) scoreInterpretation = 'Good - Keep up the good work!';
    else if (overallScore >= 40) scoreInterpretation = 'Fair - Consider some improvements';
    else scoreInterpretation = 'Needs attention - Consider professional support';
    
    doc.text(scoreInterpretation, 20, 75);
    
    // Statistics table
    const statsData = [
      ['Metric', 'Value'],
      ['Total Journal Entries', analyticsData.journal.length],
      ['Total Tasks', analyticsData.tasks.length],
      ['Completed Tasks', analyticsData.tasks.filter(t => t.status === 'done').length],
      ['Emotion Records', analyticsData.emotions.length],
      ['Wellness Activities', analyticsData.wellness.length]
    ];
    
    doc.autoTable({
      startY: 90,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'grid'
    });
    
    // Recommendations
    if (recommendations.length > 0) {
      doc.setFontSize(16);
      doc.text('Recommendations', 20, doc.lastAutoTable.finalY + 20);
      
      recommendations.forEach((rec, index) => {
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${rec.title}`, 20, doc.lastAutoTable.finalY + 35 + (index * 15));
        doc.text(rec.description, 20, doc.lastAutoTable.finalY + 40 + (index * 15));
      });
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('This report is generated by NeuroCompanion for personal use only.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    
    doc.save(`neurocompanion-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const moodData = getMoodDistributionData();
  const weeklyData = getWeeklyTrendData();
  const taskData = getTaskCompletionData();

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3" style={{ color: 'var(--theme-text)' }}>
                <BarChart3 className="h-8 w-8" style={{ color: 'var(--theme-primary)' }} />
                <span>Analytics & Insights</span>
              </h1>
              <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
                Comprehensive wellness analysis across all modules
              </p>
            </div>
            <button
              onClick={downloadPDFReport}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Download className="h-5 w-5" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Overall Wellness Score</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>{overallScore}%</p>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Needs Attention'}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Journal Entries</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{analyticsData.journal.length}</p>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Total entries</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Task Completion</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                    {analyticsData.tasks.length > 0 ? 
                      Math.round((analyticsData.tasks.filter(t => t.status === 'done').length / analyticsData.tasks.length) * 100) : 0}%
                  </p>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Completion rate</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution - Fixed Pie Chart */}
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Brain className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Emotion Distribution</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Trend */}
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Weekly Mood Trend</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="var(--theme-primary)" 
                      fill="var(--theme-primary)" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion */}
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Target className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Task Completion (Last 7 Days)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="var(--theme-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Overview */}
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <Activity className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Activity Overview</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span style={{ color: 'var(--theme-text)' }}>Journal Entries</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--theme-text)' }}>{analyticsData.journal.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span style={{ color: 'var(--theme-text)' }}>Completed Tasks</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--theme-text)' }}>
                    {analyticsData.tasks.filter(t => t.status === 'done').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span style={{ color: 'var(--theme-text)' }}>Emotion Records</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--theme-text)' }}>{analyticsData.emotions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span style={{ color: 'var(--theme-text)' }}>Wellness Activities</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--theme-text)' }}>{analyticsData.wellness.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                <AlertTriangle className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <span>Recommendations</span>
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const IconComponent = rec.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                      <IconComponent className={`h-5 w-5 mt-1 ${
                        rec.type === 'urgent' ? 'text-red-500' : 
                        rec.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--theme-text)' }}>{rec.title}</h4>
                        <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>{rec.description}</p>
                        <p className="text-sm font-medium mt-1" style={{ color: 'var(--theme-primary)' }}>{rec.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;