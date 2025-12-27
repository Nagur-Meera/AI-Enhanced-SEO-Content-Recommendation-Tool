require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const seoRoutes = require('./routes/seoRoutes');
const revisionRoutes = require('./routes/revisionRoutes');

// Initialize express
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/revisions', revisionRoutes);

// Root route - for Render health checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI-Enhanced SEO Content Tool API',
    docs: '/api'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SEO Content Tool API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AI-Enhanced SEO Content Recommendation Tool API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/password'
      },
      content: {
        create: 'POST /api/content',
        getAll: 'GET /api/content',
        getOne: 'GET /api/content/:id',
        update: 'PUT /api/content/:id',
        delete: 'DELETE /api/content/:id',
        stats: 'GET /api/content/stats'
      },
      seo: {
        analyze: 'POST /api/seo/analyze/:contentId',
        getAnalysis: 'GET /api/seo/analysis/:contentId',
        keywords: 'GET /api/seo/keywords/:contentId',
        applySuggestion: 'POST /api/seo/apply-suggestion',
        history: 'GET /api/seo/history/:contentId',
        outline: 'POST /api/seo/outline',
        basicMetrics: 'POST /api/seo/basic-metrics'
      },
      revisions: {
        getAll: 'GET /api/revisions/:contentId',
        getOne: 'GET /api/revisions/single/:revisionId',
        create: 'POST /api/revisions/:contentId',
        compare: 'GET /api/revisions/compare/:v1/:v2',
        restore: 'POST /api/revisions/restore/:revisionId'
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
