const Result = require('../models/Result');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get results (filtered)
// @route   GET /api/results
exports.getResults = async (req, res, next) => {
  try {
    const { student, class: cls, section, examType, academicYear } = req.query;
    const filter = {};

    // Students can only see their own results
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (student) {
      filter.student = student;
    }

    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;

    const results = await Result.find(filter)
      .populate('student', 'name email class section')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email class section')
      .populate('uploadedBy', 'name');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Students can only view their own
    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Create result
// @route   POST /api/results
exports.createResult = async (req, res, next) => {
  try {
    const { student, examType, class: cls, section, subjects, remarks, academicYear } = req.body;

    const studentUser = await User.findById(student);
    if (!studentUser || studentUser.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const result = await Result.create({
      student,
      studentName: studentUser.name,
      examType,
      class: cls || studentUser.class,
      section: section || studentUser.section,
      subjects,
      remarks,
      academicYear,
      uploadedBy: req.user._id
    });

    // Create notification for student
    await Notification.create({
      user: student,
      message: `New ${examType} results have been uploaded`,
      type: 'result',
      link: `/student/results`
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create results
// @route   POST /api/results/bulk
exports.bulkCreateResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    const created = [];

    for (const r of results) {
      const studentUser = await User.findById(r.student);
      if (!studentUser) continue;

      const result = await Result.create({
        student: r.student,
        studentName: studentUser.name,
        examType: r.examType,
        class: r.class || studentUser.class,
        section: r.section || studentUser.section,
        subjects: r.subjects,
        remarks: r.remarks || '',
        academicYear: r.academicYear,
        uploadedBy: req.user._id
      });
      created.push(result);

      await Notification.create({
        user: r.student,
        message: `New ${r.examType} results have been uploaded`,
        type: 'result'
      });
    }

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    next(error);
  }
};

// @desc    Update result
// @route   PUT /api/results/:id
exports.updateResult = async (req, res, next) => {
  try {
    let result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    const { subjects, remarks, examType } = req.body;
    if (subjects) result.subjects = subjects;
    if (remarks !== undefined) result.remarks = remarks;
    if (examType) result.examType = examType;

    await result.save(); // triggers pre-save hook for recalculation

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
exports.deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    await result.deleteOne();
    res.json({ success: true, message: 'Result deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/results/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { class: cls, section, examType, academicYear } = req.query;
    const filter = {};
    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;

    // For students, only their own results
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }

    const results = await Result.find(filter);

    if (results.length === 0) {
      return res.json({ success: true, data: { totalResults: 0 } });
    }

    // Class average
    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

    // Grade distribution
    const gradeDistribution = {};
    results.forEach(r => {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    });

    // Subject-wise averages
    const subjectMap = {};
    results.forEach(r => {
      r.subjects.forEach(s => {
        if (!subjectMap[s.name]) {
          subjectMap[s.name] = { total: 0, max: 0, count: 0 };
        }
        subjectMap[s.name].total += s.marksObtained;
        subjectMap[s.name].max += s.totalMarks;
        subjectMap[s.name].count += 1;
      });
    });

    const subjectAverages = Object.entries(subjectMap).map(([name, data]) => ({
      name,
      average: parseFloat(((data.total / data.max) * 100).toFixed(2)),
      count: data.count
    }));

    // Top students
    const topStudents = [...results]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)
      .map(r => ({
        studentName: r.studentName,
        percentage: r.percentage,
        grade: r.grade,
        class: r.class,
        section: r.section
      }));

    res.json({
      success: true,
      data: {
        totalResults: results.length,
        averagePercentage: parseFloat(avgPercentage.toFixed(2)),
        gradeDistribution,
        subjectAverages,
        topStudents
      }
    });
  } catch (error) {
    next(error);
  }
};
