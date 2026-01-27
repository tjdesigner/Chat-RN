const passport = require('passport');

// Middleware para proteger rotas
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Erro na autenticação' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado. Token inválido ou expirado.' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { authenticateJWT };
