import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
import NotificationCenter from './components/NotificationCenter';
import EmojiMascot from './components/EmojiMascot';
import WellnessNotificationCenter from './components/WellnessNotificationCenter';

// Main App Routes
const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        <Route 
          path="/emotions" 
          element={
            <Layout>
              <Emotions />
            </Layout>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <Layout>
              <Tasks />
            </Layout>
          } 
        />
        <Route 
          path="/journal" 
          element={
            <Layout>
              <Journal />
            </Layout>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <Layout>
              <Analytics />
            </Layout>
          } 
        />
        <Route 
          path="/voice" 
          element={
            <Layout>
              <VoiceAssistant />
            </Layout>
          } 
        />
        <Route 
          path="/caregiver" 
          element={
            <Layout>
              <CaregiverPortal />
            </Layout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Layout>
              <Settings />
            </Layout>
          } 
        />
        <Route 
          path="/wellness" 
          element={
            <Layout>
              <Wellness />
            </Layout>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
