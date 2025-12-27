const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentHtml: {
    type: String,
    default: ''
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SEOAnalysis'
  },
  changes: {
    type: String,
    default: 'Initial version'
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
revisionSchema.index({ contentId: 1, version: -1 });
revisionSchema.index({ contentId: 1, createdAt: -1 });

module.exports = mongoose.model('Revision', revisionSchema);
