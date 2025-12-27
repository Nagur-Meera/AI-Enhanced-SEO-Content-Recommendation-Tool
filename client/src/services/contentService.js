import api from './api';

const contentService = {
  // Create new content
  create: async (contentData) => {
    const response = await api.post('/content', contentData);
    return response.data;
  },

  // Get all content
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/content?${queryString}`);
    return response.data;
  },

  // Get single content
  getById: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Update content
  update: async (id, contentData) => {
    const response = await api.put(`/content/${id}`, contentData);
    return response.data;
  },

  // Delete content
  delete: async (id) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },

  // Get content statistics
  getStats: async () => {
    const response = await api.get('/content/stats');
    return response.data;
  }
};

export default contentService;
