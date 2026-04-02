import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { CLASSES, SECTIONS } from '../../utils/helpers';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', class: '', section: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'student' && (!formData.class || !formData.section)) {
      setError('Please select class and section');
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        class: formData.class,
        section: formData.section
      });
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'Student', emoji: '👨‍🎓' },
    { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫' },
    { value: 'principal', label: 'Principal', emoji: '🏛️' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-3"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join SIES Result Portal
          </p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.role === role.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-transparent hover:border-primary-200 dark:hover:border-primary-800'
                    }`}
                    style={{ background: formData.role !== role.value ? 'var(--bg-secondary)' : undefined }}
                  >
                    <div className="text-xl">{role.emoji}</div>
                    <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{role.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" placeholder="John Doe" required id="signup-name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="you@sies.edu" required id="signup-email" />
              </div>
            </div>

            {/* Class & Section for students */}
            {formData.role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Class</label>
                  <select name="class" value={formData.class} onChange={handleChange} className="input-field" id="signup-class">
                    <option value="">Select</option>
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section</label>
                  <select name="section" value={formData.section} onChange={handleChange} className="input-field" id="signup-section">
                    <option value="">Select</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="input-field pl-10 pr-10" placeholder="••••••••" required id="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="input-field pl-10" placeholder="••••••••" required id="signup-confirm" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              id="signup-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
