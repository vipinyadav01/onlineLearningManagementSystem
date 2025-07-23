import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Users, Clock, BookOpen, TrendingUp, AlertCircle, BarChart2, List } from 'lucide-react';
import DoubtList from './DoubtList';
import StatsPanel from './StatsPanel';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('doubts');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/admin/dashboard-stats');

      const hour = new Date().getHours();
      const timeBasedGreeting =
        hour < 12 ? 'Good morning' :
        hour < 18 ? 'Good afternoon' :
        'Good evening';

      setWelcomeMessage(`${timeBasedGreeting}, Admin! 👋`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, bgColor = "bg-white", textColor = "text-indigo-600" }) => (
    <div className={`
      ${bgColor} 
      rounded-xl 
      p-6 
      shadow-md 
      hover:shadow-lg 
      transition-all 
      duration-300 
      transform 
      hover:-translate-y-1 
      relative 
      overflow-hidden
    `}>
      <div className="absolute top-0 right-0 opacity-10">
        {Icon && <Icon className="w-24 h-24 text-current" />}
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          {trend && (
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
              <span className="text-emerald-500">{trend}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className={`${textColor} text-3xl font-bold`}>{value || 0}</div>
        </div>
      </div>
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-200 h-36 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
          >
            <TrendingUp className="mr-2 h-5 w-5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            {welcomeMessage && (
              <p className="text-sm text-gray-500 mt-1">{welcomeMessage}</p>
            )}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              if (typeof onLogout === 'function') {
                onLogout();
              }
              navigate('/admin/login');
            }}
            className="text-red-600 hover:text-red-800 font-medium flex items-center"
          >
            Logout
          </button>
        </div>
      </header>

      {stats && (
        <div className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                trend={5.2}
                textColor="text-indigo-600"
              />
              <StatCard
                title="Recent Users"
                value={stats.recentUsers}
                icon={Clock}
                trend={3.8}
                textColor="text-emerald-600"
              />
              <StatCard
                title="Top Course Enrollments"
                value={stats.topCourses?.[0]?.totalEnrollments}
                icon={BookOpen}
                trend={7.5}
                textColor="text-purple-600"
              />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('doubts')}
              className={`${activeTab === 'doubts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
            >
              <List className="mr-2 h-5 w-5" /> Doubts
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`${activeTab === 'stats' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
            >
              <BarChart2 className="mr-2 h-5 w-5" /> Statistics
            </button>
          </nav>
        </div>

        {activeTab === 'doubts' ? <DoubtList /> : <StatsPanel />}
      </main>
    </div>
  );
};

export default Dashboard;