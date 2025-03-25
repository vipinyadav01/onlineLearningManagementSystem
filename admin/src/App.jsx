import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Space 
} from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  BookOutlined, 
  LogoutOutlined, 
  LoginOutlined 
} from '@ant-design/icons';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserLogins from './components/UserLogins';
import UserEnrolled from './components/UserEnrolled';
import AdminCourses from './pages/AdminCourses';

const { Header, Content, Sider } = Layout;

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      // Optional: Add token validation logic here
    } else {
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/user-logins',
      icon: <UserOutlined />,
      label: 'User Logins',
      onClick: () => navigate('/user-logins'),
    },
    {
      key: '/user-enrolled',
      icon: <UserOutlined />,
      label: 'User Enrolled',
      onClick: () => navigate('/user-enrolled'),
    },
    {
      key: '/admin-courses',
      icon: <BookOutlined />,
      label: 'Courses',
      onClick: () => navigate('/admin-courses'),
    },
  ];

  const AdminLayout = ({ children }) => (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
      >
        <div 
          style={{ 
            height: 32, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.2)' 
          }} 
        />
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: '0 16px', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center' 
          }}
        >
          <Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: handleLogout
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Avatar 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer' }} 
              />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
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
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-logins" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <UserLogins />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-enrolled" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <UserEnrolled />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-courses" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout>
              <AdminCourses />
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