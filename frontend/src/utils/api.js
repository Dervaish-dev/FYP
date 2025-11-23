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
  }
};

export const preferencesAPI = {
  async fetch() {
    console.log('%c⚙️ FETCH PREFERENCES', 'color: #673AB7; font-weight: bold; font-size: 14px');
    try {
      const res = await api.get('/preferences');
      console.log('%c✓ PREFERENCES RETRIEVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ PREFERENCES FETCH FAILED - Using LocalStorage', 'color: #FF9800; font-weight: bold; font-size: 14px');
      const raw = localStorage.getItem('neurocompanion-user-preferences');
      return raw ? JSON.parse(raw) : null;
    }
  },
  async save(prefs) {
    console.log('%c💾 SAVE PREFERENCES', 'color: #673AB7; font-weight: bold; font-size: 14px');
    try {
      const res = await api.post('/preferences', prefs);
      console.log('%c✓ PREFERENCES SAVED', 'color: #4CAF50; font-weight: bold; font-size: 14px');
      return res.data.data;
    } catch (e) {
      console.warn('%c⚠ PREFERENCES SAVE FAILED - Using LocalStorage', 'color: #FF9800; font-weight: bold; font-size: 14px');
      localStorage.setItem('neurocompanion-user-preferences', JSON.stringify(prefs));
      return prefs;
    }
  }
};
