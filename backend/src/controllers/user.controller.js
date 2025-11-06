const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Obtener perfil del usuario
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Eliminar cuenta
// @route   DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Marcar como inactivo en lugar de eliminar
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Cuenta desactivada exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
