import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES } from '../config/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nome: '',
    username: '',
    senha: '',
    confirmSenha: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = {
      nome: '',
      username: '',
      senha: '',
      confirmSenha: '',
    };

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = 'Username é obrigatório';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username deve ter no mínimo 3 caracteres';
      isValid = false;
    }

    if (!senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
      isValid = false;
    }

    if (senha !== confirmSenha) {
      newErrors.confirmSenha = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(nome.trim(), username.toLowerCase().trim(), senha);
      // A navegação será feita automaticamente pelo AuthContext
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>✨ Criar Conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados para começar
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome Completo"
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              setErrors({ ...errors, nome: '' });
            }}
            error={errors.nome}
            autoCapitalize="words"
          />

          <Input
            label="Username"
            placeholder="Escolha um username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors({ ...errors, username: '' });
            }}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Senha"
            placeholder="Crie uma senha"
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setErrors({ ...errors, senha: '' });
            }}
            error={errors.senha}
            secureTextEntry
          />

          <Input
            label="Confirmar Senha"
            placeholder="Digite a senha novamente"
            value={confirmSenha}
            onChangeText={(text) => {
              setConfirmSenha(text);
              setErrors({ ...errors, confirmSenha: '' });
            }}
            error={errors.confirmSenha}
            secureTextEntry
          />

          <Button
            title="Cadastrar"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: SIZES.margin,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
