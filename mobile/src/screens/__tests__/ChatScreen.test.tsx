import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';
import * as api from '../../services/api';
import ChatScreen from '../ChatScreen';

jest.mock('../../services/api');
jest.mock('../../services/socket');

const mockRoute = {
  params: {
    user: {
      _id: '1',
      nome: 'Test User',
      username: 'testuser',
    },
  },
};

const mockNavigation = {
  setOptions: jest.fn(),
  goBack: jest.fn(),
  navigate: jest.fn(),
  addListener: jest.fn(),
};

describe('ChatScreen', () => {
  const mockMessages = [
    {
      _id: '1',
      text: 'Hello',
      sender: { _id: '2', nome: 'Test User' },
      receiver: { _id: '1', nome: 'Current User' },
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.messageService.getMessages as jest.Mock).mockResolvedValue({
      success: true,
      messages: mockMessages,
    });
    (api.messageService.markAsRead as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should render chat screen', async () => {
    const { getByPlaceholderText } = render(
      <Wrapper>
        <ChatScreen route={mockRoute as any} navigation={mockNavigation as any} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(getByPlaceholderText('Digite uma mensagem...')).toBeTruthy();
    });
  });

  it('should load and display messages', async () => {
    const { getByPlaceholderText } = render(
      <Wrapper>
        <ChatScreen route={mockRoute as any} navigation={mockNavigation as any} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(api.messageService.getMessages).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(getByPlaceholderText('Digite uma mensagem...')).toBeTruthy();
    });
  });

  it('should set navigation title', () => {
    render(
      <Wrapper>
        <ChatScreen route={mockRoute as any} navigation={mockNavigation as any} />
      </Wrapper>
    );

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      title: 'Test User',
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFFFFF',
    });
  });
});
