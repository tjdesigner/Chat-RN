const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validações
const registerValidation = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('username').trim().notEmpty().withMessage('Username é obrigatório').toLowerCase(),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username é obrigatório').toLowerCase(),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
];

// POST /api/auth/register - Cadastro de usuário
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Validação dos dados
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { nome, username, senha } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username já está em uso' 
      });
    }

    // Criar novo usuário
    const user = new User({
      nome,
      username,
      senha,
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao cadastrar usuário' 
    });
  }
});

// POST /api/auth/login - Login de usuário
router.post('/login', loginValidation, (req, res, next) => {
  // Validação dos dados
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: 'Erro no servidor' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: info.message || 'Credenciais inválidas' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: user.toJSON(),
    });
  })(req, res, next);
});

module.exports = router;
