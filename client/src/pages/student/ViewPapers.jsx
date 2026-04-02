import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { EXAM_TYPES, SUBJECTS, getExamLabel, formatDate } from '../../utils/helpers';
import { BookOpen, Download, FileText, Image as ImageIcon } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ViewPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      const res = await api.get('/papers');
      setPapers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = papers.filter(p => {
    if (filterExam && p.examType !== filterExam) return false;
    if (filterSubject && p.subject !== filterSubject) return false;
    return true;
  });

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-48" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <BookOpen className="inline w-7 h-7 mr-2 text-primary-500" />
          Exam Papers
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View and download exam papers uploaded by teachers</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)} className="input-field !w-auto">
          <option value="">All Exams</option>
          {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="input-field !w-auto">
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </motion.div>

      {/* Papers Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No papers available</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(paper => (
            <motion.div key={paper._id} whileHover={{ y: -4 }} className="glass-card p-5 transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  paper.fileType === 'pdf' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                }`}>
                  {paper.fileType === 'pdf' ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{paper.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{paper.subject}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge badge-info">{getExamLabel(paper.examType)}</span>
                <span className="badge badge-success">Class {paper.class}-{paper.section}</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(paper.createdAt)}</span>
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
