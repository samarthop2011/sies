import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Users, GraduationCap, UserCog, BarChart3, TrendingUp, Award, ArrowRight } from 'lucide-react';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, results: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, resultsRes, analyticsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { count: 0 } })),
        api.get('/teachers').catch(() => ({ data: { count: 0 } })),
        api.get('/results').catch(() => ({ data: { count: 0 } })),
        api.get('/results/analytics').catch(() => ({ data: { data: {} } })),
      ]);
      setStats({
        students: studentsRes.data.count || 0,
        teachers: teachersRes.data.count || 0,
        results: resultsRes.data.count || 0,
      });
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const subjectChartData = analytics?.subjectAverages ? {
    labels: analytics.subjectAverages.map(s => s.name),
    datasets: [{
      label: 'Average %',
      data: analytics.subjectAverages.map(s => s.average),
      backgroundColor: [
        'rgba(99,102,241,0.8)', 'rgba(139,92,246,0.8)', 'rgba(168,85,247,0.8)',
        'rgba(217,70,239,0.8)', 'rgba(236,72,153,0.8)', 'rgba(244,63,94,0.8)', 'rgba(249,115,22,0.8)'
      ],
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
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary-500/10 via-accent-500/5 to-transparent rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome, <span className="gradient-text">{user?.name}</span> 🏛️
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here's your school overview at a glance
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.students, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Total Teachers', value: stats.teachers, icon: UserCog, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Results Uploaded', value: stats.results, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Avg Performance', value: `${analytics?.averagePercentage || 0}%`, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
        ].map(stat => (
          <motion.div key={stat.label} whileHover={{ y: -4 }} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Subject-wise Performance</h3>
          {subjectChartData ? (
            <Bar data={subjectChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(148,163,184,0.1)' } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
              }
            }} />
          ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data available</p>}
        </motion.div>

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
          ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data available</p>}
        </motion.div>
      </div>

      {/* Top Students */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            <Award className="inline w-5 h-5 mr-2 text-amber-500" />
            Top Students
          </h3>
          <Link to="/principal/analytics" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            Full Analytics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {analytics?.topStudents?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Rank</th><th>Student</th><th>Class</th><th>Percentage</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {analytics.topStudents.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        idx === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-gray-50 text-gray-500 dark:bg-dark-700 dark:text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="font-medium">{s.studentName}</td>
                    <td>{s.class}-{s.section}</td>
                    <td className="font-bold text-primary-500">{s.percentage}%</td>
                    <td><span className={`badge ${s.percentage >= 80 ? 'badge-success' : s.percentage >= 60 ? 'badge-info' : 'badge-warning'}`}>{s.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data available</p>}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/principal/students', label: 'Manage Students', desc: 'View & manage all students', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { to: '/principal/teachers', label: 'Manage Teachers', desc: 'View & manage all teachers', icon: UserCog, gradient: 'from-violet-500 to-purple-500' },
          { to: '/principal/analytics', label: 'View Analytics', desc: 'Detailed performance reports', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500' },
        ].map(action => (
          <Link key={action.to} to={action.to}>
            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-5 group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{action.label}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
