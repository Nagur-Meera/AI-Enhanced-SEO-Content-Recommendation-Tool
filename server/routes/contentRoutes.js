const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createContent,
  getAllContent,
  getContent,
  updateContent,
  deleteContent,
  getContentStats
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

// Validation rules
const contentValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .post(contentValidation, createContent)
  .get(getAllContent);

router.get('/stats', getContentStats);

router.route('/:id')
  .get(getContent)
  .put(updateContent)
  .delete(deleteContent);

module.exports = router;
