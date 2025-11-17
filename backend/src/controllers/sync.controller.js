const Order = require('../models/Order');
const SyncLog = require('../models/SyncLog');
const syncService = require('../services/sync.service');
const logger = require('../utils/logger');

// @desc    Sincronización manual
// @route   POST /api/sync/manual
exports.manualSync = async (req, res) => {
  try {
    // Sincronizar solo las órdenes pendientes (no fetch de Uber)
    // Esto es útil para pedidos simulados o cuando ya tienes órdenes en la BD
    const result = await syncService.syncPendingOrders(req.user._id);

    res.json({
      success: true,
      message: 'Sincronización completada',
      data: result
    });
  } catch (error) {
    logger.error('Error en sincronización manual:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener estado de sincronización
// @route   GET /api/sync/status
exports.getStatus = async (req, res) => {
  try {
    // Contar órdenes por estado
    const pending = await Order.countDocuments({
      userId: req.user._id,
      status: 'pending'
    });

    const synced = await Order.countDocuments({
      userId: req.user._id,
      status: 'synced'
    });

    const error = await Order.countDocuments({
      userId: req.user._id,
      status: 'error'
    });

    // Última sincronización
    const lastSync = await SyncLog.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        orders: {
          pending,
          synced,
          error,
          total: pending + synced + error
        },
        lastSync: lastSync ? {
          date: lastSync.createdAt,
          status: lastSync.status,
          itemsProcessed: lastSync.itemsProcessed,
          itemsSuccess: lastSync.itemsSuccess,
          itemsFailed: lastSync.itemsFailed
        } : null
      }
    });
  } catch (error) {
    logger.error('Error obteniendo estado de sincronización:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener logs de sincronización
// @route   GET /api/sync/logs
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, syncType } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (syncType) query.syncType = syncType;

    const logs = await SyncLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SyncLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error obteniendo logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Obtener órdenes sincronizadas
// @route   GET /api/sync/orders
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, aggregatorType } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (aggregatorType) query.aggregatorType = aggregatorType;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// @desc    Reintentar sincronización de orden
// @route   POST /api/sync/orders/:id/retry
exports.retryOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Cambiar estado a pending para que se reintente
    order.status = 'pending';
    order.errorMessage = '';
    await order.save();

    // Ejecutar sincronización
    await syncService.syncPendingOrders(req.user._id);

    // Obtener orden actualizada
    const updatedOrder = await Order.findById(order._id);

    res.json({
      success: true,
      message: 'Reintento de sincronización iniciado',
      data: updatedOrder
    });
  } catch (error) {
    logger.error('Error reintentando orden:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error del servidor'
    });
  }
};
