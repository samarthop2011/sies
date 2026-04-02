const User = require('../models/User');
const Result = require('../models/Result');

// @desc    Get all students
// @route   GET /api/students
exports.getStudents = async (req, res, next) => {
  try {
    const { class: cls, section, search } = req.query;
    const filter = { role: 'student' };

    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
exports.getStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const results = await Result.find({ student: student._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { student, results } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, email, class: cls, section, isActive } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (cls) student.class = cls;
    if (section) student.section = section;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Result.deleteMany({ student: student._id });
    await student.deleteOne();

    res.json({ success: true, message: 'Student and related data deleted' });
  } catch (error) {
    next(error);
  }
};
