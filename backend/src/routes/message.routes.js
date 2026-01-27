const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const Message = require('../models/Message');

// GET /api/messages/:userId - Obter histórico de mensagens com um usuário
router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'nome username')
      .populate('receiver', 'nome username')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar mensagens' 
    });
  }
});

// PUT /api/messages/:messageId/read - Marcar mensagem como lida
router.put('/:messageId/read', authenticateJWT, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    ).populate('sender', 'nome username')
     .populate('receiver', 'nome username');

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mensagem não encontrada' 
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao marcar mensagem como lida' 
    });
  }
});

// GET /api/messages/unread/count - Contar mensagens não lidas por remetente
router.get('/unread/count', authenticateJWT, async (req, res) => {
  try {
    // Agregar mensagens não lidas agrupadas por remetente
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          read: false,
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Converter para objeto { userId: count }
    const unreadCounts = {};
    unreadMessages.forEach(item => {
      unreadCounts[item._id.toString()] = item.count;
    });

    res.json({
      success: true,
      unreadCounts,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao contar mensagens não lidas' 
    });
  }
});

module.exports = router;
