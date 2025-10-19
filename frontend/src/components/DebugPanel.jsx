import React, { useState } from 'react';
import { authAPI, healthCheck } from '../utils/api';

const DebugPanel = () => {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    try {
      addLog('Testing backend connection...');
      const response = await healthCheck();
      addLog(`✅ Backend connected: ${response.message}`);
      setStatus('Backend connected successfully');
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error.message}`);
      setStatus('Backend connection failed');
    }
  };

  const testRegistration = async () => {
    try {
      addLog('Testing registration...');
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };
      const response = await authAPI.register(testUser);
      addLog(`✅ Registration successful: ${response.message}`);
      setStatus('Registration test successful');
    } catch (error) {
      addLog(`❌ Registration failed: ${error.message || 'Unknown error'}`);
      setStatus('Registration test failed');
    }
  };

  const testLogin = async () => {
    try {
      addLog('Testing login...');
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const response = await authAPI.login(credentials);
      addLog(`✅ Login successful: ${response.message}`);
      setStatus('Login test successful');
    } catch (error) {
      addLog(`❌ Login failed: ${error.message || 'Unknown error'}`);
      setStatus('Login test failed');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold text-gray-900 mb-2">Debug Panel</h3>
      <div className="space-y-2 mb-4">
        <button 
          onClick={testBackendConnection}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Backend
        </button>
        <button 
          onClick={testRegistration}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Registration
        </button>
        <button 
          onClick={testLogin}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Login
        </button>
      </div>
      <div className="text-sm">
        <p className="font-medium text-gray-700">Status: {status}</p>
        <div className="max-h-32 overflow-y-auto mt-2">
          {logs.map((log, index) => (
            <div key={index} className="text-xs text-gray-600 mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
