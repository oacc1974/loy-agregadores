const axios = require('axios');
const logger = require('../utils/logger');

class RappiService {
  constructor(config) {
    this.config = config;
    this.baseURL = process.env.RAPPI_API_URL || 'https://services.grability.rappi.com/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.credentials.apiKey
      }
    });
  }

  // Generar firma para autenticación
  generateSignature(data) {
    const crypto = require('crypto');
    const message = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.config.credentials.secretKey)
      .update(message)
      .digest('hex');
  }

  // Probar conexión
  async testConnection() {
    try {
      const response = await this.client.get(`/restaurants-integrations-public-api/stores/${this.config.credentials.storeId}`);
      
      return {
        success: true,
        message: 'Conexión exitosa con Rappi',
        store: response.data
      };
    } catch (error) {
      logger.error('Error probando conexión con Rappi:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con Rappi'
      };
    }
  }

  // Obtener órdenes
  async getOrders(params = {}) {
    try {
      const { startDate, endDate, status } = params;
      
      const queryParams = {
        store_id: this.config.credentials.storeId,
        start_date: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end_date: endDate || new Date().toISOString(),
        ...(status && { status })
      };

      const response = await this.client.get('/restaurants-integrations-public-api/orders', {
        params: queryParams
      });

      return response.data.orders || [];
    } catch (error) {
      logger.error('Error obteniendo órdenes de Rappi:', error.response?.data || error.message);
      throw new Error('Error al obtener órdenes de Rappi');
    }
  }

  // Obtener detalle de una orden
  async getOrderDetails(orderId) {
    try {
      const response = await this.client.get(`/restaurants-integrations-public-api/orders/${orderId}`, {
        params: { store_id: this.config.credentials.storeId }
      });
      return response.data;
    } catch (error) {
      logger.error('Error obteniendo detalle de orden:', error.response?.data || error.message);
      throw new Error('Error al obtener detalle de orden');
    }
  }

  // Aceptar orden
  async acceptOrder(orderId) {
    try {
      const response = await this.client.post(
        `/restaurants-integrations-public-api/orders/${orderId}/accept`,
        { store_id: this.config.credentials.storeId }
      );
      return response.data;
    } catch (error) {
      logger.error('Error aceptando orden:', error.response?.data || error.message);
      throw new Error('Error al aceptar orden');
    }
  }

  // Rechazar orden
  async rejectOrder(orderId, reason) {
    try {
      const response = await this.client.post(
        `/restaurants-integrations-public-api/orders/${orderId}/reject`,
        { 
          store_id: this.config.credentials.storeId,
          reason: reason || 'No disponible'
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error rechazando orden:', error.response?.data || error.message);
      throw new Error('Error al rechazar orden');
    }
  }

  // Marcar orden como lista
  async markOrderReady(orderId) {
    try {
      const response = await this.client.post(
        `/restaurants-integrations-public-api/orders/${orderId}/ready`,
        { store_id: this.config.credentials.storeId }
      );
      return response.data;
    } catch (error) {
      logger.error('Error marcando orden como lista:', error.response?.data || error.message);
      throw new Error('Error al marcar orden como lista');
    }
  }

  // Transformar orden de Rappi a formato interno
  transformOrder(rappiOrder) {
    return {
      orderNumber: rappiOrder.id,
      customer: {
        name: rappiOrder.client?.name || 'Cliente',
        phone: rappiOrder.client?.phone || '',
        address: rappiOrder.address?.full_address || ''
      },
      items: rappiOrder.products?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.toppings?.map(topping => ({
          name: topping.name,
          price: topping.price
        })) || []
      })) || [],
      subtotal: rappiOrder.total_value - rappiOrder.delivery_fee || 0,
      tax: rappiOrder.tax || 0,
      deliveryFee: rappiOrder.delivery_fee || 0,
      total: rappiOrder.total_value || 0,
      paymentMethod: rappiOrder.payment_method || 'ONLINE',
      orderTime: new Date(rappiOrder.created_at),
      deliveryTime: rappiOrder.estimated_delivery_time ? new Date(rappiOrder.estimated_delivery_time) : null
    };
  }
}

module.exports = RappiService;
