import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Users, Upload, FileText, ClipboardList, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, results: 0, papers: 0 });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, resultsRes, papersRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { count: 0 } })),
        api.get('/results').catch(() => ({ data: { data: [], count: 0 } })),
        api.get('/papers').catch(() => ({ data: { count: 0 } })),
      ]);
      setStats({
        students: studentsRes.data.count || 0,
        results: resultsRes.data.count || 0,
        papers: papersRes.data.count || 0,
      });
      setRecentResults(resultsRes.data.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold">
            Hello, <span className="gradient-text">{user?.name}</span> 👩‍🏫
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your students' results and exam papers
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: stats.students, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Results Uploaded', value: stats.results, icon: ClipboardList, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Papers Uploaded', value: stats.papers, icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/teacher/upload-marks">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Upload Marks</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add or update student marks</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </Link>

        <Link to="/teacher/upload-papers">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Upload Papers</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upload exam papers (PDF/Image)</p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Uploads</h3>
          <Link to="/teacher/students" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View Students <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentResults.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No recent activity</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Student</th><th>Exam</th><th>Percentage</th><th>Grade</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentResults.map(r => (
                  <tr key={r._id}>
                    <td className="font-medium">{r.studentName}</td>
                    <td>{r.examType}</td>
                    <td>{r.percentage}%</td>
                    <td><span className={`badge ${r.percentage >= 60 ? 'badge-success' : r.percentage >= 40 ? 'badge-warning' : 'badge-danger'}`}>{r.grade}</span></td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
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
