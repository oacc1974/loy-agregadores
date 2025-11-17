const LoyverseConfig = require('../models/LoyverseConfig');
const LoyverseService = require('../services/loyverse.service');
const { validateLoyverseConfig } = require('../utils/validators');
const logger = require('../utils/logger');

// @desc    Configurar credenciales de Loyverse
// @route   POST /api/loyverse/configure
exports.configure = async (req, res) => {
  try {
    const { accessToken, storeId, posId, settings } = req.body;

    logger.info('Guardando configuración de Loyverse para usuario:', req.user._id);

    // Buscar o crear configuración
    let config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (config) {
      // Actualizar existente
      logger.info('Actualizando configuración existente');
      
      // Solo actualizar accessToken si se proporciona uno nuevo
      if (accessToken) {
        config.credentials.accessToken = accessToken;
      }
      
      if (storeId) config.credentials.storeId = storeId;
      if (posId !== undefined) config.credentials.posId = posId;
      if (settings) config.settings = { ...config.settings, ...settings };
      
      await config.save();
    } else {
      // Crear nuevo - requiere accessToken y storeId
      if (!accessToken || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'accessToken y storeId son requeridos para crear una nueva configuración'
        });
      }
      
      logger.info('Creando nueva configuración');
      config = await LoyverseConfig.create({
        userId: req.user._id,
        credentials: { accessToken, storeId, posId },
        settings: settings || {}
      });
    }

    logger.info('Configuración guardada exitosamente');

    // Verificar que se guardó correctamente
    const savedConfig = await LoyverseConfig.findOne({ userId: req.user._id });
    logger.info('Token guardado (primeros 10 chars):', savedConfig.credentials.accessToken?.substring(0, 10));

    res.json({
      success: true,
      message: 'Configuración de Loyverse guardada exitosamente',
      data: config
    });
  } catch (error) {
    logger.error('Error configurando Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener configuración de Loyverse
// @route   GET /api/loyverse/config
exports.getConfig = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    // NO enviar el token en absoluto por seguridad
    const configData = config.toObject();
    configData.credentials.accessToken = null; // No enviar el token
    configData.hasToken = true; // Indicar que existe un token guardado

    res.json({
      success: true,
      data: configData
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de Loyverse:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Probar conexión con Loyverse
// @route   POST /api/loyverse/test-connection
exports.testConnection = async (req, res) => {
  try {
    const { accessToken, storeId } = req.body;

    // Si se envían credenciales en el body, usarlas (para probar antes de guardar)
    let configToTest;
    if (accessToken && storeId) {
      configToTest = {
        credentials: {
          accessToken,
          storeId
        }
      };
    } else {
      // Si no, buscar configuración guardada
      configToTest = await LoyverseConfig.findOne({ userId: req.user._id });
      
      if (!configToTest) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de Loyverse no encontrada. Proporciona accessToken y storeId.'
        });
      }
    }

    const loyverseService = new LoyverseService(configToTest);
    const result = await loyverseService.testConnection();

    res.json(result);
  } catch (error) {
    logger.error('Error probando conexión con Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener tiendas de Loyverse
// @route   GET /api/loyverse/stores
exports.getStores = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    const loyverseService = new LoyverseService(config);
    const stores = await loyverseService.getStores();

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    logger.error('Error obteniendo tiendas de Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener items de Loyverse
// @route   GET /api/loyverse/items
exports.getItems = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    const loyverseService = new LoyverseService(config);
    const items = await loyverseService.getItems(req.query);

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    logger.error('Error obteniendo items de Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener categorías de Loyverse
// @route   GET /api/loyverse/categories
exports.getCategories = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    const loyverseService = new LoyverseService(config);
    const categories = await loyverseService.getCategories();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    logger.error('Error obteniendo categorías de Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Crear recibo en Loyverse
// @route   POST /api/loyverse/receipt
exports.createReceipt = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOne({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    const loyverseService = new LoyverseService(config);
    const receipt = await loyverseService.createReceipt(req.body);

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    logger.error('Error creando recibo en Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Borrar configuración de Loyverse
// @route   DELETE /api/loyverse/config
exports.deleteConfig = async (req, res) => {
  try {
    const config = await LoyverseConfig.findOneAndDelete({ userId: req.user._id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de Loyverse no encontrada'
      });
    }

    logger.info('Configuración de Loyverse borrada para usuario:', req.user._id);

    res.json({
      success: true,
      message: 'Configuración de Loyverse borrada exitosamente'
    });
  } catch (error) {
    logger.error('Error borrando configuración de Loyverse:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};
