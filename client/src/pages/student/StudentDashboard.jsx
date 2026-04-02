import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FileText, TrendingUp, Award, BookOpen, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { getExamLabel, getGradeBadge, getPercentageColor } from '../../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resResults, resAnalytics] = await Promise.all([
        api.get('/results'),
        api.get('/results/analytics')
      ]);
      setResults(resResults.data.data);
      setAnalytics(resAnalytics.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const latestResult = results[0];
  const avgPercentage = analytics?.averagePercentage || 0;
  const totalExams = analytics?.totalResults || 0;
  const bestGrade = results.length > 0 ? results.reduce((best, r) => r.percentage > best.percentage ? r : best, results[0])?.grade : '-';

  const subjectChartData = analytics?.subjectAverages ? {
    labels: analytics.subjectAverages.map(s => s.name),
    datasets: [{
      label: 'Average %',
      data: analytics.subjectAverages.map(s => s.average),
      backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316'],
      borderRadius: 8,
      borderSkipped: false,
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Section */}
      <motion.div variants={item} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Class {user?.class} • Section {user?.section} • Here's your academic overview
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Percentage', value: `${avgPercentage}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-500' },
          { label: 'Total Exams', value: totalExams, icon: FileText, color: 'from-violet-500 to-purple-500', iconColor: 'text-violet-500' },
          { label: 'Best Grade', value: bestGrade, icon: Award, color: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500' },
          { label: 'Subjects', value: '7', icon: BookOpen, color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Subject Performance</h3>
          {subjectChartData ? (
            <Bar data={subjectChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.1)' } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
              }
            }} />
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data available</p>
          )}
        </motion.div>

        {/* Grade Distribution */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Grade Distribution</h3>
          {gradeChartData ? (
            <div className="w-64 mx-auto">
              <Doughnut data={gradeChartData} options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } } },
                cutout: '60%'
              }} />
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data available</p>
          )}
        </motion.div>
      </div>

      {/* Recent Results */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Results</h3>
          <Link to="/student/results" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {results.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            No results available yet. Your results will appear here once uploaded by your teacher.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map(result => (
                  <tr key={result._id}>
                    <td className="font-medium">{getExamLabel(result.examType)}</td>
                    <td>{result.totalMarksObtained}/{result.totalMaxMarks}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div className="progress-bar-fill" style={{ width: `${result.percentage}%`, background: getPercentageColor(result.percentage) }} />
                        </div>
                        <span className="text-sm font-medium">{result.percentage}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${getGradeBadge(result.grade)}`}>{result.grade}</span></td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(result.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
