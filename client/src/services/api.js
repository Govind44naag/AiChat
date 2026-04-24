 
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  changePassword: (data) => api.put('/user/change-password', data),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } })
};

export default api;