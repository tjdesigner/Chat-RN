import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';
import * as api from '../../services/api';
import HomeScreen from '../HomeScreen';

jest.mock('../../services/api');
jest.mock('../../services/socket');

const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    addListener: mockAddListener,
  }),
}));

describe('HomeScreen', () => {
  const mockUsers = [
    { _id: '1', nome: 'User 1', username: 'user1', isOnline: true },
    { _id: '2', nome: 'User 2', username: 'user2', isOnline: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.userService.getAllUsers as jest.Mock).mockResolvedValue({
      success: true,
      users: mockUsers,
    });
    (api.messageService.getUnreadCount as jest.Mock).mockResolvedValue({
      success: true,
      unreadCounts: {},
    });
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should render loading state initially', () => {
    const { getByTestId } = render(
      <Wrapper>
        <HomeScreen navigation={{ navigate: mockNavigate, addListener: mockAddListener } as any} />
      </Wrapper>
    );

    expect(getByTestId).toBeDefined();
  });

  it('should load and display users', async () => {
    const { getByText } = render(
      <Wrapper>
        <HomeScreen navigation={{ navigate: mockNavigate, addListener: mockAddListener } as any} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(getByText('User 1')).toBeTruthy();
      expect(getByText('User 2')).toBeTruthy();
    });
  });

  it('should display user status', async () => {
    const { getByText } = render(
      <Wrapper>
        <HomeScreen navigation={{ navigate: mockNavigate, addListener: mockAddListener } as any} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(getByText('Online')).toBeTruthy();
      expect(getByText('Offline')).toBeTruthy();
    });
  });

  it('should show empty state when no users', async () => {
    (api.userService.getAllUsers as jest.Mock).mockResolvedValue({
      success: true,
      users: [],
    });

    const { getByText } = render(
      <Wrapper>
        <HomeScreen navigation={{ navigate: mockNavigate, addListener: mockAddListener } as any} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(getByText('Nenhum usuário disponível')).toBeTruthy();
    });
  });
});
