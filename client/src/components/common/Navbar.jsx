import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Menu, Search } from 'lucide-react';
import api from '../../services/api';

export default function Navbar({ onMenuClick }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-primary-100 dark:hover:bg-dark-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border transition-all" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-48"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-primary-100 dark:hover:bg-dark-700 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5 text-primary-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl hover:bg-primary-100 dark:hover:bg-dark-700 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 rounded-2xl border shadow-xl overflow-hidden"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                        No notifications yet
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3 border-b text-sm transition-colors hover:bg-primary-50 dark:hover:bg-dark-800 ${!notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <p style={{ color: 'var(--text-primary)' }}>{notif.message}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
