const express = require('express');
const passport = require('passport');
const { googleCallback, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Iniciar autenticación con Google
router.get('/google', (req, res, next) => {
  console.log('🚀 Iniciando autenticación con Google...');
  next();
}, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback de Google
router.get('/google/callback', (req, res, next) => {
  console.log('📥 Callback de Google recibido');
  console.log('📋 Query params:', req.query);
  next();
}, passport.authenticate('google', { 
  failureRedirect: '/login',
  session: true 
}), (req, res, next) => {
  console.log('✅ Passport authenticate completado');
  console.log('👤 req.user después de authenticate:', req.user ? 'Presente' : 'Ausente');
  next();
}, googleCallback);

// Obtener usuario actual
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

module.exports = router;
