import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Heart, CheckCircle, BarChart3
} from 'lucide-react';
import CaregiverLayout from '../components/CaregiverLayout';

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if caregiver is logged in
    const token = localStorage.getItem('caregiverToken');
    const caregiverInfo = localStorage.getItem('caregiverInfo');
    
    if (!token || !caregiverInfo) {
      navigate('/caregiver/login');
      return;
    }

    fetchPatients();
  }, [navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('caregiverToken');
      const response = await fetch('/api/caregiver/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patients');
      }

      setPatients(data.patients || []);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageWellness = () => {
    if (patients.length === 0) return 0;
    const total = patients.reduce((sum, p) => sum + (p.stats?.wellness || 0), 0);
    return Math.round(total / patients.length);
  };

  const calculateTotalTasks = () => {
    return patients.reduce((sum, p) => sum + (p.stats?.totalTasks || 0), 0);
  };

  const calculateCompletedTasks = () => {
    return patients.reduce((sum, p) => sum + (p.stats?.completedTasks || 0), 0);
  };

  if (loading) {
    return (
      <CaregiverLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-background)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary-500)' }}></div>
            <p className="text-lg" style={{ color: 'var(--text-color)' }}>Loading dashboard...</p>
          </div>
        </div>
      </CaregiverLayout>
    );
  }

  return (
    <CaregiverLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Caregiver Dashboard</h1>
        <p className="mt-2 opacity-70" style={{ color: 'var(--text-color)' }}>Overview of your patients' progress</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(var(--primary-rgb), 0.10)',
            borderColor: 'var(--primary-500)',
            color: 'var(--text-color)'
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-70" style={{ color: 'var(--text-color)' }}>Total Patients</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{patients.length}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
              <Users className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-70" style={{ color: 'var(--text-color)' }}>Avg Wellness</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{calculateAverageWellness()}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
              <Heart className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-70" style={{ color: 'var(--text-color)' }}>Total Tasks</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{calculateTotalTasks()}</p>
              <p className="text-sm opacity-60" style={{ color: 'var(--text-color)' }}>{calculateCompletedTasks()} completed</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
              <CheckCircle className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-70" style={{ color: 'var(--text-color)' }}>Completion Rate</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                {calculateTotalTasks() > 0 ? Math.round((calculateCompletedTasks() / calculateTotalTasks()) * 100) : 0}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
              <BarChart3 className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Maybe add a "Recent Activity" placeholder or just leave it clean for now */}
      <div className="rounded-2xl p-8 text-center border border-dashed" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}>
        <p className="text-lg font-medium" style={{ color: 'var(--text-color)' }}>Welcome to your dashboard</p>
        <p className="opacity-70 mt-2" style={{ color: 'var(--text-color)' }}>
          Use the navigation bar to manage your patients and view detailed reports.
        </p>
        <button 
          onClick={() => navigate('/caregiver/patients')}
          className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: 'var(--primary-500)' }}
        >
          View Patients
        </button>
      </div>
    </CaregiverLayout>
  );
};

export default CaregiverDashboard;
