const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  contentHtml: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description should not exceed 160 characters'],
    default: ''
  },
  targetKeywords: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'analyzing', 'optimized', 'published'],
    default: 'draft'
  },
  currentSEOScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  revisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Revision'
  }],
  latestAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SEOAnalysis'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ status: 1 });
contentSchema.index({ currentSEOScore: -1 });

// Pre-save middleware to calculate word count and reading time
contentSchema.pre('save', function(next) {
  if (this.content) {
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema);
