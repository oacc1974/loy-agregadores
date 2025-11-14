const UberConfig = require('../models/UberConfig');
const AggregatorConfig = require('../models/AggregatorConfig');
const UberService = require('../services/uber.service');
const { validateUberConfig } = require('../utils/validators');
const logger = require('../utils/logger');

// @desc    Configurar credenciales de Uber
// @route   POST /api/uber/configure
exports.configure = async (req, res) => {
  try {
    const { error } = validateUberConfig(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { storeId, clientId, clientSecret, settings } = req.body;

    // Buscar o crear AggregatorConfig
    let aggregatorConfig = await AggregatorConfig.findOne({
      userId: req.user._id,
      aggregatorType: 'uber'
    });

    if (!aggregatorConfig) {
      aggregatorConfig = await AggregatorConfig.create({
        userId: req.user._id,
        aggregatorType: 'uber',
        name: 'Uber Eats',
        isActive: false
      });
    }

    // Buscar o crear UberConfig
    let uberConfig = await UberConfig.findOne({
      userId: req.user._id
    });

    if (uberConfig) {
      // Actualizar existente
      uberConfig.credentials.storeId = storeId;
      uberConfig.credentials.clientId = clientId;
      uberConfig.credentials.clientSecret = clientSecret;
      if (settings) uberConfig.settings = { ...uberConfig.settings, ...settings };
      await uberConfig.save();
    } else {
      // Crear nuevo
      uberConfig = await UberConfig.create({
        userId: req.user._id,
        aggregatorConfigId: aggregatorConfig._id,
        credentials: { storeId, clientId, clientSecret },
        settings: settings || {}
      });
    }

    res.json({
      success: true,
      message: 'Configuración de Uber guardada exitosamente',
      data: uberConfig
    });
  } catch (error) {
    logger.error('Error configurando Uber:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener configuración de Uber
// @route   GET /api/uber/config
exports.getConfig = async (req, res) => {
  try {
    const config = await UberConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Uber no encontrada'
      });
    }

    // No enviar client secret completo
    const configData = config.toObject();
    configData.credentials.clientSecret = '***********';

    res.json({
      success: true,
      data: configData
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de Uber:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Actualizar configuración de Uber
// @route   PUT /api/uber/config
exports.updateConfig = async (req, res) => {
  try {
    const config = await UberConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Uber no encontrada'
      });
    }

    const { settings } = req.body;

    if (settings) {
      config.settings = { ...config.settings, ...settings };
      await config.save();
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Error actualizando configuración de Uber:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Probar conexión con Uber
// @route   POST /api/uber/test-connection
exports.testConnection = async (req, res) => {
  try {
    const config = await UberConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Uber no encontrada'
      });
    }

    const uberService = new UberService(config);
    const result = await uberService.testConnection();

    // Si la conexión es exitosa, activar el agregador
    if (result.success) {
      await AggregatorConfig.updateOne(
        { userId: req.user._id, aggregatorType: 'uber' },
        { isActive: true }
      );
    }

    res.json(result);
  } catch (error) {
    logger.error('Error probando conexión con Uber:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener órdenes de Uber
// @route   GET /api/uber/orders
exports.getOrders = async (req, res) => {
  try {
    const config = await UberConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Uber no encontrada'
      });
    }

    const uberService = new UberService(config);
    
    // Obtener token
    const tokenData = await uberService.getAccessToken();
    uberService.setAccessToken(tokenData.accessToken);

    // Obtener órdenes
    const orders = await uberService.getOrders(req.query);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    logger.error('Error obteniendo órdenes de Uber:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener menú de Uber
// @route   GET /api/uber/menu
exports.getMenu = async (req, res) => {
  try {
    const config = await UberConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Uber no encontrada'
      });
    }

    const uberService = new UberService(config);
    
    // Obtener token
    const tokenData = await uberService.getAccessToken();
    uberService.setAccessToken(tokenData.accessToken);

    // Obtener menú
    const menu = await uberService.getMenu();

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error obteniendo menú de Uber:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Simular pedido de Uber para pruebas
// @route   POST /api/uber/simulate-order
exports.simulateOrder = async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    // Pedido simulado de Uber
    const simulatedOrder = {
      id: `UBER-SIM-${Date.now()}`,
      display_id: `#${Math.floor(Math.random() * 10000)}`,
      placed_at: new Date().toISOString(),
      eater: {
        first_name: 'Cliente',
        last_name: 'Simulado',
        phone: '+593999999999'
      },
      delivery: {
        location: {
          address: 'Av. Amazonas y Naciones Unidas, Quito'
        }
      },
      cart: {
        items: [
          {
            title: 'Combo Familiar',
            quantity: 2,
            price: 1500, // En centavos
            selected_modifier_groups: [
              {
                selected_items: [
                  {
                    title: 'Extra Papas',
                    price: 200
                  }
                ]
              }
            ]
          },
          {
            title: 'Gaseosa 1.5L',
            quantity: 1,
            price: 250
          }
        ]
      },
      payment: {
        charges: {
          subtotal: 3450,
          tax: 414,
          delivery_fee: 150,
          total: 4014
        },
        type: 'ONLINE'
      },
      estimated_ready_for_pickup_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    // Transformar orden usando el servicio de Uber
    const UberService = require('../services/uber.service');
    const config = await UberConfig.findOne({ userId: req.user._id });
    const uberService = new UberService(config || {});
    const orderData = uberService.transformOrder(simulatedOrder);

    // Guardar orden en BD
    const order = await Order.create({
      userId: req.user._id,
      aggregatorType: 'uber',
      aggregatorOrderId: simulatedOrder.id,
      status: 'pending',
      orderData
    });

    logger.info('Pedido simulado de Uber creado:', order._id);

    res.json({
      success: true,
      message: 'Pedido simulado creado exitosamente',
      data: {
        orderId: order._id,
        aggregatorOrderId: simulatedOrder.id,
        orderNumber: orderData.orderNumber,
        total: orderData.total,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error('Error simulando pedido de Uber:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Webhook de Uber para órdenes
// @route   POST /api/uber/webhook
exports.webhook = async (req, res) => {
  try {
    const { event_type, order } = req.body;

    logger.info('Webhook de Uber recibido:', { event_type, orderId: order?.id });

    // Verificar firma del webhook (implementar según documentación de Uber)
    // ...

    if (event_type === 'orders.notification') {
      // Procesar nueva orden
      // Este endpoint se implementaría completamente según la documentación de Uber
      logger.info('Nueva orden recibida de Uber:', order.id);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error en webhook de Uber:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};
