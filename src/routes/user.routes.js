const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me - Obter dados do usuário autenticado
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar dados do usuário' 
    });
  }
});

// GET /api/users/online - Lista de usuários online
router.get('/online', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('-senha')
      .sort({ nome: 1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar usuários online' 
    });
  }
});

// GET /api/users - Lista de todos os usuários (exceto o atual)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-senha')
      .sort({ isOnline: -1, nome: 1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar usuários' 
    });
  }
});

module.exports = router;
