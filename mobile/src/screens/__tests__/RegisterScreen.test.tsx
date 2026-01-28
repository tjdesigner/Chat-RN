import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';
import RegisterScreen from '../RegisterScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

describe('RegisterScreen', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <RegisterScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    expect(getByText('✨ Criar Conta')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu nome')).toBeTruthy();
    expect(getByPlaceholderText('Escolha um username')).toBeTruthy();
    expect(getByPlaceholderText('Crie uma senha')).toBeTruthy();
    expect(getByPlaceholderText('Digite a senha novamente')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    const { getByText } = render(
      <Wrapper>
        <RegisterScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    const registerButton = getByText('Cadastrar');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('Nome é obrigatório')).toBeTruthy();
      expect(getByText('Username é obrigatório')).toBeTruthy();
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });
  });

  it('should show error when passwords do not match', async () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <RegisterScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    fireEvent.changeText(getByPlaceholderText('Digite seu nome'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Escolha um username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Crie uma senha'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Digite a senha novamente'), 'different');

    fireEvent.press(getByText('Cadastrar'));

    await waitFor(() => {
      expect(getByText('As senhas não coincidem')).toBeTruthy();
    });
  });

  it('should navigate to login screen', () => {
    const { getByText } = render(
      <Wrapper>
        <RegisterScreen navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
      </Wrapper>
    );

    const loginLink = getByText('Fazer login');
    fireEvent.press(loginLink);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should clear errors when typing', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <Wrapper>
        <RegisterScreen navigation={{ navigate: mockNavigate } as any} />
      </Wrapper>
    );

    fireEvent.press(getByText('Cadastrar'));

    await waitFor(() => {
      expect(getByText('Nome é obrigatório')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Digite seu nome'), 'Test');

    await waitFor(() => {
      expect(queryByText('Nome é obrigatório')).toBeNull();
    });
  });
});
