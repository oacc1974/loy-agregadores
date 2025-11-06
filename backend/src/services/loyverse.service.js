const axios = require('axios');
const logger = require('../utils/logger');

class LoyverseService {
  constructor(config) {
    this.config = config;
    this.baseURL = process.env.LOYVERSE_API_URL || 'https://api.loyverse.com/v1.0';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.credentials.accessToken}`
      }
    });
  }

  // Probar conexión
  async testConnection() {
    try {
      const response = await this.client.get('/stores');
      
      return {
        success: true,
        message: 'Conexión exitosa con Loyverse',
        stores: response.data.stores
      };
    } catch (error) {
      logger.error('Error probando conexión con Loyverse:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con Loyverse'
      };
    }
  }

  // Obtener tiendas
  async getStores() {
    try {
      const response = await this.client.get('/stores');
      return response.data.stores || [];
    } catch (error) {
      logger.error('Error obteniendo tiendas de Loyverse:', error.response?.data || error.message);
      throw new Error('Error al obtener tiendas de Loyverse');
    }
  }

  // Obtener productos/items
  async getItems(params = {}) {
    try {
      const response = await this.client.get('/items', { params });
      return response.data.items || [];
    } catch (error) {
      logger.error('Error obteniendo items de Loyverse:', error.response?.data || error.message);
      throw new Error('Error al obtener items de Loyverse');
    }
  }

  // Obtener categorías
  async getCategories() {
    try {
      const response = await this.client.get('/categories');
      return response.data.categories || [];
    } catch (error) {
      logger.error('Error obteniendo categorías de Loyverse:', error.response?.data || error.message);
      throw new Error('Error al obtener categorías de Loyverse');
    }
  }

  // Crear recibo (receipt)
  async createReceipt(orderData) {
    try {
      const receiptData = this.transformOrderToReceipt(orderData);
      const response = await this.client.post('/receipts', receiptData);
      
      logger.info('Recibo creado en Loyverse:', response.data.receipt_number);
      return response.data;
    } catch (error) {
      logger.error('Error creando recibo en Loyverse:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al crear recibo en Loyverse');
    }
  }

  // Obtener recibos
  async getReceipts(params = {}) {
    try {
      const response = await this.client.get('/receipts', { params });
      return response.data.receipts || [];
    } catch (error) {
      logger.error('Error obteniendo recibos de Loyverse:', error.response?.data || error.message);
      throw new Error('Error al obtener recibos de Loyverse');
    }
  }

  // Transformar orden a formato de recibo de Loyverse
  transformOrderToReceipt(orderData) {
    const lineItems = orderData.items.map(item => {
      const itemTotal = item.price * item.quantity;
      const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + (mod.price || 0), 0) || 0;
      
      return {
        item_id: item.loyverseItemId || null, // Si está mapeado
        line_note: item.name,
        quantity: item.quantity,
        price: item.price + modifiersTotal,
        cost: 0, // Costo no disponible desde agregador
        line_modifiers: item.modifiers?.map(mod => ({
          name: mod.name,
          price: mod.price
        })) || []
      };
    });

    // Agregar delivery fee como item adicional si existe
    if (orderData.deliveryFee > 0) {
      lineItems.push({
        line_note: 'Delivery Fee',
        quantity: 1,
        price: orderData.deliveryFee,
        cost: 0
      });
    }

    return {
      store_id: this.config.credentials.storeId,
      pos_id: this.config.credentials.posId || null,
      employee_id: this.config.settings.employeeId || null,
      receipt_type: 'SELL',
      receipt_date: orderData.orderTime,
      note: `Orden ${orderData.orderNumber} - ${orderData.customer.name}`,
      line_items: lineItems,
      payments: [{
        payment_type_id: this.getPaymentTypeId(orderData.paymentMethod),
        amount: orderData.total
      }],
      total_money: orderData.total,
      total_tax: orderData.tax || 0,
      customer: {
        name: orderData.customer.name,
        phone_number: orderData.customer.phone
      }
    };
  }

  // Mapear tipo de pago
  getPaymentTypeId(paymentMethod) {
    // Buscar en el mapeo de configuración
    const mapping = this.config.mapping?.paymentMapping?.find(
      m => m.aggregatorPayment === paymentMethod
    );
    
    if (mapping) {
      return mapping.loyversePayment;
    }

    // Valores por defecto
    const defaultMapping = {
      'CASH': 'CASH',
      'CARD': 'CARD',
      'ONLINE': 'CARD',
      'CREDIT_CARD': 'CARD',
      'DEBIT_CARD': 'CARD'
    };

    return defaultMapping[paymentMethod] || this.config.settings.defaultPaymentType || 'CASH';
  }

  // Buscar item por nombre
  async findItemByName(name) {
    try {
      const items = await this.getItems({ item_name: name });
      return items.find(item => 
        item.item_name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      logger.error('Error buscando item:', error);
      return null;
    }
  }
}

module.exports = LoyverseService;
