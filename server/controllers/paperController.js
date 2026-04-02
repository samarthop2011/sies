const Paper = require('../models/Paper');
const Notification = require('../models/Notification');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get papers (filtered)
// @route   GET /api/papers
exports.getPapers = async (req, res, next) => {
  try {
    const { class: cls, section, examType, subject } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.class = req.user.class;
      filter.section = req.user.section;
    }

    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;

    const papers = await Paper.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: papers.length, data: papers });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload paper
// @route   POST /api/papers
exports.uploadPaper = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, examType, class: cls, section, subject } = req.body;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    const paper = await Paper.create({
      title,
      examType,
      class: cls,
      section,
      subject,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      originalName: req.file.originalname,
      uploadedBy: req.user._id
    });

    // Notify students of the class
    const students = await User.find({ role: 'student', class: cls, section });
    const notifications = students.map(s => ({
      user: s._id,
      message: `New ${subject} ${examType} paper uploaded: "${title}"`,
      type: 'paper',
      link: '/student/papers'
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete paper
// @route   DELETE /api/papers/:id
exports.deletePaper = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', paper.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await paper.deleteOne();
    res.json({ success: true, message: 'Paper deleted' });
  } catch (error) {
    next(error);
  }
};
