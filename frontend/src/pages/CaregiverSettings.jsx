import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, LogOut, Shield } from 'lucide-react';
import { caregiverApi } from '../utils/caregiverApi';
import CaregiverLayout from '../components/CaregiverLayout';

const CaregiverSettings = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    organization: '',
    phone: '',
    licenseNumber: '',
    twoFactorEnabled: false,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await caregiverApi('/api/caregiver/me');
        if (cancelled) return;

        const caregiver = data?.caregiver;
        setProfile({
          name: caregiver?.name || '',
          email: caregiver?.email || '',
          specialization: caregiver?.specialization || '',
          organization: caregiver?.organization || '',
          phone: caregiver?.phone || '',
          licenseNumber: caregiver?.licenseNumber || '',
          twoFactorEnabled: caregiver?.twoFactorEnabled || false,
        });
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const inputStyle = {
    backgroundColor: 'var(--theme-background)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-color)',
    outline: 'none',
  };

  const handleLogout = () => {
    localStorage.removeItem('caregiverToken');
    localStorage.removeItem('caregiverInfo');
    navigate('/caregiver/login');
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');

      const payload = {
        name: profile.name,
        specialization: profile.specialization,
        organization: profile.organization,
        phone: profile.phone,
        licenseNumber: profile.licenseNumber,
      };

      const data = await caregiverApi('/api/caregiver/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSuccess(data?.message || 'Profile updated');
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggle2FA = async () => {
    try {
      setError('');
      setSuccess('');
      const data = await caregiverApi('/api/caregiver/toggle-2fa', {
        method: 'POST'
      });
      
      if (data.success) {
        setProfile(prev => ({ ...prev, twoFactorEnabled: data.twoFactorEnabled }));
        setSuccess(`Two-factor authentication ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (e) {
      console.error('Toggle 2FA error:', e);
      setError(e.message || 'Failed to toggle 2FA');
    }
  };

  return (
    <CaregiverLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
          Caregiver Settings
        </h1>
        <p className="opacity-70 mb-6" style={{ color: 'var(--text-color)' }}>
          Update your profile and security preferences.
        </p>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border"
            style={{
              backgroundColor: error ? 'rgba(var(--primary-rgb), 0.10)' : 'rgba(var(--primary-rgb), 0.08)',
              borderColor: 'var(--primary-500)',
              color: 'var(--text-color)'
            }}
          >
            {error || success}
          </motion.div>
        )}

        {loading ? (
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            <form
              onSubmit={saveProfile}
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>Profile</h2>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--primary-500)' }}
                >
                  <Save className="h-4 w-4" />
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Full Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border opacity-70"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Specialization</label>
                  <input
                    value={profile.specialization}
                    onChange={(e) => setProfile((p) => ({ ...p, specialization: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                    placeholder="Therapist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Organization</label>
                  <input
                    value={profile.organization}
                    onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                    placeholder="Clinic / Hospital"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Phone</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                    placeholder="+1 555 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>License Number</label>
                  <input
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile((p) => ({ ...p, licenseNumber: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </form>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>Security</h2>
              </div>

              <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--theme-background)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--text-color)' }}>Two-Factor Authentication</h3>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggle2FA}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      profile.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl shadow-sm border p-6 mt-6"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-green-50 mr-4">
              <Shield size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>Privacy & Compliance</h3>
          </div>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
            <p>
              <strong>HIPAA Compliance:</strong> This system maintains full audit trails required for HIPAA compliance. Never share patient data outside this system.
            </p>
            <p>
              <strong>Data Security:</strong> Patient information is encrypted and access is logged with IP addresses and timestamps for security.
            </p>
          </div>
        </motion.div>
      </div>
    </CaregiverLayout>
  );
};

export default CaregiverSettings;
