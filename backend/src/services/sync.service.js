const Order = require('../models/Order');
const SyncLog = require('../models/SyncLog');
const UberConfig = require('../models/UberConfig');
const LoyverseConfig = require('../models/LoyverseConfig');
const UberService = require('./uber.service');
const LoyverseService = require('./loyverse.service');
const logger = require('../utils/logger');

class SyncService {
  // Sincronizar órdenes pendientes de un usuario
  async syncPendingOrders(userId) {
    const startTime = new Date();
    let itemsProcessed = 0;
    let itemsSuccess = 0;
    let itemsFailed = 0;
    const errors = [];

    try {
      // Obtener configuraciones
      const loyverseConfig = await LoyverseConfig.findOne({ userId });
      
      if (!loyverseConfig) {
        throw new Error('Configuración de Loyverse no encontrada');
      }

      // Obtener órdenes pendientes
      const pendingOrders = await Order.find({
        userId,
        status: 'pending'
      }).limit(50); // Procesar máximo 50 órdenes por vez

      if (pendingOrders.length === 0) {
        logger.info('No hay órdenes pendientes para sincronizar');
        return {
          success: true,
          message: 'No hay órdenes pendientes',
          itemsProcessed: 0
        };
      }

      const loyverseService = new LoyverseService(loyverseConfig);

      // Procesar cada orden
      for (const order of pendingOrders) {
        itemsProcessed++;
        
        try {
          // Crear recibo en Loyverse
          const receipt = await loyverseService.createReceipt(order.orderData);
          
          // Actualizar orden
          order.status = 'synced';
          order.loyverseReceiptId = receipt.receipt_number;
          order.lastSyncAttempt = new Date();
          await order.save();

          itemsSuccess++;
          logger.info(`Orden ${order.aggregatorOrderId} sincronizada exitosamente`);
        } catch (error) {
          itemsFailed++;
          
          // Actualizar orden con error
          order.status = 'error';
          order.syncAttempts += 1;
          order.lastSyncAttempt = new Date();
          order.errorMessage = error.message;
          await order.save();

          errors.push({
            itemId: order.aggregatorOrderId,
            error: error.message
          });

          logger.error(`Error sincronizando orden ${order.aggregatorOrderId}:`, error.message);
        }
      }

      // Crear log de sincronización
      const endTime = new Date();
      await SyncLog.create({
        userId,
        syncType: 'order',
        aggregatorType: pendingOrders[0]?.aggregatorType || 'uber',
        status: itemsFailed === 0 ? 'success' : (itemsSuccess > 0 ? 'partial' : 'error'),
        itemsProcessed,
        itemsSuccess,
        itemsFailed,
        details: {
          startTime,
          endTime,
          duration: endTime - startTime,
          errors
        }
      });

      return {
        success: true,
        itemsProcessed,
        itemsSuccess,
        itemsFailed,
        errors
      };

    } catch (error) {
      logger.error('Error en sincronización:', error);
      
      // Crear log de error
      await SyncLog.create({
        userId,
        syncType: 'order',
        aggregatorType: 'uber',
        status: 'error',
        itemsProcessed,
        itemsSuccess,
        itemsFailed,
        details: {
          startTime,
          endTime: new Date(),
          duration: new Date() - startTime,
          errors: [{ itemId: 'general', error: error.message }]
        }
      });

      throw error;
    }
  }

  // Obtener órdenes nuevas de Uber y guardarlas
  async fetchUberOrders(userId) {
    try {
      const uberConfig = await UberConfig.findOne({ userId });
      
      if (!uberConfig) {
        throw new Error('Configuración de Uber no encontrada');
      }

      const uberService = new UberService(uberConfig);
      
      // Obtener y configurar token
      const tokenData = await uberService.getAccessToken();
      uberService.setAccessToken(tokenData.accessToken);

      // Actualizar token en config
      uberConfig.credentials.accessToken = tokenData.accessToken;
      uberConfig.credentials.tokenExpiry = new Date(Date.now() + tokenData.expiresIn * 1000);
      await uberConfig.save();

      // Obtener órdenes de las últimas 24 horas
      const orders = await uberService.getOrders();

      let newOrders = 0;

      for (const uberOrder of orders) {
        // Verificar si la orden ya existe
        const existingOrder = await Order.findOne({
          aggregatorType: 'uber',
          aggregatorOrderId: uberOrder.id
        });

        if (!existingOrder) {
          // Transformar y guardar orden
          const orderData = uberService.transformOrder(uberOrder);
          
          await Order.create({
            userId,
            aggregatorType: 'uber',
            aggregatorOrderId: uberOrder.id,
            status: 'pending',
            orderData
          });

          newOrders++;
        }
      }

      // Actualizar última sincronización
      uberConfig.lastSync = new Date();
      await uberConfig.save();

      logger.info(`${newOrders} nuevas órdenes obtenidas de Uber`);

      return {
        success: true,
        newOrders,
        totalOrders: orders.length
      };

    } catch (error) {
      logger.error('Error obteniendo órdenes de Uber:', error);
      throw error;
    }
  }

  // Sincronización completa (fetch + sync)
  async fullSync(userId) {
    try {
      // Primero obtener órdenes nuevas
      const fetchResult = await this.fetchUberOrders(userId);
      
      // Luego sincronizar pendientes
      const syncResult = await this.syncPendingOrders(userId);

      return {
        success: true,
        fetch: fetchResult,
        sync: syncResult
      };
    } catch (error) {
      logger.error('Error en sincronización completa:', error);
      throw error;
    }
  }
}

module.exports = new SyncService();
