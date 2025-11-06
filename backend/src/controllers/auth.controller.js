const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Generar JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Callback de Google OAuth
// @route   GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  try {
    // Usuario ya autenticado por Passport
    const token = generateToken(req.user._id);

    // Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error('Error en callback de Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    logger.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        logger.error('Error en logout:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
