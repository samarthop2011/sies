const express = require('express');
const router = express.Router();
const { getTeachers, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('principal'), getTeachers);
router.put('/:id', protect, authorize('principal'), updateTeacher);
router.delete('/:id', protect, authorize('principal'), deleteTeacher);

module.exports = router;
