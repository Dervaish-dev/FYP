import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, BookOpen, CheckSquare, Activity, TrendingUp,
  TrendingDown, Minus, Calendar, Clock, Brain, AlertCircle, Mail
} from 'lucide-react';
import CaregiverLayout from '../components/CaregiverLayout';
import { Line, Bar, Pie } from 'recharts';
import {
  LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      if (!response.ok) throw new Error('Failed to fetch patient details');

      const data = await response.json();
      setPatient(data.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                   style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }} />
              <p style={{ color: 'var(--theme-text)' }}>Loading patient details...</p>
            </div>
          </div>
        </div>
      </CaregiverLayout>
    );
  }

  if (error || !patient) {
    return (
      <CaregiverLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
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
        </div>
      </CaregiverLayout>
    );
  }

  return (
    <CaregiverLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/caregiver/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg mb-6 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--theme-text)' }} />
          <span style={{ color: 'var(--theme-text)' }}>Back to Patients</span>
        </button>

        {/* Patient Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 mb-6"
          style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--theme-primary)' }}>
                <span className="text-2xl font-bold text-white">
                  {patient.name?.charAt(0) || 'P'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  {patient.name}
                </h1>
                <p className="opacity-70" style={{ color: 'var(--theme-text)' }}>
                  {patient.email}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Last active: {new Date(patient.lastActive).toLocaleDateString()}
                  </span>
                  <span className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Joined: {new Date(patient.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTrendColor(patient.moodTrend)}`}>
                {getTrendIcon(patient.moodTrend)}
                <span className="text-sm font-medium capitalize">{patient.moodTrend}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Wellness Score</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{patient.wellnessScore}/100</p>
              </div>
              <Brain className="w-8 h-8 opacity-50" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Tasks</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  {patient.tasksCompleted}/{patient.totalTasks}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 opacity-50" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Journal Entries</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{patient.journalCount}</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-50" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Activity Level</p>
                <p className="text-2xl font-bold capitalize" style={{ color: 'var(--theme-text)' }}>
                  {patient.activityLevel}
                </p>
              </div>
              <Activity className="w-8 h-8 opacity-50" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </motion.div>
        </div>

        {/* Recent Emotions */}
        {patient.recentEmotions && patient.recentEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border p-6 mb-6"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
              <Heart className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              Recent Emotions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {patient.recentEmotions.map((emotion, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 text-center"
                  style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--theme-border)' }}
                >
                  <span className="text-2xl mb-1 block">{emotion.emoji || '😊'}</span>
                  <p className="text-sm font-medium capitalize" style={{ color: 'var(--theme-text)' }}>
                    {emotion.emotion}
                  </p>
                  <p className="text-xs opacity-50" style={{ color: 'var(--theme-text)' }}>
                    {new Date(emotion.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Recommendations */}
        {patient.aiRecommendations && patient.aiRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {patient.aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 flex items-start gap-3"
                  style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--theme-border)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.2 }}>
                    <span style={{ color: 'var(--theme-primary)' }}>•</span>
                  </div>
                  <p style={{ color: 'var(--theme-text)' }}>{rec}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </CaregiverLayout>
  );
};

export default PatientDetail;
