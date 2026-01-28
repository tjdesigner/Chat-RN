import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { AuthProvider } from '../../context/AuthContext';
import LoginScreen from '../LoginScreen';


// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    expect(getByText('💬 ChatApp')).toBeTruthy();
    expect(getByText('Entre para conversar em tempo real')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu username')).toBeTruthy();
    expect(getByPlaceholderText('Digite sua senha')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    const { getByText } = render(
      <Wrapper>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    const loginButton = getByText('Entrar');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Username é obrigatório')).toBeTruthy();
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });
  });

  it('should show validation error for short password', async () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    const usernameInput = getByPlaceholderText('Digite seu username');
    const passwordInput = getByPlaceholderText('Digite sua senha');
    const loginButton = getByText('Entrar');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Senha deve ter no mínimo 6 caracteres')).toBeTruthy();
    });
  });

  it('should navigate to register screen', () => {
    const { getByText } = render(
      <Wrapper>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    const registerLink = getByText('Cadastre-se');
    fireEvent.press(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should clear errors when typing', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <Wrapper>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    const loginButton = getByText('Entrar');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Username é obrigatório')).toBeTruthy();
    });

    const usernameInput = getByPlaceholderText('Digite seu username');
    fireEvent.changeText(usernameInput, 'test');

    await waitFor(() => {
      expect(queryByText('Username é obrigatório')).toBeNull();
    });
  });
});
