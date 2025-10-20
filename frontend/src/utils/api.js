import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
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
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user data' };
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
    try {
      const res = await api.post('/tasks/create', task);
      return res.data.data;
    } catch (e) {
      // Mock fallback
      const mock = { _id: String(Date.now()), status: 'todo', nudgeCount: 0, ...task };
      return mock;
    }
  },
  async update(id, update) {
    try {
      const res = await api.put(`/tasks/${id}`, update);
      return res.data.data;
    } catch (e) {
      return { _id: id, ...update };
    }
  },
  async listByUser(userId) {
    try {
      const res = await api.get(`/tasks/${userId}`);
      return res.data.data.tasks;
    } catch (e) {
      return [];
    }
  }
};

export const preferencesAPI = {
  async fetch() {
    try {
      const res = await api.get('/preferences');
      return res.data.data;
    } catch (e) {
      const raw = localStorage.getItem('neurocompanion-user-preferences');
      return raw ? JSON.parse(raw) : null;
    }
  },
  async save(prefs) {
    try {
      const res = await api.post('/preferences', prefs);
      return res.data.data;
    } catch (e) {
      localStorage.setItem('neurocompanion-user-preferences', JSON.stringify(prefs));
      return prefs;
    }
  }
};
