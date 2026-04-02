export const SUBJECTS = [
  'Mathematics',
  'Science', 
  'English',
  'Hindi',
  'Marathi',
  'Social Studies',
  'Computer Science'
];

export const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];

export const SECTIONS = ['A','B','C','D'];

export const EXAM_TYPES = [
  { value: 'unit1', label: 'Unit Test 1' },
  { value: 'unit2', label: 'Unit Test 2' },
  { value: 'midterm', label: 'Midterm Exam' },
  { value: 'final', label: 'Final Exam' },
  { value: 'practice', label: 'Practice Test' },
];

export const getExamLabel = (value) => {
  const exam = EXAM_TYPES.find(e => e.value === value);
  return exam ? exam.label : value;
};

export const getGradeColor = (grade) => {
  const colors = {
    'A+': 'text-emerald-500',
    'A': 'text-emerald-400',
    'B+': 'text-blue-500',
    'B': 'text-blue-400',
    'C': 'text-amber-500',
    'D': 'text-orange-500',
    'F': 'text-red-500',
  };
  return colors[grade] || 'text-gray-500';
};

export const getGradeBadge = (grade) => {
  const badges = {
    'A+': 'badge-success',
    'A': 'badge-success',
    'B+': 'badge-info',
    'B': 'badge-info',
    'C': 'badge-warning',
    'D': 'badge-warning',
    'F': 'badge-danger',
  };
  return badges[grade] || 'badge-info';
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getPercentageColor = (pct) => {
  if (pct >= 90) return '#10b981';
  if (pct >= 75) return '#6366f1';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 50) return '#f59e0b';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
};
