import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import axios from 'axios';
import { 
  Home, 
  Users, 
  Book, 
  LogOut, 
  Menu, 
  X, 
  AlertTriangle,
  ChevronRight 
} from 'lucide-react';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserLogins from './components/UserLogins';
import UserEnrolled from './components/UserEnrolled';
import AdminCourses from './pages/AdminCourses';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <AlertTriangle className="w-24 h-24 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
          <p className="text-gray-600 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate token on mount and route changes
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token response');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        if (location.pathname !== '/login') {
          navigate('/login');
          // Use a toast library or custom toast for notifications
          alert('Session expired. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate, location.pathname]);

  const handleLogin = (token) => {
    if (!token) {
      alert('No token received during login');
      return;
    }
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
    navigate('/');
    alert('Logged in successfully');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/login');
    alert('Logged out successfully');
  };

  const menuItems = [
    {
      path: '/',
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
    },
    {
      path: '/user-logins',
      icon: <Users className="w-5 h-5" />,
      label: 'User Logins',
    },
    {
      path: '/user-enrolled',
      icon: <Users className="w-5 h-5" />,
      label: 'User Enrolled',
    },
    {
      path: '/admin-courses',
      icon: <Book className="w-5 h-5" />,
      label: 'Courses',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const AdminLayout = ({ children }) => (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        ${collapsed ? 'w-20' : 'w-64'} 
        bg-gray-800 text-white transition-all duration-300 ease-in-out
        fixed left-0 top-0 bottom-0 z-40 shadow-lg
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center p-3 hover:bg-gray-700 
                ${location.pathname === item.path ? 'bg-gray-700' : ''}
                ${collapsed ? 'justify-center' : 'px-4'}
              `}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center p-3 hover:bg-red-600 
              ${collapsed ? 'justify-center' : 'px-4'}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${collapsed ? 'ml-20' : 'ml-64'}
      `}>
        {/* Header */}
        <header className="bg-white shadow-md p-4 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <Dashboard onLogout={handleLogout} />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-logins"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <UserLogins onLogout={handleLogout} />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-enrolled"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <UserEnrolled onLogout={handleLogout} />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-courses"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <AdminCourses onLogout={handleLogout} />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;