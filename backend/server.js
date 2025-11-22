import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emotionRoutes from './routes/emotionRoutes.js';
import emotionHistoryRoutes from './routes/emotionHistoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`🚀 NeuroCompanion API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
