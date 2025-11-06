const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Usuario existe, actualizar información
          user.name = profile.displayName;
          user.picture = profile.photos[0]?.value;
          await user.save();
          logger.info(`Usuario existente autenticado: ${user.email}`);
          return done(null, user);
        }

        // Crear nuevo usuario
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value,
          isActive: true,
          role: 'user'
        });

        logger.info(`Nuevo usuario creado: ${user.email}`);
        done(null, user);
      } catch (error) {
        logger.error('Error en autenticación Google:', error);
        done(error, null);
      }
    }
  )
);

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
