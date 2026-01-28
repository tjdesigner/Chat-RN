import { Platform } from 'react-native';

export const API_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
  : 'http://192.168.1.15:3000';
export const SOCKET_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
  : 'http://192.168.1.15:3000';

export const STORAGE_KEYS = {
  TOKEN: '@ChatApp:token',
  USER: '@ChatApp:user',
};

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  border: '#C6C6C8',
  
  text: '#000000',
  textSecondary: '#8E8E93',
  textPlaceholder: '#C7C7CC',
  
  white: '#FFFFFF',
  black: '#000000',
  
  myMessage: '#007AFF',
  otherMessage: '#E5E5EA',
  myMessageText: '#FFFFFF',
  otherMessageText: '#000000',
  
  online: '#34C759',
  offline: '#8E8E93',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  
  padding: 16,
  margin: 16,
  borderRadius: 8,
  
  icon: 24,
  avatar: 40,
};
