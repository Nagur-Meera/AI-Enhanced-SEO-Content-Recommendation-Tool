import api from './api';

const seoService = {
  // Analyze content with AI
  analyzeContent: async (contentId) => {
    const response = await api.post(`/seo/analyze/${contentId}`);
    return response.data;
  },

  // Get latest analysis
  getAnalysis: async (contentId) => {
    const response = await api.get(`/seo/analysis/${contentId}`);
    return response.data;
  },

  // Get keyword suggestions
  getKeywordSuggestions: async (contentId) => {
    const response = await api.get(`/seo/keywords/${contentId}`);
    return response.data;
  },

  // Apply AI suggestion
  applySuggestion: async (contentId, suggestionIndex, applyType = 'manual') => {
    const response = await api.post('/seo/apply-suggestion', {
      contentId,
      suggestionIndex,
      applyType
    });
    return response.data;
  },

  // Get analysis history
  getAnalysisHistory: async (contentId) => {
    const response = await api.get(`/seo/history/${contentId}`);
    return response.data;
  },

  // Generate content outline
  generateOutline: async (topic, keywords) => {
    const response = await api.post('/seo/outline', { topic, keywords });
    return response.data;
  },

  // Get basic SEO metrics
  getBasicMetrics: async (data) => {
    const response = await api.post('/seo/basic-metrics', data);
    return response.data;
  }
};

export default seoService;
