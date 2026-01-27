const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Estratégia Local (username e password)
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'senha',
  },
  async (username, senha, done) => {
    try {
      const user = await User.findOne({ username });
      
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }
      
      const isMatch = await user.comparePassword(senha);
      
      if (!isMatch) {
        return done(null, false, { message: 'Senha incorreta' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estratégia JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    
    if (user) {
      return done(null, user);
    }
    
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;
