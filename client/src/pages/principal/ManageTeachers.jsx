import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { UserCog, Search, Trash2, X } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(prev => prev.filter(t => t._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete teacher');
    }
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <UserCog className="inline w-7 h-7 mr-2 text-primary-500" />
          Manage Teachers
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View and manage all teachers</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !py-2 pl-9" placeholder="Search teachers..." id="search-teachers" />
        </div>
      </motion.div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No teachers found</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(teacher => (
            <motion.div key={teacher._id} whileHover={{ y: -4 }} className="glass-card p-5 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{teacher.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{teacher.email}</p>
                  </div>
                </div>
                <button onClick={() => setDeleteConfirm(teacher._id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {teacher.subjects?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {teacher.subjects.map(s => (
                    <span key={s} className="badge badge-info">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className={`badge ${teacher.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                  {teacher.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Joined {formatDate(teacher.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative rounded-2xl p-6 max-w-sm w-full shadow-xl" style={{ background: 'var(--bg-card)' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Teacher?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteTeacher(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
