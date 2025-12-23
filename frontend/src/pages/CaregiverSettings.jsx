import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, KeyRound, LogOut, Shield } from 'lucide-react';
import { caregiverApi } from '../utils/caregiverApi';
import CaregiverLayout from '../components/CaregiverLayout';

const CaregiverSettings = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    organization: '',
    phone: '',
    licenseNumber: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const canSubmitPassword = useMemo(() => {
    return (
      passwordForm.currentPassword.trim().length > 0 &&
      passwordForm.newPassword.trim().length >= 6 &&
      passwordForm.newPassword === passwordForm.confirmNewPassword
    );
  }, [passwordForm]);

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

  const changePassword = async (e) => {
    e.preventDefault();

    if (!canSubmitPassword) {
      setError('Please fill passwords correctly (min 6 chars, must match).');
      return;
    }

    try {
      setSavingPassword(true);
      setError('');
      setSuccess('');

      const data = await caregiverApi('/api/caregiver/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setSuccess(data?.message || 'Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (e) {
      setError(e.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
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

            <form
              onSubmit={changePassword}
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>Security</h2>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--primary-500)' }}
                >
                  <KeyRound className="h-4 w-4" />
                  {savingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                  />
                  <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--text-color)' }}>
                    Minimum 6 characters.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={inputStyle}
                  />
                  {!canSubmitPassword && (passwordForm.confirmNewPassword.length > 0 || passwordForm.newPassword.length > 0) && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                      Passwords must match.
                    </p>
                  )}
                </div>
              </div>
            </form>
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
