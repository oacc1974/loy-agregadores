const axios = require('axios');
const logger = require('../utils/logger');

class UberService {
  constructor(config) {
    this.config = config;
    this.baseURL = process.env.UBER_API_URL || 'https://api.uber.com/v1/eats';
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
      const response = await axios.post('https://login.uber.com/oauth/v2/token', {
        client_id: this.config.credentials.clientId,
        client_secret: this.config.credentials.clientSecret,
        grant_type: 'client_credentials',
        scope: 'eats.store'
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      logger.error('Error obteniendo token de Uber:', error.response?.data || error.message);
      throw new Error('Error al obtener token de acceso de Uber');
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
      
      // Intentar obtener información de la tienda
      const response = await this.client.get(`/stores/${this.config.credentials.storeId}`);
      
      return {
        success: true,
        message: 'Conexión exitosa con Uber Eats',
        store: response.data
      };
    } catch (error) {
      logger.error('Error probando conexión con Uber:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con Uber Eats'
      };
    }
  }

  // Obtener órdenes
  async getOrders(params = {}) {
    try {
      const { startDate, endDate, status } = params;
      
      const queryParams = {
        start_date: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end_date: endDate || new Date().toISOString(),
        ...(status && { status })
      };

      const response = await this.client.get(`/stores/${this.config.credentials.storeId}/orders`, {
        params: queryParams
      });

      return response.data.orders || [];
    } catch (error) {
      logger.error('Error obteniendo órdenes de Uber:', error.response?.data || error.message);
      throw new Error('Error al obtener órdenes de Uber Eats');
    }
  }

  // Obtener detalle de una orden
  async getOrderDetails(orderId) {
    try {
      const response = await this.client.get(`/stores/${this.config.credentials.storeId}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      logger.error('Error obteniendo detalle de orden:', error.response?.data || error.message);
      throw new Error('Error al obtener detalle de orden');
    }
  }

  // Obtener menú
  async getMenu() {
    try {
      const response = await this.client.get(`/stores/${this.config.credentials.storeId}/menus`);
      return response.data;
    } catch (error) {
      logger.error('Error obteniendo menú de Uber:', error.response?.data || error.message);
      throw new Error('Error al obtener menú de Uber Eats');
    }
  }

  // Actualizar estado de orden
  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.client.post(
        `/stores/${this.config.credentials.storeId}/orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      logger.error('Error actualizando estado de orden:', error.response?.data || error.message);
      throw new Error('Error al actualizar estado de orden');
    }
  }

  // Transformar orden de Uber a formato interno
  transformOrder(uberOrder) {
    return {
      orderNumber: uberOrder.display_id || uberOrder.id,
      customer: {
        name: uberOrder.eater?.first_name + ' ' + uberOrder.eater?.last_name || 'Cliente',
        phone: uberOrder.eater?.phone || '',
        address: uberOrder.delivery?.location?.address || ''
      },
      items: uberOrder.cart?.items?.map(item => ({
        name: item.title,
        quantity: item.quantity,
        price: item.price / 100, // Uber usa centavos
        modifiers: item.selected_modifier_groups?.flatMap(group =>
          group.selected_items?.map(mod => ({
            name: mod.title,
            price: mod.price / 100
          }))
        ) || []
      })) || [],
      subtotal: uberOrder.payment?.charges?.subtotal / 100 || 0,
      tax: uberOrder.payment?.charges?.tax / 100 || 0,
      deliveryFee: uberOrder.payment?.charges?.delivery_fee / 100 || 0,
      total: uberOrder.payment?.charges?.total / 100 || 0,
      paymentMethod: uberOrder.payment?.type || 'ONLINE',
      orderTime: new Date(uberOrder.placed_at),
      deliveryTime: uberOrder.estimated_ready_for_pickup_at ? new Date(uberOrder.estimated_ready_for_pickup_at) : null
    };
  }
}

module.exports = UberService;
