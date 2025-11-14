import api from './api';

const pedidosyaService = {
  // Configurar PedidosYa
  configure: async (data) => {
    const response = await api.post('/pedidosya/configure', data);
    return response.data;
  },

  // Obtener configuración
  getConfig: async () => {
    const response = await api.get('/pedidosya/config');
    return response.data;
  },

  // Actualizar configuración
  updateConfig: async (data) => {
    const response = await api.put('/pedidosya/config', data);
    return response.data;
  },

  // Probar conexión
  testConnection: async () => {
    const response = await api.post('/pedidosya/test-connection');
    return response.data;
  },

  // Obtener órdenes
  getOrders: async (params) => {
    const response = await api.get('/pedidosya/orders', { params });
    return response.data;
  },
};

export default pedidosyaService;
