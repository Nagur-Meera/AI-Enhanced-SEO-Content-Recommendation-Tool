import React, { createContext, useContext, useState, useCallback } from 'react';
import contentService from '../services/contentService';
import seoService from '../services/seoService';

const ContentContext = createContext(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [contents, setContents] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch all contents
  const fetchContents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await contentService.getAll(params);
      if (response.success) {
        setContents(response.data);
        return response;
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single content
  const fetchContent = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await contentService.getById(id);
      if (response.success) {
        setCurrentContent(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new content
  const createContent = useCallback(async (contentData) => {
    setLoading(true);
    try {
      const response = await contentService.create(contentData);
      if (response.success) {
        setContents(prev => [response.data, ...prev]);
        setCurrentContent(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update content
  const updateContent = useCallback(async (id, contentData) => {
    setLoading(true);
    try {
      const response = await contentService.update(id, contentData);
      if (response.success) {
        setContents(prev =>
          prev.map(c => (c._id === id ? response.data : c))
        );
        setCurrentContent(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete content
  const deleteContent = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await contentService.delete(id);
      if (response.success) {
        setContents(prev => prev.filter(c => c._id !== id));
        if (currentContent?._id === id) {
          setCurrentContent(null);
        }
        return response;
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentContent]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await contentService.getStats();
      if (response.success) {
        setStats(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }, []);

  // Analyze content with AI
  const analyzeContent = useCallback(async (contentId) => {
    setAnalyzing(true);
    try {
      const response = await seoService.analyzeContent(contentId);
      if (response.success) {
        setCurrentAnalysis(response.data.analysis);
        // Update content with new score
        setCurrentContent(prev => ({
          ...prev,
          currentSEOScore: response.data.content.currentSEOScore,
          status: response.data.content.status
        }));
        setContents(prev =>
          prev.map(c =>
            c._id === contentId
              ? {
                  ...c,
                  currentSEOScore: response.data.content.currentSEOScore,
                  status: response.data.content.status
                }
              : c
          )
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Fetch analysis
  const fetchAnalysis = useCallback(async (contentId) => {
    try {
      const response = await seoService.getAnalysis(contentId);
      if (response.success) {
        setCurrentAnalysis(response.data.analysis);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  }, []);

  // Clear current content
  const clearCurrentContent = useCallback(() => {
    setCurrentContent(null);
    setCurrentAnalysis(null);
  }, []);

  const value = {
    contents,
    currentContent,
    currentAnalysis,
    stats,
    loading,
    analyzing,
    fetchContents,
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    fetchStats,
    analyzeContent,
    fetchAnalysis,
    clearCurrentContent,
    setCurrentContent,
    setCurrentAnalysis
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;
