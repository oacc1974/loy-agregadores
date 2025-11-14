import api from './api';

const rappiService = {
  // Configurar Rappi
  configure: async (data) => {
    const response = await api.post('/rappi/configure', data);
    return response.data;
  },

  // Obtener configuración
  getConfig: async () => {
    const response = await api.get('/rappi/config');
    return response.data;
  },

  // Actualizar configuración
  updateConfig: async (data) => {
    const response = await api.put('/rappi/config', data);
    return response.data;
  },

  // Probar conexión
  testConnection: async () => {
    const response = await api.post('/rappi/test-connection');
    return response.data;
  },

  // Obtener órdenes
  getOrders: async (params) => {
    const response = await api.get('/rappi/orders', { params });
    return response.data;
  },
};

export default rappiService;
