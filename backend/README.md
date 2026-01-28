# Chat-RN Backend

Backend do aplicativo de chat em tempo real usando Node.js, Express, Socket.IO e MongoDB.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **MongoDB** - Banco de dados NoSQL
- **Passport.js** - Autenticação
- **JWT** - Tokens de autenticação
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

### Opção 1: Com Docker (Recomendado)
- Docker Desktop ([Instalar Docker Desktop](https://www.docker.com/products/docker-desktop))
  - macOS: `brew install --cask docker`
  - Ou baixe direto do site oficial
- Docker Compose (já incluído no Docker Desktop)

### Opção 2: Sem Docker
- Node.js (versão 14 ou superior)
- MongoDB (local ou MongoDB Atlas)
  - macOS: `brew install mongodb-community`
  - Linux: Siga instruções no [site oficial](https://www.mongodb.com/docs/manual/installation/)
- npm ou yarn

## ⚙️ Configuração

### 🐳 Opção 1: Usando Docker (Recomendado)

#### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto backend:

```env
# Database - Use 'mongodb' como hostname quando rodar com Docker
MONGODB_URI=mongodb://mongodb:27017/chat-rn

# JWT Secret - MUDE ESTA CHAVE EM PRODUÇÃO!
JWT_SECRET=sua_chave_secreta_super_segura_aqui_mude_em_producao

# Server
PORT=3000

# Node Environment
NODE_ENV=development
```

#### 2. Subir os containers

Na raiz do projeto (onde está o `docker-compose.yml`):

```bash
# Subir MongoDB + Backend
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v
```

O servidor estará rodando em `http://localhost:3000` e o MongoDB em `localhost:27017`

---

### 💻 Opção 2: Sem Docker (Local)

#### 1. Instalar dependências

```bash
npm install
```

#### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto backend:

```env
# Database - Use 'localhost' quando rodar sem Docker
MONGODB_URI=mongodb://localhost:27017/chat-rn

# JWT Secret - MUDE ESTA CHAVE EM PRODUÇÃO!
JWT_SECRET=sua_chave_secreta_super_segura_aqui_mude_em_producao

# Server
PORT=3000

# Node Environment
NODE_ENV=development
```

**⚠️ IMPORTANTE:** 
- Altere `JWT_SECRET` para uma chave aleatória e segura em produção
- Ajuste `MONGODB_URI` se estiver usando MongoDB Atlas ou outra URL
- O arquivo `.env` está no `.gitignore` e não deve ser commitado

#### 3. Iniciar MongoDB local

Certifique-se de que o MongoDB está rodando localmente:

```bash
# macOS (com Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Ou rode manualmente
mongod
```

#### 4. Iniciar o servidor

**Modo desenvolvimento (com nodemon):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuração MongoDB
│   │   └── passport.js      # Configuração autenticação
│   ├── middleware/
│   │   └── auth.js          # Middlewares de autenticação
│   ├── models/
│   │   ├── User.js          # Model de usuário
│   │   └── Message.js       # Model de mensagem
│   ├── routes/
│   │   ├── auth.routes.js   # Rotas de autenticação
│   │   ├── user.routes.js   # Rotas de usuários
│   │   └── message.routes.js # Rotas de mensagens
│   ├── socket/
│   │   └── socketHandler.js # Gerenciamento Socket.IO
│   └── server.js            # Arquivo principal
├── .env                     # Variáveis de ambiente (criar)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/registro` - Criar nova conta
- `POST /api/auth/login` - Fazer login

### Usuários
- `GET /api/users` - Listar todos os usuários (autenticado)
- `GET /api/users/:id` - Buscar usuário por ID (autenticado)

### Mensagens
- `POST /api/messages` - Enviar mensagem (autenticado)
- `GET /api/messages/:receiverId` - Buscar mensagens com um usuário (autenticado)

### Socket.IO Events
- `connection` - Conexão estabelecida
- `authenticate` - Autenticar socket com token JWT
- `sendMessage` - Enviar mensagem em tempo real
- `typing` - Notificar que está digitando
- `disconnect` - Desconectar

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```
