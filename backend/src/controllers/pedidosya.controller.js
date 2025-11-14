const PedidosYaConfig = require('../models/PedidosYaConfig');
const AggregatorConfig = require('../models/AggregatorConfig');
const PedidosYaService = require('../services/pedidosya.service');
const logger = require('../utils/logger');

// @desc    Configurar credenciales de PedidosYa
// @route   POST /api/pedidosya/configure
exports.configure = async (req, res) => {
  try {
    const { restaurantId, clientId, clientSecret, settings } = req.body;

    if (!restaurantId || !clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, Client ID y Client Secret son requeridos'
      });
    }

    // Buscar o crear AggregatorConfig
    let aggregatorConfig = await AggregatorConfig.findOne({
      userId: req.user._id,
      aggregatorType: 'pedidosya'
    });

    if (!aggregatorConfig) {
      aggregatorConfig = await AggregatorConfig.create({
        userId: req.user._id,
        aggregatorType: 'pedidosya',
        name: 'PedidosYa',
        isActive: false
      });
    }

    // Buscar o crear PedidosYaConfig
    let pedidosYaConfig = await PedidosYaConfig.findOne({
      userId: req.user._id
    });

    if (pedidosYaConfig) {
      // Actualizar existente
      pedidosYaConfig.credentials.restaurantId = restaurantId;
      pedidosYaConfig.credentials.clientId = clientId;
      pedidosYaConfig.credentials.clientSecret = clientSecret;
      if (settings) pedidosYaConfig.settings = { ...pedidosYaConfig.settings, ...settings };
      await pedidosYaConfig.save();
    } else {
      // Crear nuevo
      pedidosYaConfig = await PedidosYaConfig.create({
        userId: req.user._id,
        aggregatorConfigId: aggregatorConfig._id,
        credentials: { restaurantId, clientId, clientSecret },
        settings: settings || {}
      });
    }

    res.json({
      success: true,
      message: 'Configuración de PedidosYa guardada exitosamente',
      data: pedidosYaConfig
    });
  } catch (error) {
    logger.error('Error configurando PedidosYa:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener configuración de PedidosYa
// @route   GET /api/pedidosya/config
exports.getConfig = async (req, res) => {
  try {
    const config = await PedidosYaConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de PedidosYa no encontrada'
      });
    }

    // No enviar secrets completos
    const configData = config.toObject();
    configData.credentials.clientId = '***********';
    configData.credentials.clientSecret = '***********';

    res.json({
      success: true,
      data: configData
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de PedidosYa:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Probar conexión con PedidosYa
// @route   POST /api/pedidosya/test-connection
exports.testConnection = async (req, res) => {
  try {
    const config = await PedidosYaConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de PedidosYa no encontrada'
      });
    }

    const pedidosYaService = new PedidosYaService(config);
    const result = await pedidosYaService.testConnection();

    // Si la conexión es exitosa, activar el agregador
    if (result.success) {
      await AggregatorConfig.updateOne(
        { userId: req.user._id, aggregatorType: 'pedidosya' },
        { isActive: true }
      );
    }

    res.json(result);
  } catch (error) {
    logger.error('Error probando conexión con PedidosYa:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener órdenes de PedidosYa
// @route   GET /api/pedidosya/orders
exports.getOrders = async (req, res) => {
  try {
    const config = await PedidosYaConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de PedidosYa no encontrada'
      });
    }

    const pedidosYaService = new PedidosYaService(config);
    
    // Obtener token
    const tokenData = await pedidosYaService.getAccessToken();
    pedidosYaService.setAccessToken(tokenData.accessToken);

    // Obtener órdenes
    const orders = await pedidosYaService.getOrders(req.query);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    logger.error('Error obteniendo órdenes de PedidosYa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Webhook de PedidosYa para órdenes
// @route   POST /api/pedidosya/webhook
exports.webhook = async (req, res) => {
  try {
    const { event, order } = req.body;

    logger.info('Webhook de PedidosYa recibido:', { event, orderId: order?.id });

    // Verificar firma del webhook
    // TODO: Implementar verificación de firma

    if (event === 'order.created') {
      logger.info('Nueva orden recibida de PedidosYa:', order.id);
      // Procesar nueva orden
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error en webhook de PedidosYa:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
