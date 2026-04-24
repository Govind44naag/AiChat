import axios from 'axios';

// Auto-detect API URL based on environment
const getApiUrl = () => {
  // Production - use the deployed backend URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api';
  }
  // Development - use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors (auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  getMe: () => api.get('/auth/me')
};

// Chat services
export const chatService = {
  getChats: () => api.get('/chats'),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  createChat: (provider, model) => api.post('/chats', { provider, model }),
  sendMessage: (chatId, content) => api.post(`/chats/${chatId}/messages`, { content }),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  getStats: () => api.get('/chats/stats/usage'),
  getModels: () => api.get('/chats/models/available')
};

// User services
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } })
};

export default api;