import api from './api';

const revisionService = {
  // Get all revisions for content
  getRevisions: async (contentId) => {
    const response = await api.get(`/revisions/${contentId}`);
    return response.data;
  },

  // Get single revision
  getRevision: async (revisionId) => {
    const response = await api.get(`/revisions/single/${revisionId}`);
    return response.data;
  },

  // Create new revision
  createRevision: async (contentId, changes) => {
    const response = await api.post(`/revisions/${contentId}`, { changes });
    return response.data;
  },

  // Compare two revisions
  compareRevisions: async (v1, v2) => {
    const response = await api.get(`/revisions/compare/${v1}/${v2}`);
    return response.data;
  },

  // Restore from revision
  restoreRevision: async (revisionId) => {
    const response = await api.post(`/revisions/restore/${revisionId}`);
    return response.data;
  }
};

export default revisionService;
