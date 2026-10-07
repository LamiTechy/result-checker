import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import StudentPortal from './pages/StudentPortal';
import StudentResults from './pages/StudentResults';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminCourses from './pages/AdminCourses';
import AdminResults from './pages/AdminResults';
import AdminLayout from './components/AdminLayout';

function RequireStudent({ children }: { children: ReactNode }) {
  const { studentToken, loading } = useStudentAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }
  if (!studentToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentAuthProvider>
          <Routes>
            <Route path="/" element={<RequireStudent><StudentPortal /></RequireStudent>} />
            <Route path="/results" element={<RequireStudent><StudentResults /></RequireStudent>} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/signup" element={<StudentSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="results" element={<AdminResults />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StudentAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
