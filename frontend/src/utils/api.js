import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log all API requests
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[${timestamp}] ${config.method.toUpperCase()} ${config.url}`,
      'color: #4CAF50; font-weight: bold');

    if (config.data) {
      console.log('%cRequest Data:', 'color: #2196F3; font-weight: bold', config.data);
    }

    if (config.params) {
      console.log('%cRequest Params:', 'color: #2196F3; font-weight: bold', config.params);
    }

    return config;
  },
  (error) => {
    console.error('%cRequest Error:', 'color: #f44336; font-weight: bold', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[${timestamp}] ✓ ${response.config.method.toUpperCase()} ${response.config.url}`,
      'color: #4CAF50; font-weight: bold');
    console.log('%cResponse Status:', 'color: #2196F3; font-weight: bold', response.status);
    console.log('%cResponse Data:', 'color: #2196F3; font-weight: bold', response.data);

    return response;
  },
  (error) => {
    // Log error responses
    const timestamp = new Date().toLocaleTimeString();
    console.error(`%c[${timestamp}] ✗ ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url || 'Unknown'}`,
      'color: #f44336; font-weight: bold');
    console.error('%cError Status:', 'color: #f44336; font-weight: bold', error.response?.status);
    console.error('%cError Data:', 'color: #f44336; font-weight: bold', error.response?.data);

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('%c⚠ Unauthorized - Redirecting to login', 'color: #FF9800; font-weight: bold');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    console.log('%c🔐 REGISTER REQUEST', 'color: #9C27B0; font-weight: bold; font-size: 14px');
    try {
      const response = await api.post('/auth/signup', userData);
      console.log('%c✓ REGISTER SUCCESS', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return response.data;
    } catch (error) {
      console.error('%c✗ REGISTER FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', error.response?.data);
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    console.log('%c🔐 LOGIN REQUEST', 'color: #9C27B0; font-weight: bold; font-size: 14px');
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('%c✓ LOGIN SUCCESS', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return response.data;
    } catch (error) {
      console.error('%c✗ LOGIN FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', error.response?.data);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    console.log('%c👤 GET CURRENT USER', 'color: #2196F3; font-weight: bold; font-size: 14px');
    try {
      const response = await api.get('/auth/me');
      console.log('%c✓ USER DATA RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return response.data;
    } catch (error) {
      console.error('%c✗ GET USER FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', error.response?.data);
      throw error.response?.data || { message: 'Failed to get user data' };
    }
  },

  // Logout user
  logout: async () => {
    console.log('%c🚪 LOGOUT REQUEST', 'color: #FF9800; font-weight: bold; font-size: 14px');
    try {
      const response = await api.post('/auth/logout');
      console.log('%c✓ LOGOUT SUCCESS', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return response.data;
    } catch (error) {
      console.error('%c✗ LOGOUT FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', error.response?.data);
      throw error.response?.data || { message: 'Logout failed' };
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Health check failed' };
  }
};

export default api;

// ----- Backend-ready wrappers with mock fallbacks -----

export const taskAPI = {
  async create(task) {
    console.log('%c📝 CREATE TASK', 'color: #00BCD4; font-weight: bold; font-size: 14px');
    try {
      const res = await api.post('/tasks/create', task);
      console.log('%c✓ TASK CREATED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ TASK CREATE FAILED - Using Mock', 'color: #FF9800; font-weight: bold; font-size: 14px');
      // Mock fallback
      const mock = { _id: String(Date.now()), status: 'todo', nudgeCount: 0, ...task };
      return mock;
    }
  },
  async update(id, update) {
    console.log('%c✏️ UPDATE TASK', 'color: #00BCD4; font-weight: bold; font-size: 14px', id);
    try {
      const res = await api.put(`/tasks/${id}`, update);
      console.log('%c✓ TASK UPDATED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ TASK UPDATE FAILED - Using Mock', 'color: #FF9800; font-weight: bold; font-size: 14px');
      return { _id: id, ...update };
    }
  },
  async listByUser(userId) {
    console.log('%c📋 LIST TASKS', 'color: #00BCD4; font-weight: bold; font-size: 14px', userId);
    try {
      const res = await api.get(`/tasks/${userId}`);
      console.log('%c✓ TASKS RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data.tasks;
    } catch (e) {
      console.warn('%c⚠ TASK LIST FAILED - Using Empty Array', 'color: #FF9800; font-weight: bold; font-size: 14px');
      return [];
    }
  },
  async delete(id) {
    console.log('%c🗑️ DELETE TASK', 'color: #00BCD4; font-weight: bold; font-size: 14px', id);
    try {
      await api.delete(`/tasks/${id}`);
      console.log('%c✓ TASK DELETED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return true;
    } catch (e) {
      console.warn('%c⚠ TASK DELETE FAILED', 'color: #FF9800; font-weight: bold; font-size: 14px');
      throw e;
    }
  },
  async nudge(id) {
    console.log('%c🔔 NUDGE TASK', 'color: #00BCD4; font-weight: bold; font-size: 14px', id);
    try {
      const res = await api.put(`/tasks/${id}/nudge`);
      console.log('%c✓ TASK NUDGED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ TASK NUDGE FAILED', 'color: #FF9800; font-weight: bold; font-size: 14px');
      throw e;
    }
  }
};

export const preferencesAPI = {
  async fetch(userId) {
    console.log('%c⚙️ FETCH PREFERENCES', 'color: #673AB7; font-weight: bold; font-size: 14px', userId);
    try {
      const res = await api.get(`/preferences/${userId}`);
      console.log('%c✓ PREFERENCES RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ PREFERENCES FETCH FAILED - Using Defaults', 'color: #FF9800; font-weight: bold; font-size: 14px');
      return null;
    }
  },
  async save(userId, prefs) {
    console.log('%c💾 SAVE PREFERENCES', 'color: #673AB7; font-weight: bold; font-size: 14px', userId);
    try {
      // Backend expects userId in body for POST/create or just handled via URL for PUT
      // Based on routes, POST /preferences expects userId in body
      const payload = { userId, ...prefs };
      const res = await api.post('/preferences', payload);
      console.log('%c✓ PREFERENCES SAVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.error('%c✗ PREFERENCES SAVE FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  }
};
// Journal API functions
export const journalAPI = {
  async create(entry) {
    console.log('%c📝 CREATE JOURNAL ENTRY', 'color: #00BCD4; font-weight: bold; font-size: 14px');
    try {
      const res = await api.post('/journal/create', entry);
      console.log('%c✓ JOURNAL ENTRY CREATED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.error('%c✗ JOURNAL CREATE FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  },
  async update(id, updateData) {
    console.log('%c✏️ UPDATE JOURNAL ENTRY', 'color: #00BCD4; font-weight: bold; font-size: 14px', id);
    try {
      const res = await api.put(`/journal/${id}`, updateData);
      console.log('%c✓ JOURNAL ENTRY UPDATED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.error('%c✗ JOURNAL UPDATE FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  },
  async delete(id) {
    console.log('%c🗑️ DELETE JOURNAL ENTRY', 'color: #00BCD4; font-weight: bold; font-size: 14px', id);
    try {
      await api.delete(`/journal/${id}`);
      console.log('%c✓ JOURNAL ENTRY DELETED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return true;
    } catch (e) {
      console.error('%c✗ JOURNAL DELETE FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  },
  async listByUser(userId) {
    console.log('%c📋 LIST JOURNAL ENTRIES', 'color: #00BCD4; font-weight: bold; font-size: 14px', userId);
    try {
      const res = await api.get(`/journal/${userId}`);
      console.log('%c✓ JOURNAL ENTRIES RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data.entries;
    } catch (e) {
      console.error('%c✗ JOURNAL LIST FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  }
};

// Wellness API functions
export const wellnessAPI = {
  async logSleep(data) {
    console.log('%c🌙 LOG SLEEP DATA', 'color: #673AB7; font-weight: bold; font-size: 14px');
    try {
      const res = await api.post('/wellness/sleep', data);
      console.log('%c✓ SLEEP DATA LOGGED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.error('%c✗ SLEEP LOG FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  },
  async getSleepData(userId) {
    console.log('%c📉 GET SLEEP DATA', 'color: #673AB7; font-weight: bold; font-size: 14px', userId);
    try {
      const res = await api.get(`/wellness/sleep/${userId}`);
      console.log('%c✓ SLEEP DATA RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data.entries;
    } catch (e) {
      console.error('%c✗ SLEEP DATA FETCH FAILED', 'color: #f44336; font-weight: bold; font-size: 14px', e);
      throw e;
    }
  }
};
