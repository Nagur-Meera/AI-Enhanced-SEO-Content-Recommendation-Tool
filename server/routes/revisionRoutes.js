const express = require('express');
const router = express.Router();
const {
  getRevisions,
  getRevision,
  compareRevisions,
  createRevision,
  restoreRevision
} = require('../controllers/revisionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Revision routes
router.get('/:contentId', getRevisions);
router.get('/single/:revisionId', getRevision);
router.post('/:contentId', createRevision);
router.get('/compare/:v1/:v2', compareRevisions);
router.post('/restore/:revisionId', restoreRevision);

module.exports = router;
