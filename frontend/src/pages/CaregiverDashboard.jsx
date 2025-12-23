import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Heart, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Brain, RefreshCw, Minus, UserPlus,
  ChevronUp, ChevronDown, BarChart3
} from 'lucide-react';
import CaregiverLayout from '../components/CaregiverLayout';

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invites state
  const [invites, setInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState('');
  const [invitesExpanded, setInvitesExpanded] = useState(true);
  const [inviteCodeById, setInviteCodeById] = useState({});
  const [inviteCodeLoadingById, setInviteCodeLoadingById] = useState({});
  const [inviteCodeErrorById, setInviteCodeErrorById] = useState({});

  // Add patient (invite) modal state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    patientName: '',
    patientEmail: '',
    age: '',
    neurotype: ''
  });
  const [inviteCreateLoading, setInviteCreateLoading] = useState(false);
  const [inviteCreateError, setInviteCreateError] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  
  // Patient details state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedPatient, setExpandedPatient] = useState(null);

  useEffect(() => {
    // Check if caregiver is logged in
    const token = localStorage.getItem('caregiverToken');
    const caregiverInfo = localStorage.getItem('caregiverInfo');
    
    if (!token || !caregiverInfo) {
      navigate('/caregiver/login');
      return;
    }

    fetchPatients();
    fetchInvites();
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

      // Map emotion names to emojis (all 10 supported emotions)
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

      // Ensure recentEmotions have emoji field
      const patientsWithEmoji = (data.patients || []).map(patient => ({
        ...patient,
        recentEmotions: (patient.recentEmotions || []).map(emotion => ({
          ...emotion,
          emoji: emotion.emoji || emotionEmojiMap[emotion.emotion?.toLowerCase()] || '😊'
        }))
      }));

      setPatients(patientsWithEmoji);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      setInvitesLoading(true);
      setInvitesError('');
      const token = localStorage.getItem('caregiverToken');

      const res = await fetch('/api/invites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch invites');
      }

      setInvites(data.invites || []);
    } catch (err) {
      console.error('Error fetching invites:', err);
      setInvitesError(err.message || 'Failed to load invites');
    } finally {
      setInvitesLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem('caregiverToken');
      const response = await fetch(`/api/caregiver/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patient details');
      }

      setSelectedPatient(data);
      setExpandedPatient(patientId);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      alert('Failed to load patient details');
    }
  };

  const handleCreateInvite = async (e) => {
    e?.preventDefault?.();
    const token = localStorage.getItem('caregiverToken');

    const patientName = String(inviteForm.patientName || '').trim();
    const patientEmail = String(inviteForm.patientEmail || '').trim().toLowerCase();
    const age = inviteForm.age === '' ? null : Number(inviteForm.age);
    const neurotype = String(inviteForm.neurotype || '').trim();

    if (!patientName || !patientEmail) {
      setInviteCreateError('Patient name and email are required');
      return;
    }

    try {
      setInviteCreateLoading(true);
      setInviteCreateError('');

      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName,
          patientEmail,
          age: Number.isFinite(age) ? age : null,
          neurotype: neurotype || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create invite');
      }

      setCreatedInvite(data.invite);
      await fetchInvites();
    } catch (err) {
      console.error('Create invite error:', err);
      setInviteCreateError(err.message || 'Failed to create invite');
    } finally {
      setInviteCreateLoading(false);
    }
  };

  const handleRegenerateInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem('caregiverToken');
      const res = await fetch(`/api/invites/${inviteId}/regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to regenerate invite');
      alert(`New invite code: ${data.invite?.code}`);
      setInviteCodeById((prev) => ({ ...prev, [inviteId]: data.invite?.code || '' }));
      setInviteCodeErrorById((prev) => ({ ...prev, [inviteId]: '' }));
      await fetchInvites();
    } catch (err) {
      alert(err.message || 'Failed to regenerate invite');
    }
  };

  const handleToggleInviteCode = async (inviteId) => {
    const existing = inviteCodeById[inviteId];
    const isCurrentlyVisible = existing !== undefined;

    if (isCurrentlyVisible) {
      setInviteCodeById((prev) => {
        const next = { ...prev };
        delete next[inviteId];
        return next;
      });
      setInviteCodeErrorById((prev) => ({ ...prev, [inviteId]: '' }));
      return;
    }

    try {
      setInviteCodeLoadingById((prev) => ({ ...prev, [inviteId]: true }));
      setInviteCodeErrorById((prev) => ({ ...prev, [inviteId]: '' }));
      const token = localStorage.getItem('caregiverToken');

      const res = await fetch(`/api/invites/${inviteId}/code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch invite code');

      setInviteCodeById((prev) => ({ ...prev, [inviteId]: data.invite?.code || '' }));
    } catch (err) {
      setInviteCodeErrorById((prev) => ({ ...prev, [inviteId]: err.message || 'Failed to fetch invite code' }));
    } finally {
      setInviteCodeLoadingById((prev) => ({ ...prev, [inviteId]: false }));
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem('caregiverToken');
      const res = await fetch(`/api/invites/${inviteId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to revoke invite');
      await fetchInvites();
    } catch (err) {
      alert(err.message || 'Failed to revoke invite');
    }
  };

  const getMoodTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return { color: 'var(--primary-600)' };
      case 'declining':
        return { color: 'var(--secondary-600)' };
      default:
        return { color: 'var(--text-color)', opacity: 0.8 };
    }
  };

  const getMoodTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary-600)' }} />;
      case 'declining':
        return <TrendingDown className="h-5 w-5" style={{ color: 'var(--secondary-600)' }} />;
      default:
        return <Activity className="h-5 w-5" style={{ color: 'var(--text-color)', opacity: 0.8 }} />;
    }
  };

  const getActivityLevelColor = (level) => {
    switch (level) {
      case 'active':
        return { backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' };
      case 'moderate':
        return { backgroundColor: 'var(--secondary-100)', color: 'var(--secondary-600)' };
      case 'low':
        return { backgroundColor: 'var(--theme-background)', color: 'var(--text-color)', opacity: 0.85 };
      default:
        return { backgroundColor: 'var(--theme-background)', color: 'var(--text-color)', opacity: 0.8 };
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl shadow-xl border"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Add Patient</h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Create an invite code for your patient to complete signup.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddPatientModal(false);
                  setInviteForm({ patientName: '', patientEmail: '', age: '', neurotype: '' });
                  setInviteCreateError('');
                  setCreatedInvite(null);
                }}
                className="px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!createdInvite ? (
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Patient Name</label>
                      <input
                        value={inviteForm.patientName}
                        onChange={(e) => setInviteForm((p) => ({ ...p, patientName: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)', outline: 'none' }}
                        placeholder="Patient name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Age (optional)</label>
                      <input
                        type="number"
                        value={inviteForm.age}
                        onChange={(e) => setInviteForm((p) => ({ ...p, age: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)', outline: 'none' }}
                        placeholder=""
                        min="13"
                        max="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Patient Email</label>
                    <input
                      type="email"
                      value={inviteForm.patientEmail}
                      onChange={(e) => setInviteForm((p) => ({ ...p, patientEmail: e.target.value }))}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)', outline: 'none' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Neurotype (optional)</label>
                    <select
                      value={inviteForm.neurotype}
                      onChange={(e) => setInviteForm((p) => ({ ...p, neurotype: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)', outline: 'none' }}
                    >
                      <option value="">Select…</option>
                      <option value="ADHD">ADHD</option>
                      <option value="Autism">Autism</option>
                      <option value="Anxiety">Anxiety</option>
                      <option value="Dyslexia">Dyslexia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {inviteCreateError && (
                    <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--primary-500)' }} />
                        <p className="text-sm">{inviteCreateError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary-500)' }}
                    disabled={inviteCreateLoading}
                  >
                    {inviteCreateLoading ? 'Creating…' : 'Create Invite Code'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Invite created for</p>
                    <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{createdInvite.patientDetails?.name}</p>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>{createdInvite.patientEmail || createdInvite.maskedEmail}</p>
                    <div className="mt-4">
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Invite code</p>
                      <div className="mt-1 flex items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                        <p className="font-mono text-lg" style={{ color: 'var(--text-color)' }}>{createdInvite.code}</p>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(createdInvite.code);
                              alert('Copied');
                            } catch {
                              alert('Copy failed');
                            }
                          }}
                          className="px-3 py-2 rounded-lg border"
                          style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--text-color)' }}>
                        Patient uses this code at /join, then verifies email with OTP.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowAddPatientModal(false);
                      setInviteForm({ patientName: '', patientEmail: '', age: '', neurotype: '' });
                      setInviteCreateError('');
                      setCreatedInvite(null);
                    }}
                    className="w-full px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: 'var(--primary-500)' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Patient Dashboard</h1>
        <p className="mt-2 opacity-70" style={{ color: 'var(--text-color)' }}>Monitor progress and provide support to your patients</p>
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
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
              <Users className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-70" style={{ color: 'var(--text-color)' }}>Avg Wellness</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{calculateAverageWellness()}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
              <Heart className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
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
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
              <CheckCircle className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
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
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
              <BarChart3 className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Patient Button */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ backgroundColor: 'var(--primary-500)' }}
        >
          <UserPlus className="h-5 w-5" />
          <span>Add Patient</span>
        </button>
      </motion.div>

      {/* Invites Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInvitesExpanded((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
              >
                {invitesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="font-semibold">Patient Invites</span>
                <span className="text-sm opacity-70">({invites.length})</span>
              </button>

              <button
                onClick={fetchInvites}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border hover:shadow-md transition-all"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{invitesLoading ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {invitesExpanded && (
            <>
              {invitesError && (
                <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                  {invitesError}
                </div>
              )}

              {invites.length === 0 ? (
                <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>No invites yet.</p>
              ) : (
                <div className="space-y-3">
                  {invites.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{inv.patientDetails?.name || 'Patient'}</p>
                          <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>{inv.patientEmail || inv.maskedEmail}</p>
                          <p className="text-xs opacity-70 mt-1" style={{ color: 'var(--text-color)' }}>
                            Status: {inv.status} • Expires: {formatDate(inv.expiresAt)}
                          </p>

                          {inviteCodeErrorById[inv.id] && (
                            <p className="text-xs mt-2" style={{ color: 'var(--text-color)', opacity: 0.85 }}>
                              {inviteCodeErrorById[inv.id]}
                            </p>
                          )}

                          {inviteCodeById[inv.id] !== undefined && (
                            <div className="mt-2 flex items-center justify-between gap-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                              <p className="font-mono" style={{ color: 'var(--text-color)' }}>{inviteCodeById[inv.id]}</p>
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(inviteCodeById[inv.id] || '');
                                    alert('Invite code copied');
                                  } catch {
                                    alert('Could not copy invite code');
                                  }
                                }}
                                className="px-3 py-1 rounded-lg border text-sm"
                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                              >
                                Copy
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(inv.status === 'PENDING' || inv.status === 'EXPIRED') && (
                            <button
                              onClick={() => handleToggleInviteCode(inv.id)}
                              className="px-3 py-2 rounded-lg border text-sm"
                              style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                              disabled={inviteCodeLoadingById[inv.id]}
                            >
                              {inviteCodeLoadingById[inv.id]
                                ? 'Loading…'
                                : inviteCodeById[inv.id] !== undefined
                                  ? 'Hide Code'
                                  : 'View Code'}
                            </button>
                          )}

                          {(inv.status === 'PENDING' || inv.status === 'EXPIRED') && (
                            <button
                              onClick={() => handleRegenerateInvite(inv.id)}
                              className="px-3 py-2 rounded-lg text-white text-sm"
                              style={{ backgroundColor: 'var(--primary-500)' }}
                            >
                              Regenerate
                            </button>
                          )}

                          {inv.status === 'PENDING' && (
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="px-3 py-2 rounded-lg border text-sm"
                              style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Patient List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            Patients ({patients.length})
          </h2>
          <button
            onClick={fetchPatients}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border hover:shadow-md transition-all"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-color)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-color)' }}>No patients yet</p>
            <p className="opacity-70" style={{ color: 'var(--text-color)' }}>Create an invite code so patients can complete signup</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {patients.map((patient) => (
              <motion.div
                key={patient.id}
                className="rounded-xl shadow-lg overflow-hidden cursor-pointer"
                style={{ backgroundColor: 'var(--card-bg)', borderLeft: '4px solid var(--primary-500)' }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/caregiver/patient/${patient.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: 'var(--primary-500)' }}>
                        {patient.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{patient.name}</h3>
                        <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>{patient.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6" style={{ color: 'var(--primary-500)' }} />
                  </div>

                  {/* Patient Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs opacity-70 mb-1" style={{ color: 'var(--text-color)' }}>Wellness Score</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--primary-500)' }}>{patient.wellnessScore || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1" style={{ color: 'var(--text-color)' }}>Mood Trend</p>
                      <div className="flex items-center space-x-1">
                        {patient.moodTrend === 'improving' ? (
                          <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary-600)' }} />
                        ) : patient.moodTrend === 'declining' ? (
                          <TrendingDown className="h-5 w-5" style={{ color: 'var(--secondary-600)' }} />
                        ) : (
                          <Minus className="h-5 w-5" style={{ color: 'var(--text-color)', opacity: 0.6 }} />
                        )}
                        <span className="text-sm font-medium capitalize">{patient.moodTrend || 'stable'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1" style={{ color: 'var(--text-color)' }}>Tasks</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                        {patient.totalTasks > 0 ? Math.round((patient.tasksCompleted / patient.totalTasks) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1" style={{ color: 'var(--text-color)' }}>Entries</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                        {patient.journalCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1" style={{ color: 'var(--text-color)' }}>Last Active</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                        {patient.lastActive ? formatDate(patient.lastActive) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Recent Emotions - 7 emoji grid */}
                  {patient.recentEmotions && patient.recentEmotions.length > 0 && (
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs font-semibold mb-2 opacity-70" style={{ color: 'var(--text-color)' }}>RECENT EMOTIONS</p>
                      <div className="flex items-center gap-2">
                        {patient.recentEmotions.slice(0, 7).map((emotion, idx) => (
                          <div
                            key={idx}
                            className="flex-1 aspect-square rounded-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                            style={{ backgroundColor: 'var(--theme-background)' }}
                            title={`${emotion.emotion} (${emotion.intensity}/10)`}
                          >
                            {emotion.emoji || '😊'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </CaregiverLayout>
  );
};

export default CaregiverDashboard;
