import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Emotions from './pages/Emotions';
import Tasks from './pages/Tasks';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import VoiceAssistant from './pages/VoiceAssistant';
import TaskScheduling from './pages/TaskScheduling';
import CaregiverLogin from './pages/CaregiverLogin';
import CaregiverDashboard from './pages/CaregiverDashboard';
import CaregiverPatients from './pages/CaregiverPatients';
import PatientDetail from './pages/PatientDetail';
import CaregiverSettings from './pages/CaregiverSettings';
import Settings from './pages/Settings';
import Wellness from './pages/Wellness';
import BreathingExercises from './pages/BreathingExercises';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CaregiverProtectedRoute from './components/CaregiverProtectedRoute';
import NotificationCenter from './components/NotificationCenter';
import WellnessNotificationCenter from './components/WellnessNotificationCenter';

// Main App Routes
const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/signup" element={<Navigate to="/join" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emotions"
          element={
            <ProtectedRoute>
              <Layout>
                <Emotions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-scheduling"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskScheduling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Layout>
                <Journal />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice"
          element={
            <ProtectedRoute>
              <Layout>
                <VoiceAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/caregiver/login" element={<CaregiverLogin />} />
        <Route
          path="/caregiver/dashboard"
          element={
            <CaregiverProtectedRoute>
              <CaregiverDashboard />
            </CaregiverProtectedRoute>
          }
        />
        <Route
          path="/caregiver/patients"
          element={
            <CaregiverProtectedRoute>
              <CaregiverPatients />
            </CaregiverProtectedRoute>
          }
        />
        <Route
          path="/caregiver/patient/:patientId"
          element={
            <CaregiverProtectedRoute>
              <PatientDetail />
            </CaregiverProtectedRoute>
          }
        />
        <Route
          path="/caregiver/settings"
          element={
            <CaregiverProtectedRoute>
              <CaregiverSettings />
            </CaregiverProtectedRoute>
          }
        />
        <Route
          path="/caregiver"
          element={
            <CaregiverProtectedRoute>
              <CaregiverDashboard />
            </CaregiverProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness"
          element={
            <ProtectedRoute>
              <Layout>
                <Wellness />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/breathing"
          element={
            <ProtectedRoute>
              <Layout>
                <BreathingExercises />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Components */}
      <NotificationCenter />
      <WellnessNotificationCenter />
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
