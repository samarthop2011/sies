const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['unit1', 'unit2', 'midterm', 'final', 'practice'],
    required: [true, 'Exam type is required']
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    default: () => {
      const now = new Date();
      const year = now.getFullYear();
      return now.getMonth() >= 3 ? `${year}-${year+1}` : `${year-1}-${year}`;
    }
  },
  subjects: [{
    name: { type: String, required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1 }
  }],
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  totalMaxMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate totals before saving
resultSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    this.totalMarksObtained = this.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
    this.totalMaxMarks = this.subjects.reduce((sum, s) => sum + s.totalMarks, 0);
    this.percentage = parseFloat(((this.totalMarksObtained / this.totalMaxMarks) * 100).toFixed(2));
    
    // Auto grade
    const p = this.percentage;
    if (p >= 90) this.grade = 'A+';
    else if (p >= 80) this.grade = 'A';
    else if (p >= 70) this.grade = 'B+';
    else if (p >= 60) this.grade = 'B';
    else if (p >= 50) this.grade = 'C';
    else if (p >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
