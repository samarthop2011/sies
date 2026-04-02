const express = require('express');
const router = express.Router();
const { getResults, getResult, createResult, bulkCreateResults, updateResult, deleteResult, getAnalytics } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/analytics', protect, getAnalytics);
router.get('/', protect, getResults);
router.get('/:id', protect, getResult);
router.post('/', protect, authorize('teacher', 'principal'), createResult);
router.post('/bulk', protect, authorize('teacher', 'principal'), bulkCreateResults);
router.put('/:id', protect, authorize('teacher', 'principal'), updateResult);
router.delete('/:id', protect, authorize('teacher', 'principal'), deleteResult);

module.exports = router;
