import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Emotions from './pages/Emotions';
import Tasks from './pages/Tasks';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import VoiceAssistant from './pages/VoiceAssistant';
import CaregiverPortal from './pages/CaregiverPortal';
import Settings from './pages/Settings';
import Wellness from './pages/Wellness';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationCenter from './components/NotificationCenter';
import EmojiMascot from './components/EmojiMascot';
import WellnessNotificationCenter from './components/WellnessNotificationCenter';

// Main App Routes
const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

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
        <Route
          path="/caregiver"
          element={
            <ProtectedRoute>
              <Layout>
                <CaregiverPortal />
              </Layout>
            </ProtectedRoute>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Components */}
      <NotificationCenter />
      <EmojiMascot />
      <WellnessNotificationCenter />
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
