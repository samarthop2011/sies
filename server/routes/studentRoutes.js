const express = require('express');
const router = express.Router();
const { getStudents, getStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('teacher', 'principal'), getStudents);
router.get('/:id', protect, authorize('teacher', 'principal'), getStudent);
router.put('/:id', protect, authorize('teacher', 'principal'), updateStudent);
router.delete('/:id', protect, authorize('principal'), deleteStudent);

module.exports = router;
