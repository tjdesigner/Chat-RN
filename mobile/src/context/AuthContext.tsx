import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import socketService from '../services/socket';
import { STORAGE_KEYS } from '../config/constants';

interface User {
  _id: string;
  nome: string;
  username: string;
  isOnline: boolean;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, senha: string) => Promise<void>;
  signUp: (nome: string, username: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Conectar socket
        socketService.connect(storedToken);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, senha: string) => {
    try {
      const response = await authService.login(username, senha);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response;
        
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        // Conectar socket
        socketService.connect(newToken);
      } else {
        throw new Error(response.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erro ao fazer login'
      );
    }
  };

  const signUp = async (nome: string, username: string, senha: string) => {
    try {
      const response = await authService.register(nome, username, senha);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response;
        
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        // Conectar socket
        socketService.connect(newToken);
      } else {
        throw new Error(response.error || 'Erro ao cadastrar');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erro ao cadastrar'
      );
    }
  };

  const signOut = async () => {
    try {
      // Desconectar socket
      socketService.disconnect();
      
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
