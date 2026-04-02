import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { CLASSES, SECTIONS, formatDate } from '../../utils/helpers';
import { Users, Search, Eye, Edit3, Trash2, X, CheckCircle } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchStudents(); }, [filterClass, filterSection]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/students?';
      if (filterClass) url += `class=${filterClass}&`;
      if (filterSection) url += `section=${filterSection}&`;
      if (search) url += `search=${search}&`;
      const res = await api.get(url);
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const viewStudent = async (student) => {
    try {
      const res = await api.get(`/students/${student._id}`);
      setSelectedStudent(res.data.data.student);
      setStudentResults(res.data.data.results);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch student details');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <Users className="inline w-7 h-7 mr-2 text-primary-500" />
          Manage Students
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View and manage student records</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !py-2 pl-9" placeholder="Search students..." id="search-students" />
            </div>
          </form>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field !w-auto !py-2">
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input-field !w-auto !py-2">
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Students Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14" />)}</div>
      ) : (
        <motion.div variants={item} className="glass-card overflow-hidden">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Class</th><th>Section</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No students found</td></tr>
                ) : (
                  filtered.map(student => (
                    <tr key={student._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                      <td>{student.class}</td>
                      <td>{student.section}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(student.createdAt)}</td>
                      <td>
                        <button onClick={() => viewStudent(student)} className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 text-primary-500" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedStudent.email}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Class {selectedStudent.class}-{selectedStudent.section}</p>
              </div>
            </div>

            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Results ({studentResults.length})</h3>
            {studentResults.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No results yet</p>
            ) : (
              <div className="space-y-2">
                {studentResults.map(r => (
                  <div key={r._id} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <p className="font-medium text-sm">{r.examType}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{r.percentage}%</p>
                      <span className={`badge text-xs ${r.percentage >= 60 ? 'badge-success' : r.percentage >= 40 ? 'badge-warning' : 'badge-danger'}`}>{r.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
