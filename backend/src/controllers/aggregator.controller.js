const AggregatorConfig = require('../models/AggregatorConfig');
const UberConfig = require('../models/UberConfig');
const logger = require('../utils/logger');

// @desc    Listar agregadores configurados
// @route   GET /api/aggregators
exports.getAggregators = async (req, res) => {
  try {
    const aggregators = await AggregatorConfig.find({ userId: req.user._id });

    res.json({
      success: true,
      count: aggregators.length,
      data: aggregators
    });
  } catch (error) {
    logger.error('Error obteniendo agregadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Agregar nuevo agregador
// @route   POST /api/aggregators
exports.addAggregator = async (req, res) => {
  try {
    const { aggregatorType, name } = req.body;

    if (!aggregatorType || !name) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de agregador y nombre son requeridos'
      });
    }

    // Verificar si ya existe
    const existing = await AggregatorConfig.findOne({
      userId: req.user._id,
      aggregatorType
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Este agregador ya está configurado'
      });
    }

    const aggregator = await AggregatorConfig.create({
      userId: req.user._id,
      aggregatorType,
      name,
      isActive: false // Inactivo hasta que se configure
    });

    res.status(201).json({
      success: true,
      data: aggregator
    });
  } catch (error) {
    logger.error('Error agregando agregador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener configuración de agregador
// @route   GET /api/aggregators/:id
exports.getAggregator = async (req, res) => {
  try {
    const aggregator = await AggregatorConfig.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!aggregator) {
      return res.status(404).json({
        success: false,
        message: 'Agregador no encontrado'
      });
    }

    res.json({
      success: true,
      data: aggregator
    });
  } catch (error) {
    logger.error('Error obteniendo agregador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Actualizar configuración de agregador
// @route   PUT /api/aggregators/:id
exports.updateAggregator = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const aggregator = await AggregatorConfig.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!aggregator) {
      return res.status(404).json({
        success: false,
        message: 'Agregador no encontrado'
      });
    }

    if (name) aggregator.name = name;
    if (typeof isActive !== 'undefined') aggregator.isActive = isActive;

    await aggregator.save();

    res.json({
      success: true,
      data: aggregator
    });
  } catch (error) {
    logger.error('Error actualizando agregador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Eliminar agregador
// @route   DELETE /api/aggregators/:id
exports.deleteAggregator = async (req, res) => {
  try {
    const aggregator = await AggregatorConfig.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!aggregator) {
      return res.status(404).json({
        success: false,
        message: 'Agregador no encontrado'
      });
    }

    // Eliminar configuraciones específicas
    if (aggregator.aggregatorType === 'uber') {
      await UberConfig.deleteOne({ aggregatorConfigId: aggregator._id });
    }

    await aggregator.deleteOne();

    res.json({
      success: true,
      message: 'Agregador eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando agregador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Toggle estado de agregador
// @route   POST /api/aggregators/:id/toggle
exports.toggleAggregator = async (req, res) => {
  try {
    const aggregator = await AggregatorConfig.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!aggregator) {
      return res.status(404).json({
        success: false,
        message: 'Agregador no encontrado'
      });
    }

    aggregator.isActive = !aggregator.isActive;
    await aggregator.save();

    res.json({
      success: true,
      data: aggregator
    });
  } catch (error) {
    logger.error('Error cambiando estado de agregador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
