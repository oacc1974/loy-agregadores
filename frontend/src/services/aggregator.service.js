import api from './api';

const aggregatorService = {
  // Listar agregadores
  getAll: async () => {
    const response = await api.get('/aggregators');
    return response.data;
  },

  // Agregar agregador
  add: async (data) => {
    const response = await api.post('/aggregators', data);
    return response.data;
  },

  // Obtener agregador
  getById: async (id) => {
    const response = await api.get(`/aggregators/${id}`);
    return response.data;
  },

  // Actualizar agregador
  update: async (id, data) => {
    const response = await api.put(`/aggregators/${id}`, data);
    return response.data;
  },

  // Eliminar agregador
  delete: async (id) => {
    const response = await api.delete(`/aggregators/${id}`);
    return response.data;
  },

  // Toggle estado
  toggle: async (id) => {
    const response = await api.post(`/aggregators/${id}/toggle`);
    return response.data;
  },
};

export default aggregatorService;
