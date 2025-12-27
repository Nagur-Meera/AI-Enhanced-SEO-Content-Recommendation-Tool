const mongoose = require('mongoose');

const seoAnalysisSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  revisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Revision'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  scores: {
    keywordDensity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    readability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    titleOptimization: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    metaDescription: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    headingStructure: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    contentLength: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    keywordPlacement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  suggestedKeywords: [{
    keyword: {
      type: String,
      required: true
    },
    relevance: {
      type: Number,
      min: 0,
      max: 100
    },
    searchVolume: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  improvements: [{
    category: {
      type: String,
      required: true
    },
    suggestion: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    impact: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    applied: {
      type: Boolean,
      default: false
    },
    appliedAt: Date
  }],
  aiInsights: {
    type: String,
    default: ''
  },
  competitorAnalysis: {
    type: String,
    default: ''
  },
  suggestedTitle: {
    type: String,
    default: ''
  },
  suggestedMetaDescription: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
seoAnalysisSchema.index({ contentId: 1, createdAt: -1 });
seoAnalysisSchema.index({ overallScore: -1 });

module.exports = mongoose.model('SEOAnalysis', seoAnalysisSchema);
