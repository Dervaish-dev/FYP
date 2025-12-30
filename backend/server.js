import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emotionRoutes from './routes/emotionRoutes.js';
import emotionHistoryRoutes from './routes/emotionHistoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';
import caregiverRoutes from './routes/caregiverRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
// import voiceRoutes from './routes/voiceRoutes.js'; // Removed - replaced with breathing exercises
import voiceJournalRoutes from './routes/voiceJournalRoutes.js';
import { initCronJobs } from './services/cronService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5005;

// Connect to MongoDB (optional - server will continue without it)
connectDB().catch(() => {
  console.log('⚠️  Continuing without database connection');
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5556',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/emotions', emotionHistoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/invites', inviteRoutes);
// app.use('/api/voice', voiceRoutes); // Removed - replaced with breathing exercises
app.use('/api/voice-journal', voiceJournalRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NeuroCompanion API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export { app };

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  app.listen(PORT, () => {
    console.log(`🚀 NeuroCompanion API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    
    // Initialize scheduled tasks
    initCronJobs();
  });
}
