import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { EXAM_TYPES, getExamLabel, getGradeBadge, getPercentageColor, formatDate } from '../../utils/helpers';
import { FileText, Download, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ViewResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results');
      setResults(res.data.data);
    } catch (err) {
      console.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeExam === 'all' ? results : results.filter(r => r.examType === activeExam);

  const downloadPDF = (result) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Satyajeet International English School', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Result Report', 105, 28, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Student: ${result.studentName}`, 14, 42);
    doc.text(`Exam: ${getExamLabel(result.examType)}`, 14, 50);
    doc.text(`Class: ${result.class}-${result.section}`, 14, 58);
    doc.text(`Date: ${formatDate(result.createdAt)}`, 14, 66);

    // Table
    autoTable(doc, {
      startY: 75,
      head: [['Subject', 'Marks Obtained', 'Total Marks', 'Percentage']],
      body: result.subjects.map(s => [
        s.name,
        s.marksObtained,
        s.totalMarks,
        `${((s.marksObtained / s.totalMarks) * 100).toFixed(1)}%`
      ]),
      foot: [['Total', result.totalMarksObtained, result.totalMaxMarks, `${result.percentage}%`]],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      footStyles: { fillColor: [99, 102, 241] },
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grade: ${result.grade}`, 14, finalY + 15);
    if (result.remarks) {
      doc.setFont(undefined, 'normal');
      doc.text(`Remarks: ${result.remarks}`, 14, finalY + 25);
    }

    doc.save(`SIES_Result_${result.examType}_${result.studentName}.pdf`);
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <FileText className="inline w-7 h-7 mr-2 text-primary-500" />
          My Results
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View your exam results and download reports</p>
      </motion.div>

      {/* Exam Type Tabs */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveExam('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeExam === 'all' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          All Exams
        </button>
        {EXAM_TYPES.map(exam => (
          <button
            key={exam.value}
            onClick={() => setActiveExam(exam.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeExam === exam.value ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {exam.label}
          </button>
        ))}
      </motion.div>

      {/* Results */}
      {filtered.length === 0 ? (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No results found</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map(result => (
            <motion.div key={result._id} variants={item} className="glass-card overflow-hidden">
              {/* Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {getExamLabel(result.examType)}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(result.createdAt)} • {result.academicYear}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-base px-4 py-1 ${getGradeBadge(result.grade)}`}>
                    {result.grade}
                  </span>
                  <span className="text-lg font-bold" style={{ color: getPercentageColor(result.percentage) }}>
                    {result.percentage}%
                  </span>
                  <button onClick={() => downloadPDF(result)} className="btn-secondary !px-3 !py-2 flex items-center gap-1.5 text-sm">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>

              {/* Subjects table */}
              <div className="p-4">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Progress</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((sub, idx) => {
                        const pct = ((sub.marksObtained / sub.totalMarks) * 100).toFixed(1);
                        return (
                          <tr key={idx}>
                            <td className="font-medium">{sub.name}</td>
                            <td>{sub.marksObtained}/{sub.totalMarks}</td>
                            <td>
                              <div className="progress-bar w-32">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                  className="progress-bar-fill"
                                  style={{ background: getPercentageColor(parseFloat(pct)) }}
                                />
                              </div>
                            </td>
                            <td className="font-semibold" style={{ color: getPercentageColor(parseFloat(pct)) }}>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-4 flex flex-wrap gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <div><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total:</span> <span className="font-bold">{result.totalMarksObtained}/{result.totalMaxMarks}</span></div>
                  <div><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Percentage:</span> <span className="font-bold" style={{ color: getPercentageColor(result.percentage) }}>{result.percentage}%</span></div>
                  <div><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Grade:</span> <span className={`badge ${getGradeBadge(result.grade)}`}>{result.grade}</span></div>
                  {result.remarks && <div><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Remarks:</span> <span className="text-sm">{result.remarks}</span></div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
