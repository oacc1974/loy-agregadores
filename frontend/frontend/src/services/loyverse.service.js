import api from './api';

const loyverseService = {
  // Configurar Loyverse
  configure: async (data) => {
    const response = await api.post('/loyverse/configure', data);
    return response.data;
  },

  // Obtener configuración
  getConfig: async () => {
    const response = await api.get('/loyverse/config');
    return response.data;
  },

  // Probar conexión
  testConnection: async () => {
    const response = await api.post('/loyverse/test-connection');
    return response.data;
  },

  // Obtener tiendas
  getStores: async () => {
    const response = await api.get('/loyverse/stores');
    return response.data;
  },

  // Obtener items
  getItems: async (params) => {
    const response = await api.get('/loyverse/items', { params });
    return response.data;
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/loyverse/categories');
    return response.data;
  },
};

export default loyverseService;
