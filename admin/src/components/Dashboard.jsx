import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  LogOut, 
  BookOpen, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnrollments: 0,
    activeUsers: 0
  });
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
      try {
        const [usersResponse, enrollmentsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/enrollments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
          })
        ]);

        // Generate personalized welcome message
        const hour = new Date().getHours();
        let timeBasedGreeting = 'Good day';
        if (hour < 12) timeBasedGreeting = 'Good morning';
        else if (hour < 18) timeBasedGreeting = 'Good afternoon';
        else timeBasedGreeting = 'Good evening';

        setWelcomeMessage(`${timeBasedGreeting}, Admin! 👋`);

        setStats({
          totalUsers: usersResponse.data.length,
          totalEnrollments: enrollmentsResponse.data.length,
          activeUsers: usersResponse.data.filter(user => user.isActive).length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div className="flex-grow">
        <p className="text-gray-500 text-sm">{title}</p>
        <div className="flex items-center">
          <p className="text-xl font-semibold mr-2">{value}</p>
          {trend && (
            <span className={`text-sm flex items-center ${trend.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend.type === 'up' ? '▲' : '▼'} {trend.percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Activity size={24} className="text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{welcomeMessage}</h2>
          <p className="text-blue-100">
            Welcome to your admin dashboard. Here you can manage users, track enrollments, and monitor platform activity.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.totalUsers} 
            color="text-blue-500"
            trend={{ type: 'up', percentage: 12 }}
          />
          <StatCard 
            icon={BookOpen} 
            title="Total Enrollments" 
            value={stats.totalEnrollments} 
            color="text-green-500"
            trend={{ type: 'up', percentage: 8 }}
          />
          <StatCard 
            icon={Activity} 
            title="Active Users" 
            value={stats.activeUsers} 
            color="text-purple-500"
            trend={{ type: 'up', percentage: 5 }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/user-logins" 
            className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 bg-blue-50 rounded-full">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">User Logins</h2>
              <p className="text-gray-600 text-sm">Monitor and track user login activities</p>
            </div>
            <TrendingUp size={20} className="ml-auto text-gray-400" />
          </Link>

          <Link 
            to="/user-enrolled" 
            className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="p-3 bg-green-50 rounded-full">
              <BarChart2 size={24} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">User Enrolled</h2>
              <p className="text-gray-600 text-sm">View and manage course enrollments</p>
            </div>
            <TrendingUp size={20} className="ml-auto text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;