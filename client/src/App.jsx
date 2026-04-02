import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import ViewResults from './pages/student/ViewResults';
import ViewPapers from './pages/student/ViewPapers';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadMarks from './pages/teacher/UploadMarks';
import UploadPapers from './pages/teacher/UploadPapers';
import ManageStudents from './pages/teacher/ManageStudents';

// Principal
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import Analytics from './pages/principal/Analytics';
import PrincipalManageStudents from './pages/principal/ManageStudents';
import ManageTeachers from './pages/principal/ManageTeachers';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

// Page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />
        } />
        <Route path="/signup" element={
          user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Signup />
        } />

        {/* Student routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PageWrapper><StudentDashboard /></PageWrapper>} />
          <Route path="results" element={<PageWrapper><ViewResults /></PageWrapper>} />
          <Route path="papers" element={<PageWrapper><ViewPapers /></PageWrapper>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PageWrapper><TeacherDashboard /></PageWrapper>} />
          <Route path="upload-marks" element={<PageWrapper><UploadMarks /></PageWrapper>} />
          <Route path="upload-papers" element={<PageWrapper><UploadPapers /></PageWrapper>} />
          <Route path="students" element={<PageWrapper><ManageStudents /></PageWrapper>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Principal routes */}
        <Route path="/principal" element={
          <ProtectedRoute allowedRoles={['principal']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PageWrapper><PrincipalDashboard /></PageWrapper>} />
          <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
          <Route path="students" element={<PageWrapper><PrincipalManageStudents /></PageWrapper>} />
          <Route path="teachers" element={<PageWrapper><ManageTeachers /></PageWrapper>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
