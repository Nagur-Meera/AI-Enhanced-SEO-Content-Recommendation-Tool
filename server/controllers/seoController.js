const Content = require('../models/Content');
const Revision = require('../models/Revision');
const SEOAnalysis = require('../models/SEOAnalysis');
const openaiService = require('../services/openaiService');
const seoAnalyzer = require('../services/seoAnalyzer');

/**
 * @desc    Analyze content with AI
 * @route   POST /api/seo/analyze/:contentId
 * @access  Private
 */
const analyzeContent = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update status to analyzing
    content.status = 'analyzing';
    await content.save();

    // Get AI analysis from OpenAI
    const aiAnalysis = await openaiService.analyzeContent(
      content.title,
      content.content,
      content.targetKeywords
    );

    // Get basic metrics
    const basicMetrics = seoAnalyzer.analyzeBasicMetrics(
      content.title,
      content.content,
      content.targetKeywords
    );

    // Create SEO Analysis record
    const seoAnalysis = await SEOAnalysis.create({
      contentId: content._id,
      overallScore: aiAnalysis.overallScore,
      scores: aiAnalysis.scores,
      suggestedKeywords: aiAnalysis.suggestedKeywords,
      improvements: aiAnalysis.improvements.map(imp => ({
        ...imp,
        applied: false
      })),
      aiInsights: aiAnalysis.aiInsights,
      suggestedTitle: aiAnalysis.suggestedTitle,
      suggestedMetaDescription: aiAnalysis.suggestedMetaDescription
    });

    // Update content with new score and analysis reference
    content.currentSEOScore = aiAnalysis.overallScore;
    content.latestAnalysis = seoAnalysis._id;
    content.status = 'optimized';
    await content.save();

    // Update latest revision with analysis
    const latestRevision = await Revision.findOne({ contentId: content._id })
      .sort({ version: -1 });
    
    if (latestRevision) {
      latestRevision.analysis = seoAnalysis._id;
      latestRevision.seoScore = aiAnalysis.overallScore;
      await latestRevision.save();
    }

    res.json({
      success: true,
      data: {
        analysis: seoAnalysis,
        basicMetrics,
        content: {
          _id: content._id,
          title: content.title,
          currentSEOScore: content.currentSEOScore,
          status: content.status
        }
      }
    });
  } catch (error) {
    console.error('Analyze content error:', error);
    
    // Reset status on error
    await Content.findByIdAndUpdate(req.params.contentId, { status: 'draft' });
    
    res.status(500).json({
      success: false,
      message: 'Error analyzing content',
      error: error.message
    });
  }
};

/**
 * @desc    Get latest analysis for content
 * @route   GET /api/seo/analysis/:contentId
 * @access  Private
 */
const getAnalysis = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const analysis = await SEOAnalysis.findOne({ contentId: content._id })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found. Please analyze the content first.'
      });
    }

    // Get basic metrics
    const basicMetrics = seoAnalyzer.analyzeBasicMetrics(
      content.title,
      content.content,
      content.targetKeywords
    );

    // Get checklist
    const checklist = seoAnalyzer.generateChecklist(
      content.title,
      content.content,
      content.metaDescription,
      content.targetKeywords
    );

    res.json({
      success: true,
      data: {
        analysis,
        basicMetrics,
        checklist
      }
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get keyword suggestions
 * @route   GET /api/seo/keywords/:contentId
 * @access  Private
 */
const getKeywordSuggestions = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Generate new keyword suggestions
    const suggestions = await openaiService.generateKeywordSuggestions(
      content.title,
      content.targetKeywords
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get keyword suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching keyword suggestions',
      error: error.message
    });
  }
};

/**
 * @desc    Apply an AI suggestion
 * @route   POST /api/seo/apply-suggestion
 * @access  Private
 */
const applySuggestion = async (req, res) => {
  try {
    const { contentId, suggestionIndex, applyType } = req.body;

    const content = await Content.findOne({
      _id: contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const analysis = await SEOAnalysis.findOne({ contentId })
      .sort({ createdAt: -1 });

    if (!analysis || !analysis.improvements[suggestionIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    const suggestion = analysis.improvements[suggestionIndex];

    if (applyType === 'auto') {
      // Use AI to apply the suggestion
      const improvedContent = await openaiService.generateImprovedContent(
        content.content,
        suggestion.suggestion,
        suggestion.category
      );

      // Create new revision
      const revisionCount = await Revision.countDocuments({ contentId: content._id });
      
      const revision = await Revision.create({
        contentId: content._id,
        version: revisionCount + 1,
        title: content.title,
        content: improvedContent,
        seoScore: content.currentSEOScore,
        changes: `Applied suggestion: ${suggestion.suggestion}`,
        wordCount: improvedContent.trim().split(/\s+/).length
      });

      content.content = improvedContent;
      content.revisions.push(revision._id);
      await content.save();
    }

    // Mark suggestion as applied
    analysis.improvements[suggestionIndex].applied = true;
    analysis.improvements[suggestionIndex].appliedAt = new Date();
    await analysis.save();

    res.json({
      success: true,
      message: 'Suggestion applied successfully',
      data: {
        content: applyType === 'auto' ? content : null,
        suggestion: analysis.improvements[suggestionIndex]
      }
    });
  } catch (error) {
    console.error('Apply suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying suggestion',
      error: error.message
    });
  }
};

/**
 * @desc    Get analysis history for content
 * @route   GET /api/seo/history/:contentId
 * @access  Private
 */
const getAnalysisHistory = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const analyses = await SEOAnalysis.find({ contentId: content._id })
      .sort({ createdAt: -1 })
      .select('overallScore scores createdAt');

    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
};

/**
 * @desc    Generate content outline
 * @route   POST /api/seo/outline
 * @access  Private
 */
const generateOutline = async (req, res) => {
  try {
    const { topic, keywords } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const outline = await openaiService.generateContentOutline(
      topic,
      keywords || []
    );

    res.json({
      success: true,
      data: outline
    });
  } catch (error) {
    console.error('Generate outline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating outline',
      error: error.message
    });
  }
};

/**
 * @desc    Get basic SEO metrics (without AI)
 * @route   POST /api/seo/basic-metrics
 * @access  Private
 */
const getBasicMetrics = async (req, res) => {
  try {
    const { title, content, targetKeywords, metaDescription } = req.body;

    const metrics = seoAnalyzer.analyzeBasicMetrics(
      title,
      content,
      targetKeywords || []
    );

    const checklist = seoAnalyzer.generateChecklist(
      title,
      content,
      metaDescription,
      targetKeywords || []
    );

    res.json({
      success: true,
      data: {
        metrics,
        checklist
      }
    });
  } catch (error) {
    console.error('Get basic metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating metrics',
      error: error.message
    });
  }
};

module.exports = {
  analyzeContent,
  getAnalysis,
  getKeywordSuggestions,
  applySuggestion,
  getAnalysisHistory,
  generateOutline,
  getBasicMetrics
};
