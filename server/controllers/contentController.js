const Content = require('../models/Content');
const Revision = require('../models/Revision');
const SEOAnalysis = require('../models/SEOAnalysis');

/**
 * @desc    Create new content draft
 * @route   POST /api/content
 * @access  Private
 */
const createContent = async (req, res) => {
  try {
    const { title, content, contentHtml, metaDescription, targetKeywords } = req.body;

    const newContent = await Content.create({
      userId: req.user._id,
      title,
      content,
      contentHtml,
      metaDescription,
      targetKeywords: targetKeywords || [],
      status: 'draft'
    });

    // Create initial revision
    const revision = await Revision.create({
      contentId: newContent._id,
      version: 1,
      title,
      content,
      contentHtml,
      changes: 'Initial draft created',
      wordCount: newContent.wordCount
    });

    // Update content with revision reference
    newContent.revisions.push(revision._id);
    await newContent.save();

    res.status(201).json({
      success: true,
      data: newContent
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
};

/**
 * @desc    Get all content for user
 * @route   GET /api/content
 * @access  Private
 */
const getAllContent = async (req, res) => {
  try {
    const { status, sort, limit = 10, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) query.status = status;

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'score') sortOption = { currentSEOScore: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const contents = await Content.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('latestAnalysis', 'overallScore suggestedKeywords');

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      count: contents.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: contents
    });
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

/**
 * @desc    Get single content by ID
 * @route   GET /api/content/:id
 * @access  Private
 */
const getContent = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('revisions')
      .populate('latestAnalysis');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

/**
 * @desc    Update content
 * @route   PUT /api/content/:id
 * @access  Private
 */
const updateContent = async (req, res) => {
  try {
    const { title, content, contentHtml, metaDescription, targetKeywords, createRevision } = req.body;

    const existingContent = await Content.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update fields
    existingContent.title = title || existingContent.title;
    existingContent.content = content || existingContent.content;
    existingContent.contentHtml = contentHtml || existingContent.contentHtml;
    existingContent.metaDescription = metaDescription !== undefined ? metaDescription : existingContent.metaDescription;
    existingContent.targetKeywords = targetKeywords || existingContent.targetKeywords;

    // Create new revision if requested
    if (createRevision) {
      const revisionCount = await Revision.countDocuments({ contentId: existingContent._id });
      
      const revision = await Revision.create({
        contentId: existingContent._id,
        version: revisionCount + 1,
        title: existingContent.title,
        content: existingContent.content,
        contentHtml: existingContent.contentHtml,
        seoScore: existingContent.currentSEOScore,
        changes: req.body.changeDescription || 'Content updated',
        wordCount: existingContent.wordCount
      });

      existingContent.revisions.push(revision._id);
    }

    await existingContent.save();

    res.json({
      success: true,
      data: existingContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

/**
 * @desc    Delete content
 * @route   DELETE /api/content/:id
 * @access  Private
 */
const deleteContent = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete associated revisions and analyses
    await Revision.deleteMany({ contentId: content._id });
    await SEOAnalysis.deleteMany({ contentId: content._id });
    await content.deleteOne();

    res.json({
      success: true,
      message: 'Content and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's content statistics
 * @route   GET /api/content/stats
 * @access  Private
 */
const getContentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Content.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalDrafts: { $sum: 1 },
          avgSEOScore: { $avg: '$currentSEOScore' },
          totalWords: { $sum: '$wordCount' },
          publishedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          optimizedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'optimized'] }, 1, 0] }
          },
          draftCount: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent score improvements
    const recentContent = await Content.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title currentSEOScore updatedAt');

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalDrafts: 0,
          avgSEOScore: 0,
          totalWords: 0,
          publishedCount: 0,
          optimizedCount: 0,
          draftCount: 0
        },
        recentContent
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  createContent,
  getAllContent,
  getContent,
  updateContent,
  deleteContent,
  getContentStats
};
