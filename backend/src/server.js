require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const passport = require('./config/passport');
const socketHandler = require('./socket/socketHandler');

// Rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO com CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Conectar ao MongoDB
connectDB();

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Chat API funcionando!',
    version: '1.0.0',
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Configurar Socket.IO
socketHandler(io);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO pronto para conexões`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, io };
