import express from 'express';
import {
  handleCallCompleted,
  processPendingCalls,
  getVoiceJournalHistory,
  processLatestCall
} from '../controllers/voiceJournalController.js';

const router = express.Router();

// Webhook endpoint - called by Retell AI when call ends
router.post('/webhook/call-completed', handleCallCompleted);

// 📱 MOBILE APP ENDPOINT - Process latest call when user ends call
router.post('/process-latest', processLatestCall);

// Manual processing endpoint - process any unprocessed calls
router.get('/process-pending', processPendingCalls);

// Get voice journal history for a user
router.get('/history', getVoiceJournalHistory);

export default router;
