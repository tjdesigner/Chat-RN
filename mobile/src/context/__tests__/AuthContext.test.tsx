import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../services/api';
import socketService from '../../services/socket';

jest.mock('../../services/api');
jest.mock('../../services/socket');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: '1', nome: 'Test', username: 'test' },
      };
      (api.authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signIn('test', 'password');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockResponse.user);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@ChatApp:token', 'test-token');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@ChatApp:user', JSON.stringify(mockResponse.user));
        expect(socketService.connect).toHaveBeenCalledWith('test-token');
      });
    });

    it('should handle sign in error', async () => {
      (api.authService.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.signIn('test', 'wrong');
        })
      ).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: '1', nome: 'Test', username: 'test' },
      };
      (api.authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp('Test', 'test', 'password');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockResponse.user);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@ChatApp:token', 'test-token');
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@ChatApp:token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@ChatApp:user');
        expect(socketService.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('loadStoredAuth', () => {
    it('should load stored authentication', async () => {
      const mockUser = { _id: '1', nome: 'Test', username: 'test' };
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@ChatApp:token') return Promise.resolve('stored-token');
        if (key === '@ChatApp:user') return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle no stored authentication', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
