import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { SUBJECTS, CLASSES, SECTIONS, EXAM_TYPES } from '../../utils/helpers';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadMarks() {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('');
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const res = await api.get(`/students?class=${selectedClass}&section=${selectedSection}`);
      const studentsList = res.data.data;
      setStudents(studentsList);
      setMarksData(studentsList.map(s => ({
        studentId: s._id,
        studentName: s.name,
        subjects: SUBJECTS.map(sub => ({ name: sub, marksObtained: '', totalMarks: 100 })),
        remarks: ''
      })));
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection) fetchStudents();
  }, [selectedClass, selectedSection]);

  const updateMark = (studentIdx, subjectIdx, value) => {
    const updated = [...marksData];
    updated[studentIdx].subjects[subjectIdx].marksObtained = value;
    setMarksData(updated);
  };

  const updateRemarks = (studentIdx, value) => {
    const updated = [...marksData];
    updated[studentIdx].remarks = value;
    setMarksData(updated);
  };

  const handleSubmit = async () => {
    if (!examType) {
      setMessage({ type: 'error', text: 'Please select an exam type' });
      return;
    }

    // Validate all marks are filled
    for (const student of marksData) {
      for (const sub of student.subjects) {
        if (sub.marksObtained === '' || isNaN(sub.marksObtained)) {
          setMessage({ type: 'error', text: `Please fill all marks for ${student.studentName}` });
          return;
        }
        if (Number(sub.marksObtained) < 0 || Number(sub.marksObtained) > Number(sub.totalMarks)) {
          setMessage({ type: 'error', text: `Invalid marks for ${student.studentName} in ${sub.name}` });
          return;
        }
      }
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const results = marksData.map(m => ({
        student: m.studentId,
        examType,
        class: selectedClass,
        section: selectedSection,
        subjects: m.subjects.map(s => ({
          name: s.name,
          marksObtained: Number(s.marksObtained),
          totalMarks: Number(s.totalMarks)
        })),
        remarks: m.remarks
      }));

      await api.post('/results/bulk', { results });
      setMessage({ type: 'success', text: `Successfully uploaded marks for ${results.length} students!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload marks' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <Upload className="inline w-7 h-7 mr-2 text-primary-500" />
          Upload Marks
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Select class, section, and exam type to enter student marks</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field" id="marks-class">
              <option value="">Select Class</option>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="input-field" id="marks-section">
              <option value="">Select Section</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Exam Type</label>
            <select value={examType} onChange={e => setExamType(e.target.value)} className="input-field" id="marks-exam">
              <option value="">Select Exam</option>
              {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Marks Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
      ) : marksData.length > 0 ? (
        <div className="space-y-4">
          {marksData.map((student, sIdx) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sIdx * 0.05 }}
              className="glass-card p-4"
            >
              <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {sIdx + 1}. {student.studentName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {student.subjects.map((sub, subIdx) => (
                  <div key={sub.name}>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {sub.name}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={sub.totalMarks}
                        value={sub.marksObtained}
                        onChange={e => updateMark(sIdx, subIdx, e.target.value)}
                        className="input-field !py-2 text-sm"
                        placeholder="0"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>/{sub.totalMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  value={student.remarks}
                  onChange={e => updateRemarks(sIdx, e.target.value)}
                  className="input-field !py-2 text-sm"
                  placeholder="Remarks (optional)"
                />
              </div>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-4 text-lg"
            id="submit-marks"
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit All Marks
              </>
            )}
          </motion.button>
        </div>
      ) : selectedClass && selectedSection ? (
        <div className="glass-card p-12 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>No students found in Class {selectedClass}-{selectedSection}</p>
        </div>
      ) : null}
    </motion.div>
  );
}
