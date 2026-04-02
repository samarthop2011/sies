const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
exports.getTeachers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'teacher' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
exports.updateTeacher = async (req, res, next) => {
  try {
    const { name, email, subjects, isActive } = req.body;
    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (subjects) teacher.subjects = subjects;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();
    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await teacher.deleteOne();
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    next(error);
  }
};
