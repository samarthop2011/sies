import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Upload, Users, BarChart3,
  GraduationCap, BookOpen, UserCog, LogOut, X, ChevronLeft
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/results', label: 'My Results', icon: FileText },
  { to: '/student/papers', label: 'Exam Papers', icon: BookOpen },
];

const teacherLinks = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teacher/upload-marks', label: 'Upload Marks', icon: Upload },
  { to: '/teacher/upload-papers', label: 'Upload Papers', icon: FileText },
  { to: '/teacher/students', label: 'Manage Students', icon: Users },
];

const principalLinks = [
  { to: '/principal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/principal/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/principal/students', label: 'Manage Students', icon: Users },
  { to: '/principal/teachers', label: 'Manage Teachers', icon: UserCog },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'principal' ? principalLinks
    : user?.role === 'teacher' ? teacherLinks
    : studentLinks;

  const roleLabel = user?.role === 'principal' ? 'Principal'
    : user?.role === 'teacher' ? 'Teacher'
    : 'Student';

  const roleIcon = user?.role === 'principal' ? '🏛️'
    : user?.role === 'teacher' ? '👩‍🏫'
    : '👨‍🎓';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={`p-6 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">SIES</h1>
                <p className="text-white/60 text-xs">Result Portal</p>
              </div>
            )}
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          {/* Collapse button for desktop */}
          <button onClick={onToggleCollapse} className="hidden lg:block text-white/70 hover:text-white transition-transform duration-200" style={{ transform: collapsed ? 'rotate(180deg)' : '' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className={`mx-4 mb-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm ${collapsed ? 'mx-2 p-2' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg">
            {roleIcon}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/60 text-xs">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Navigation
          </p>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? link.label : ''}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full hover:bg-red-500/20 hover:text-red-300 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col sidebar transition-all duration-300 h-screen sticky top-0 ${collapsed ? 'w-[70px]' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] sidebar z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
