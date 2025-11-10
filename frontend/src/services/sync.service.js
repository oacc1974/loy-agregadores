import api from './api';

const syncService = {
  // Sincronización manual
  manualSync: async () => {
    const response = await api.post('/sync/manual');
    return response.data;
  },

  // Obtener estado
  getStatus: async () => {
    const response = await api.get('/sync/status');
    return response.data;
  },

  // Obtener logs
  getLogs: async (params) => {
    const response = await api.get('/sync/logs', { params });
    return response.data;
  },

  // Obtener órdenes
  getOrders: async (params) => {
    const response = await api.get('/sync/orders', { params });
    return response.data;
  },

  // Reintentar orden
  retryOrder: async (id) => {
    const response = await api.post(`/sync/orders/${id}/retry`);
    return response.data;
  },
};

export default syncService;
