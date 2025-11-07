const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

console.log('🔧 Configurando Google Strategy...');
console.log('📍 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Configurada ✅' : 'NO CONFIGURADA ❌');
console.log('📍 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Configurada ✅' : 'NO CONFIGURADA ❌');
console.log('📍 GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('✅ Google callback recibido para:', profile.emails[0].value);
        // Buscar usuario existente
        console.log('🔍 Buscando usuario con googleId:', profile.id);
        let user = await User.findOne({ googleId: profile.id });
        console.log('📊 Usuario encontrado:', user ? 'Sí' : 'No');

        if (user) {
          // Usuario existe, actualizar información
          user.name = profile.displayName;
          user.picture = profile.photos[0]?.value;
          await user.save();
          logger.info(`Usuario existente autenticado: ${user.email}`);
          return done(null, user);
        }

        // Crear nuevo usuario
        console.log('➕ Creando nuevo usuario...');
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value,
          isActive: true,
          role: 'user'
        });
        console.log('✅ Usuario creado:', user.email);

        logger.info(`Nuevo usuario creado: ${user.email}`);
        done(null, user);
      } catch (error) {
        console.error('❌ Error en autenticación Google:', error);
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
