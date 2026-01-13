import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminEnrollments from './pages/admin/AdminEnrollments';

// Home redirect component
const Home = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch(user.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  // Protected Routes with Layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout>
          <Home />
        </Layout>
      </ProtectedRoute>
    )
  },
  // Student Routes
  {
    path: '/student/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <Layout>
          <StudentDashboard />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/student/courses',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <Layout>
          <StudentCourses />
        </Layout>
      </ProtectedRoute>
    )
  },
  // Teacher Routes
  {
    path: '/teacher/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <Layout>
          <TeacherDashboard />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/teacher/courses',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <Layout>
          <TeacherCourses />
        </Layout>
      </ProtectedRoute>
    )
  },
  // Admin Routes
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminDashboard />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/students',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminStudents />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/teachers',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminTeachers />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/courses',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminCourses />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/departments',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminDepartments />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/enrollments',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout>
          <AdminEnrollments />
        </Layout>
      </ProtectedRoute>
    )
  },
  // 404 Route
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
