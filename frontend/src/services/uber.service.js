import api from './api';

const uberService = {
  // Configurar Uber
  configure: async (data) => {
    const response = await api.post('/uber/configure', data);
    return response.data;
  },

  // Obtener configuración
  getConfig: async () => {
    const response = await api.get('/uber/config');
    return response.data;
  },

  // Actualizar configuración
  updateConfig: async (data) => {
    const response = await api.put('/uber/config', data);
    return response.data;
  },

  // Probar conexión
  testConnection: async () => {
    const response = await api.post('/uber/test-connection');
    return response.data;
  },

  // Obtener órdenes
  getOrders: async (params) => {
    const response = await api.get('/uber/orders', { params });
    return response.data;
  },

  // Obtener menú
  getMenu: async () => {
    const response = await api.get('/uber/menu');
    return response.data;
  },
};

export default uberService;
