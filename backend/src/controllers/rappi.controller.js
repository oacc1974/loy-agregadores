const RappiConfig = require('../models/RappiConfig');
const AggregatorConfig = require('../models/AggregatorConfig');
const RappiService = require('../services/rappi.service');
const logger = require('../utils/logger');

// @desc    Configurar credenciales de Rappi
// @route   POST /api/rappi/configure
exports.configure = async (req, res) => {
  try {
    const { storeId, apiKey, secretKey, settings } = req.body;

    if (!storeId || !apiKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Store ID, API Key y Secret Key son requeridos'
      });
    }

    // Buscar o crear AggregatorConfig
    let aggregatorConfig = await AggregatorConfig.findOne({
      userId: req.user._id,
      aggregatorType: 'rappi'
    });

    if (!aggregatorConfig) {
      aggregatorConfig = await AggregatorConfig.create({
        userId: req.user._id,
        aggregatorType: 'rappi',
        name: 'Rappi',
        isActive: false
      });
    }

    // Buscar o crear RappiConfig
    let rappiConfig = await RappiConfig.findOne({
      userId: req.user._id
    });

    if (rappiConfig) {
      // Actualizar existente
      rappiConfig.credentials.storeId = storeId;
      rappiConfig.credentials.apiKey = apiKey;
      rappiConfig.credentials.secretKey = secretKey;
      if (settings) rappiConfig.settings = { ...rappiConfig.settings, ...settings };
      await rappiConfig.save();
    } else {
      // Crear nuevo
      rappiConfig = await RappiConfig.create({
        userId: req.user._id,
        aggregatorConfigId: aggregatorConfig._id,
        credentials: { storeId, apiKey, secretKey },
        settings: settings || {}
      });
    }

    res.json({
      success: true,
      message: 'Configuración de Rappi guardada exitosamente',
      data: rappiConfig
    });
  } catch (error) {
    logger.error('Error configurando Rappi:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener configuración de Rappi
// @route   GET /api/rappi/config
exports.getConfig = async (req, res) => {
  try {
    const config = await RappiConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Rappi no encontrada'
      });
    }

    // No enviar secrets completos
    const configData = config.toObject();
    configData.credentials.apiKey = '***********';
    configData.credentials.secretKey = '***********';

    res.json({
      success: true,
      data: configData
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de Rappi:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Probar conexión con Rappi
// @route   POST /api/rappi/test-connection
exports.testConnection = async (req, res) => {
  try {
    const config = await RappiConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Rappi no encontrada'
      });
    }

    const rappiService = new RappiService(config);
    const result = await rappiService.testConnection();

    // Si la conexión es exitosa, activar el agregador
    if (result.success) {
      await AggregatorConfig.updateOne(
        { userId: req.user._id, aggregatorType: 'rappi' },
        { isActive: true }
      );
    }

    res.json(result);
  } catch (error) {
    logger.error('Error probando conexión con Rappi:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener órdenes de Rappi
// @route   GET /api/rappi/orders
exports.getOrders = async (req, res) => {
  try {
    const config = await RappiConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Rappi no encontrada'
      });
    }

    const rappiService = new RappiService(config);
    const orders = await rappiService.getOrders(req.query);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    logger.error('Error obteniendo órdenes de Rappi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Webhook de Rappi para órdenes
// @route   POST /api/rappi/webhook
exports.webhook = async (req, res) => {
  try {
    const { event, order } = req.body;

    logger.info('Webhook de Rappi recibido:', { event, orderId: order?.id });

    // Verificar firma del webhook
    // TODO: Implementar verificación de firma

    if (event === 'order_created') {
      logger.info('Nueva orden recibida de Rappi:', order.id);
      // Procesar nueva orden
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error en webhook de Rappi:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
