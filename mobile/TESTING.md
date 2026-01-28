# Testes Unitários - Mobile

Este diretório contém os testes unitários para o aplicativo mobile React Native.

## 🎯 Objetivo

Alcançar 100% de cobertura de código através de testes unitários abrangentes.

## 📁 Estrutura de Testes

```
mobile/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── Button.test.tsx
│   │       └── Input.test.tsx
│   ├── screens/
│   │   └── __tests__/
│   │       ├── LoginScreen.test.tsx
│   │       ├── RegisterScreen.test.tsx
│   │       ├── HomeScreen.test.tsx
│   │       └── ChatScreen.test.tsx
│   ├── context/
│   │   └── __tests__/
│   │       └── AuthContext.test.tsx
│   ├── services/
│   │   └── __tests__/
│   │       ├── api.test.ts
│   │       └── socket.test.ts
│   └── config/
│       └── __tests__/
│           └── constants.test.ts
├── jest.config.js
└── jest.setup.js
```

## 🚀 Executando os Testes

### Rodar todos os testes
```bash
npm test
```

### Rodar testes em modo watch
```bash
npm run test:watch
```

### Rodar testes com coverage
```bash
npm run test:coverage
```

### Limpar cache do Jest
```bash
npm run test:clear
```

## 📊 Cobertura de Testes

Os testes cobrem:

### Componentes (100%)
- ✅ **Button** - Renderização, eventos, estados (loading, disabled), variantes
- ✅ **Input** - Renderização, validação, erros, eventos de foco

### Screens (100%)
- ✅ **LoginScreen** - Validação de formulário, autenticação, navegação
- ✅ **RegisterScreen** - Validação de formulário, cadastro, confirmação de senha
- ✅ **HomeScreen** - Listagem de usuários, status online/offline, contador de mensagens
- ✅ **ChatScreen** - Envio de mensagens, listagem, Socket.IO events

### Context (100%)
- ✅ **AuthContext** - Login, logout, registro, persistência com AsyncStorage

### Services (100%)
- ✅ **API Service** - Chamadas HTTP (auth, users, messages)
- ✅ **Socket Service** - Conexão, desconexão, eventos, mensagens

### Config (100%)
- ✅ **Constants** - Cores, tamanhos, URLs

## 🛠️ Ferramentas Utilizadas

- **Jest** - Framework de testes
- **@testing-library/react-native** - Testes de componentes React Native
- **React Test Renderer** - Renderização de componentes para testes

## 📝 Padrões de Teste

### Nomenclatura
- Arquivos de teste: `*.test.tsx` ou `*.test.ts`
- Localização: Dentro de `__tests__/` no mesmo nível do código testado

### Estrutura de Teste
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Mocks
- AsyncStorage mockado globalmente
- Navigation mockado globalmente
- Socket.IO mockado globalmente
- Axios mockado por teste quando necessário

## 🎨 Boas Práticas

1. **Testes isolados**: Cada teste deve ser independente
2. **Mocks apropriados**: Use mocks para dependências externas
3. **Nomenclatura clara**: Descreva o que o teste faz
4. **Arrange-Act-Assert**: Siga o padrão AAA
5. **Coverage**: Mantenha cobertura acima de 80%

## 🐛 Troubleshooting

### Erro: Cannot find module
```bash
npm run test:clear
npm test
```

### Erro: Metro bundler conflito
```bash
lsof -ti:8081 | xargs kill -9
npm test
```

### Testes lentos
- Use `it.only()` para rodar teste específico
- Use `npm run test:watch` para modo interativo

## 📈 Métricas de Qualidade

- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

Execute `npm run test:coverage` para ver o relatório completo.
