const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Armazenar usuários conectados
const connectedUsers = new Map();

const socketHandler = (io) => {
  // Middleware de autenticação do Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token não fornecido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Usuário não encontrado'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ Usuário conectado: ${socket.username} (${socket.userId})`);

    // Atualizar status do usuário para online
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Adicionar ao mapa de usuários conectados
    connectedUsers.set(socket.userId, socket.id);

    // Notificar todos sobre o novo usuário online
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.username,
    });

    // Enviar lista de usuários online para o novo usuário
    const onlineUsers = await User.find({ isOnline: true }).select('-senha');
    socket.emit('online_users', onlineUsers);

    // Evento: Enviar mensagem
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;

        // Salvar mensagem no banco
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content,
        });

        await message.save();
        await message.populate('sender', 'nome username');
        await message.populate('receiver', 'nome username');

        // Enviar mensagem para o remetente
        socket.emit('message_sent', message);

        // Enviar mensagem para o destinatário (se estiver online)
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', message);
        }

        console.log(`📨 Mensagem de ${socket.username} para ${receiverId}`);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('message_error', { error: 'Erro ao enviar mensagem' });
      }
    });

    // Evento: Usuário está digitando
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          username: socket.username,
        });
      }
    });

    // Evento: Usuário parou de digitar
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          userId: socket.userId,
        });
      }
    });

    // Evento: Marcar mensagem como lida
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findByIdAndUpdate(
          messageId,
          { read: true, readAt: new Date() },
          { new: true }
        );

        if (message) {
          // Confirmar para quem marcou
          socket.emit('message_read_confirmed', { messageId });
          
          // Notificar o remetente
          const senderSocketId = connectedUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', {
              messageId: message._id,
              receiverId: socket.userId,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
      }
    });

    // Evento: Desconexão
    socket.on('disconnect', async () => {
      console.log(`❌ Usuário desconectado: ${socket.username}`);

      // Atualizar status do usuário para offline
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });

      // Remover do mapa de usuários conectados
      connectedUsers.delete(socket.userId);

      // Notificar todos sobre o usuário offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username,
      });
    });
  });
};

module.exports = socketHandler;
