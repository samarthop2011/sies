import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../services/api';
import { CLASSES, SECTIONS, EXAM_TYPES, getExamLabel } from '../../utils/helpers';
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [classComparison, setClassComparison] = useState([]);

  useEffect(() => { fetchAnalytics(); }, [filterClass, filterSection, filterExam]);

  useEffect(() => { fetchClassComparison(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = '/results/analytics?';
      if (filterClass) url += `class=${filterClass}&`;
      if (filterSection) url += `section=${filterSection}&`;
      if (filterExam) url += `examType=${filterExam}&`;
      const res = await api.get(url);
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassComparison = async () => {
    try {
      const promises = ['8', '9', '10'].map(cls =>
        api.get(`/results/analytics?class=${cls}`).then(r => ({
          class: cls,
          avg: r.data.data.averagePercentage || 0,
          count: r.data.data.totalResults || 0
        }))
      );
      const results = await Promise.all(promises);
      setClassComparison(results);
    } catch (err) {
      console.error('Failed to fetch class comparisons');
    }
  };

  const subjectChartData = analytics?.subjectAverages ? {
    labels: analytics.subjectAverages.map(s => s.name),
    datasets: [{
      label: 'Average %',
      data: analytics.subjectAverages.map(s => s.average),
      backgroundColor: 'rgba(99,102,241,0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointRadius: 5,
      fill: true,
      tension: 0.4,
    }]
  } : null;

  const gradeChartData = analytics?.gradeDistribution ? {
    labels: Object.keys(analytics.gradeDistribution),
    datasets: [{
      data: Object.values(analytics.gradeDistribution),
      backgroundColor: ['#10b981', '#34d399', '#6366f1', '#818cf8', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0,
    }]
  } : null;

  const classChartData = classComparison.length > 0 ? {
    labels: classComparison.map(c => `Class ${c.class}`),
    datasets: [{
      label: 'Avg %',
      data: classComparison.map(c => c.avg),
      backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(139,92,246,0.8)', 'rgba(168,85,247,0.8)'],
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null;

  const exportReport = () => {
    if (!analytics) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('SIES Analytics Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    if (filterClass) doc.text(`Class: ${filterClass}`, 14, 40);
    if (filterSection) doc.text(`Section: ${filterSection}`, 60, 40);
    if (filterExam) doc.text(`Exam: ${getExamLabel(filterExam)}`, 110, 40);

    doc.setFontSize(12);
    doc.text(`Total Results: ${analytics.totalResults}`, 14, 55);
    doc.text(`Average Percentage: ${analytics.averagePercentage}%`, 14, 63);

    if (analytics.subjectAverages?.length > 0) {
      autoTable(doc, {
        startY: 75,
        head: [['Subject', 'Average %', 'Total Results']],
        body: analytics.subjectAverages.map(s => [s.name, `${s.average}%`, s.count]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    if (analytics.topStudents?.length > 0) {
      const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 80;
      doc.text('Top Students', 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [['Name', 'Class', 'Percentage', 'Grade']],
        body: analytics.topStudents.map(s => [s.studentName, `${s.class}-${s.section}`, `${s.percentage}%`, s.grade]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    doc.save('SIES_Analytics_Report.pdf');
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-48" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <BarChart3 className="inline w-7 h-7 mr-2 text-primary-500" />
            Analytics
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Detailed performance insights</p>
        </div>
        <button onClick={exportReport} className="btn-primary flex items-center gap-2" id="export-report">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field !w-auto !py-2">
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input-field !w-auto !py-2">
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
          <select value={filterExam} onChange={e => setFilterExam(e.target.value)} className="input-field !w-auto !py-2">
            <option value="">All Exams</option>
            {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Results</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{analytics?.totalResults || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Average Percentage</p>
          <p className="text-3xl font-bold mt-1 text-primary-500">{analytics?.averagePercentage || 0}%</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Grades</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{analytics?.gradeDistribution ? Object.keys(analytics.gradeDistribution).length : 0}</p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Subject Performance Trend</h3>
          {subjectChartData ? (
            <Line data={subjectChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.1)' } },
                x: { grid: { display: false } }
              }
            }} />
          ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data</p>}
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Grade Distribution</h3>
          {gradeChartData ? (
            <div className="w-56 mx-auto">
              <Doughnut data={gradeChartData} options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { size: 11 } } } },
                cutout: '65%'
              }} />
            </div>
          ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data</p>}
        </motion.div>
      </div>

      {/* Class Comparison */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Class Performance Comparison</h3>
        {classChartData ? (
          <div className="max-w-lg mx-auto">
            <Bar data={classChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.1)' } },
                x: { grid: { display: false } }
              }
            }} />
          </div>
        ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data</p>}
      </motion.div>

      {/* Top Students */}
      {analytics?.topStudents?.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🏆 Top Performers</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Rank</th><th>Student</th><th>Class</th><th>Percentage</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {analytics.topStudents.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        idx === 1 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'text-gray-500'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="font-medium">{s.studentName}</td>
                    <td>{s.class}-{s.section}</td>
                    <td className="font-bold text-primary-500">{s.percentage}%</td>
                    <td><span className={`badge ${s.percentage >= 80 ? 'badge-success' : 'badge-info'}`}>{s.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
