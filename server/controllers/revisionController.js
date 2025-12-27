const Revision = require('../models/Revision');
const Content = require('../models/Content');

/**
 * @desc    Get all revisions for content
 * @route   GET /api/revisions/:contentId
 * @access  Private
 */
const getRevisions = async (req, res) => {
  try {
    // Verify content belongs to user
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

    const revisions = await Revision.find({ contentId: req.params.contentId })
      .sort({ version: -1 })
      .populate('analysis', 'overallScore');

    res.json({
      success: true,
      count: revisions.length,
      data: revisions
    });
  } catch (error) {
    console.error('Get revisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revisions',
      error: error.message
    });
  }
};

/**
 * @desc    Get single revision
 * @route   GET /api/revisions/single/:revisionId
 * @access  Private
 */
const getRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.revisionId)
      .populate('analysis');

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revision not found'
      });
    }

    // Verify content belongs to user
    const content = await Content.findOne({
      _id: revision.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: revision
    });
  } catch (error) {
    console.error('Get revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revision',
      error: error.message
    });
  }
};

/**
 * @desc    Compare two revisions
 * @route   GET /api/revisions/compare/:v1/:v2
 * @access  Private
 */
const compareRevisions = async (req, res) => {
  try {
    const { v1, v2 } = req.params;

    const revision1 = await Revision.findById(v1).populate('analysis');
    const revision2 = await Revision.findById(v2).populate('analysis');

    if (!revision1 || !revision2) {
      return res.status(404).json({
        success: false,
        message: 'One or both revisions not found'
      });
    }

    // Verify same content
    if (revision1.contentId.toString() !== revision2.contentId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Revisions must be from the same content'
      });
    }

    // Verify content belongs to user
    const content = await Content.findOne({
      _id: revision1.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Calculate differences
    const comparison = {
      revision1: {
        version: revision1.version,
        title: revision1.title,
        seoScore: revision1.seoScore,
        wordCount: revision1.wordCount,
        createdAt: revision1.createdAt,
        content: revision1.content
      },
      revision2: {
        version: revision2.version,
        title: revision2.title,
        seoScore: revision2.seoScore,
        wordCount: revision2.wordCount,
        createdAt: revision2.createdAt,
        content: revision2.content
      },
      differences: {
        scoreChange: revision2.seoScore - revision1.seoScore,
        wordCountChange: revision2.wordCount - revision1.wordCount
      }
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Compare revisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing revisions',
      error: error.message
    });
  }
};

/**
 * @desc    Create new revision manually
 * @route   POST /api/revisions/:contentId
 * @access  Private
 */
const createRevision = async (req, res) => {
  try {
    const { changes } = req.body;

    // Verify content belongs to user
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

    // Get current revision count
    const revisionCount = await Revision.countDocuments({ contentId: content._id });

    const revision = await Revision.create({
      contentId: content._id,
      version: revisionCount + 1,
      title: content.title,
      content: content.content,
      contentHtml: content.contentHtml,
      seoScore: content.currentSEOScore,
      changes: changes || 'Manual revision',
      wordCount: content.wordCount
    });

    // Update content with new revision
    content.revisions.push(revision._id);
    await content.save();

    res.status(201).json({
      success: true,
      data: revision
    });
  } catch (error) {
    console.error('Create revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating revision',
      error: error.message
    });
  }
};

/**
 * @desc    Restore content from revision
 * @route   POST /api/revisions/restore/:revisionId
 * @access  Private
 */
const restoreRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: 'Revision not found'
      });
    }

    // Verify content belongs to user
    const content = await Content.findOne({
      _id: revision.contentId,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create new revision for current state before restoring
    const revisionCount = await Revision.countDocuments({ contentId: content._id });
    
    const newRevision = await Revision.create({
      contentId: content._id,
      version: revisionCount + 1,
      title: revision.title,
      content: revision.content,
      contentHtml: revision.contentHtml,
      seoScore: revision.seoScore,
      changes: `Restored from version ${revision.version}`,
      wordCount: revision.wordCount
    });

    // Update content with restored values
    content.title = revision.title;
    content.content = revision.content;
    content.contentHtml = revision.contentHtml;
    content.currentSEOScore = revision.seoScore;
    content.revisions.push(newRevision._id);
    await content.save();

    res.json({
      success: true,
      message: `Content restored from version ${revision.version}`,
      data: content
    });
  } catch (error) {
    console.error('Restore revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring revision',
      error: error.message
    });
  }
};

module.exports = {
  getRevisions,
  getRevision,
  compareRevisions,
  createRevision,
  restoreRevision
};
