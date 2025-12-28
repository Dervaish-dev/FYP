import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Phone, PhoneOff, Loader, CheckCircle, XCircle } from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { journalAPI } from '../utils/api';

const VoiceJournalButton = ({ userId, onCallComplete }) => {
  const [callState, setCallState] = useState('idle'); // idle, connecting, active, saving, success, error
  const [callData, setCallData] = useState(null);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  
  const retellClientRef = useRef(null);
  const callTimerRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
      if (retellClientRef.current) {
        try {
          retellClientRef.current.stopCall();
        } catch (e) {
          console.error('Error stopping call:', e);
        }
      }
    };
  }, []);

  const startVoiceCall = async () => {
    setCallState('connecting');
    setError(null);
    setCallDuration(0);

    try {
      // Get access token and call ID from backend
      const response = await journalAPI.startVoiceCall(userId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to start voice call');
      }

      const { callId, accessToken } = response.data;
      console.log('🎙️  Call initiated:', { callId });
      
      setCallData({ callId, accessToken });

      // Initialize Retell Web Client
      const retellClient = new RetellWebClient();
      retellClientRef.current = retellClient;

      // Set up event listeners
      retellClient.on('call_started', () => {
        console.log('📞 Call started');
        setCallState('active');
        
        // Start duration timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      });

      retellClient.on('call_ended', () => {
        console.log('📞 Call ended');
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        handleCallEnd(callId);
      });

      retellClient.on('error', (error) => {
        console.error('❌ Retell error:', error);
        setCallState('error');
        setError(error.message || 'Call error occurred');
        if (callTimerRef.current) clearInterval(callTimerRef.current);
      });

      // Start the call
      await retellClient.startCall({
        accessToken: accessToken,
        sampleRate: 24000,
        captureDeviceId: 'default'
      });

    } catch (err) {
      console.error('❌ Failed to start voice call:', err);
      setCallState('error');
      setError(err.message || 'Failed to start call');
    }
  };

  const handleCallEnd = async (callId) => {
    setCallState('saving');
    console.log('📞 Call ended, checking status for:', callId);
    
    try {
      // Give backend a moment to start processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Poll status endpoint to check if transcript has been processed
      let attempts = 0;
      const maxAttempts = 45; // 45 seconds max (increased for webhook processing)

      statusCheckIntervalRef.current = setInterval(async () => {
        attempts++;
        console.log(`🔍 Checking status (attempt ${attempts}/${maxAttempts})...`);
        
        try {
          const statusResponse = await journalAPI.getVoiceCallStatus(callId);
          console.log('📥 Status response received:', JSON.stringify(statusResponse));
          
          if (statusResponse.success && statusResponse.status === 'completed') {
            console.log('✅ Journal entry completed!', statusResponse.entryId);
            console.log('🎉 Setting call state to SUCCESS');
            clearInterval(statusCheckIntervalRef.current);
            setCallState('success');
            
            // Show success message for 3 seconds then reset
            setTimeout(() => {
              setCallState('idle');
              setCallData(null);
              setCallDuration(0);
              
              // Notify parent to refresh journal entries
              if (onCallComplete) {
                onCallComplete();
              }
            }, 3000);
          } else if (attempts >= maxAttempts) {
            console.warn('⏱️ Timeout waiting for transcript');
            clearInterval(statusCheckIntervalRef.current);
            throw new Error('Processing is taking longer than expected. Your entry may still be saved - please check your journal in a moment.');
          } else if (attempts % 10 === 0) {
            console.log(`⏳ Still waiting... (${attempts}s elapsed)`);
          }
        } catch (err) {
          console.error('❌ Status check error:', err);
          clearInterval(statusCheckIntervalRef.current);
          throw err;
        }
      }, 1000);

    } catch (err) {
      console.error('❌ Failed to save voice entry:', err);
      setCallState('error');
      setError(err.message || 'Failed to save voice journal entry');
      
      setTimeout(() => {
        setCallState('idle');
        setError(null);
        setCallData(null);
        setCallDuration(0);
      }, 6000);
    }
  };

  const stopCall = () => {
    if (retellClientRef.current) {
      try {
        retellClientRef.current.stopCall();
      } catch (e) {
        console.error('Error stopping call:', e);
      }
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallState('idle');
    setCallData(null);
    setCallDuration(0);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-journal-button">
      <AnimatePresence mode="wait">
        {callState === 'idle' && (
          <motion.button
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startVoiceCall}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'white',
            }}
          >
            <Mic className="h-5 w-5" />
            <span>Voice Journal</span>
          </motion.button>
        )}

        {callState === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{
              backgroundColor: 'var(--theme-card)',
              border: '2px solid var(--theme-primary)',
              color: 'var(--theme-text)',
            }}
          >
            <Loader className="h-5 w-5 animate-spin" style={{ color: 'var(--theme-primary)' }} />
            <span>Starting Call...</span>
          </motion.div>
        )}

        {callState === 'active' && (
          <motion.div
            key="active"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{
              backgroundColor: 'var(--theme-card)',
              border: '2px solid var(--theme-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#ef4444' }}
              />
              <span style={{ color: 'var(--theme-text)' }}>
                {formatDuration(callDuration)}
              </span>
            </div>
            <button
              onClick={stopCall}
              className="ml-2 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <PhoneOff className="h-5 w-5 text-red-500" />
            </button>
          </motion.div>
        )}

        {callState === 'saving' && (
          <motion.div
            key="saving"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{
              backgroundColor: 'var(--theme-card)',
              border: '2px solid var(--theme-primary)',
              color: 'var(--theme-text)',
            }}
          >
            <Loader className="h-5 w-5 animate-spin" style={{ color: 'var(--theme-primary)' }} />
            <span>Saving Entry...</span>
          </motion.div>
        )}

        {callState === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
            }}
          >
            <CheckCircle className="h-5 w-5" />
            <span>Voice Entry Saved!</span>
          </motion.div>
        )}

        {callState === 'error' && (
          <motion.div
            key="error"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
            }}
          >
            <XCircle className="h-5 w-5" />
            <span>Call Failed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && callState === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <p className="text-sm text-red-500">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceJournalButton;
