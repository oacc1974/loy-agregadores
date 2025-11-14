const axios = require('axios');
const logger = require('../utils/logger');

class PedidosYaService {
  constructor(config) {
    this.config = config;
    this.baseURL = process.env.PEDIDOSYA_API_URL || 'https://api.pedidosya.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Obtener access token
  async getAccessToken() {
    try {
      const response = await axios.post('https://auth.pedidosya.com/oauth/token', {
        client_id: this.config.credentials.clientId,
        client_secret: this.config.credentials.clientSecret,
        grant_type: 'client_credentials',
        scope: 'restaurants:read orders:read orders:write'
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      logger.error('Error obteniendo token de PedidosYa:', error.response?.data || error.message);
      throw new Error('Error al obtener token de acceso de PedidosYa');
    }
  }

  // Configurar token en el cliente
  setAccessToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Probar conexión
  async testConnection() {
    try {
      const tokenData = await this.getAccessToken();
      this.setAccessToken(tokenData.accessToken);
      
      // Intentar obtener información del restaurante
      const response = await this.client.get(`/restaurants/${this.config.credentials.restaurantId}`);
      
      return {
        success: true,
        message: 'Conexión exitosa con PedidosYa',
        restaurant: response.data
      };
    } catch (error) {
      logger.error('Error probando conexión con PedidosYa:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con PedidosYa'
      };
    }
  }

  // Obtener órdenes
  async getOrders(params = {}) {
    try {
      const { startDate, endDate, status } = params;
      
      const queryParams = {
        restaurant_id: this.config.credentials.restaurantId,
        start_date: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end_date: endDate || new Date().toISOString(),
        ...(status && { status })
      };

      const response = await this.client.get('/orders', {
        params: queryParams
      });

      return response.data.orders || [];
    } catch (error) {
      logger.error('Error obteniendo órdenes de PedidosYa:', error.response?.data || error.message);
      throw new Error('Error al obtener órdenes de PedidosYa');
    }
  }

  // Obtener detalle de una orden
  async getOrderDetails(orderId) {
    try {
      const response = await this.client.get(`/orders/${orderId}`, {
        params: { restaurant_id: this.config.credentials.restaurantId }
      });
      return response.data;
    } catch (error) {
      logger.error('Error obteniendo detalle de orden:', error.response?.data || error.message);
      throw new Error('Error al obtener detalle de orden');
    }
  }

  // Confirmar orden
  async confirmOrder(orderId) {
    try {
      const response = await this.client.post(`/orders/${orderId}/confirm`, {
        restaurant_id: this.config.credentials.restaurantId
      });
      return response.data;
    } catch (error) {
      logger.error('Error confirmando orden:', error.response?.data || error.message);
      throw new Error('Error al confirmar orden');
    }
  }

  // Rechazar orden
  async rejectOrder(orderId, reason) {
    try {
      const response = await this.client.post(`/orders/${orderId}/reject`, {
        restaurant_id: this.config.credentials.restaurantId,
        reason: reason || 'No disponible'
      });
      return response.data;
    } catch (error) {
      logger.error('Error rechazando orden:', error.response?.data || error.message);
      throw new Error('Error al rechazar orden');
    }
  }

  // Marcar orden como lista para recoger
  async markOrderReady(orderId) {
    try {
      const response = await this.client.post(`/orders/${orderId}/ready`, {
        restaurant_id: this.config.credentials.restaurantId
      });
      return response.data;
    } catch (error) {
      logger.error('Error marcando orden como lista:', error.response?.data || error.message);
      throw new Error('Error al marcar orden como lista');
    }
  }

  // Transformar orden de PedidosYa a formato interno
  transformOrder(pedidosYaOrder) {
    return {
      orderNumber: pedidosYaOrder.id,
      customer: {
        name: pedidosYaOrder.customer?.name || 'Cliente',
        phone: pedidosYaOrder.customer?.phone || '',
        address: pedidosYaOrder.delivery_address?.address || ''
      },
      items: pedidosYaOrder.products?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.options?.map(option => ({
          name: option.name,
          price: option.price
        })) || []
      })) || [],
      subtotal: pedidosYaOrder.subtotal || 0,
      tax: pedidosYaOrder.tax || 0,
      deliveryFee: pedidosYaOrder.shipping || 0,
      total: pedidosYaOrder.total || 0,
      paymentMethod: pedidosYaOrder.payment_method || 'ONLINE',
      orderTime: new Date(pedidosYaOrder.created_at),
      deliveryTime: pedidosYaOrder.estimated_delivery_time ? new Date(pedidosYaOrder.estimated_delivery_time) : null
    };
  }
}

module.exports = PedidosYaService;
