const express = require('express');
const passport = require('passport');
const { googleCallback, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Iniciar autenticación con Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// Obtener usuario actual
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

module.exports = router;
