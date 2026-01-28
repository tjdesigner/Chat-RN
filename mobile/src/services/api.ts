import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    throw error;
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
    
    throw error;
  }
);

export const authService = {
  register: async (nome: string, username: string, senha: string) => {
    const response = await api.post('/api/auth/register', {
      nome,
      username,
      senha,
    });
    return response.data;
  },
  
  login: async (username: string, senha: string) => {
    const response = await api.post('/api/auth/login', {
      username,
      senha,
    });
    return response.data;
  },
};

export const userService = {
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  
  getOnlineUsers: async () => {
    const response = await api.get('/api/users/online');
    return response.data;
  },
};

export const messageService = {
  getMessages: async (userId: string) => {
    const response = await api.get(`/api/messages/${userId}`);
    return response.data;
  },
  
  markAsRead: async (messageId: string) => {
    const response = await api.put(`/api/messages/${messageId}/read`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/api/messages/unread/count');
    return response.data;
  },
};

export default api;
