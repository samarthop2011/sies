const express = require('express');
const router = express.Router();
const { getPapers, uploadPaper, deletePaper } = require('../controllers/paperController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/', protect, getPapers);
router.post('/', protect, authorize('teacher', 'principal'), upload.single('file'), uploadPaper);
router.delete('/:id', protect, authorize('teacher', 'principal'), deletePaper);

module.exports = router;
