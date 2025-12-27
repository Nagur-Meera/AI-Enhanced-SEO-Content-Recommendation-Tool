const express = require('express');
const router = express.Router();
const {
  analyzeContent,
  getAnalysis,
  getKeywordSuggestions,
  applySuggestion,
  getAnalysisHistory,
  generateOutline,
  getBasicMetrics
} = require('../controllers/seoController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Analysis routes
router.post('/analyze/:contentId', analyzeContent);
router.get('/analysis/:contentId', getAnalysis);
router.get('/history/:contentId', getAnalysisHistory);

// Keyword routes
router.get('/keywords/:contentId', getKeywordSuggestions);

// Suggestion routes
router.post('/apply-suggestion', applySuggestion);

// Utility routes
router.post('/outline', generateOutline);
router.post('/basic-metrics', getBasicMetrics);

module.exports = router;
