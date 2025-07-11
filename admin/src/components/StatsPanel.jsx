import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BarChart2, PieChart, LineChart, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import Chart from 'chart.js/auto';

const StatsPanel = ({ role = 'admin' }) => { 
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

const fetchData = React.useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Fetching stats:', {
      endpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/doubts/admin/stats`,
      timeRange,
      role 
    });

    const response = await api.get('/doubts/admin/stats', {
      params: { timeRange, role }
    });

    setStats(response.data.data);

  } catch (err) {
    console.error('Stats fetch error:', {
      message: err.message,
      status: err.response?.status,
      details: err.response?.data
    });

    let errorMessage = err.response?.data?.message || err.message || 'Failed to fetch statistics';

    if (err.response?.status === 403) {
      errorMessage = 'Admin access required. Please log in with an admin account.';
    } else if (err.response?.status === 400 && err.response?.data?.code === 'INVALID_TIME_RANGE') {
      errorMessage = 'Invalid time range selected. Please choose a valid option.';
    } else if (err.response?.status === 404) {
      errorMessage = 'Stats endpoint not found. Please verify: 1) Backend server is running at the correct URL (check VITE_API_BASE_URL in .env). 2) /api/doubts/admin/stats route is defined in the backend. 3) No network issues blocking the request.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error occurred. Please check backend logs or contact support.';
    }

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}, [timeRange, role]);

  useEffect(() => {
    // Check for token before fetching data
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      fetchData();
    } else {
      setError('Authentication required. Please log in to continue.');
      navigate('/admin/login');
    }
  }, [timeRange, navigate, fetchData]);

  const renderChart = React.useCallback(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.stats.map((item) => item._id.replace('_', ' ')),
        datasets: [
          {
            label: 'Number of Doubts',
            data: stats.stats.map((item) => item.count),
            backgroundColor: ['rgba(245, 158, 11, 0.7)', 'rgba(79, 70, 229, 0.7)', 'rgba(16, 185, 129, 0.7)'],
            borderColor: ['rgba(245, 158, 11, 1)', 'rgba(79, 70, 229, 1)', 'rgba(16, 185, 129, 1)'],
            borderWidth: 1,
            borderRadius: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 14 } },
          },
          title: {
            display: true,
            text: 'Doubt Status Distribution',
            font: { size: 18, weight: 'bold' },
            padding: 20,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 12 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 12 } },
          },
        },
      },
    });
  }, [stats]);

  useEffect(() => {
    if (stats && chartRef.current && stats.stats?.length > 0) {
      renderChart();
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats, renderChart]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-8 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 mr-4 text-red-500" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="mt-6 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg backdrop-blur-lg backdrop-filter">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Statistics Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto border-2 border-gray-200 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700 font-medium transition-all duration-300"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600">
                <BarChart2 size={32} />
              </div>
              <div>
                <h3 className="text-gray-500 text-lg font-medium">Total Doubts</h3>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600">
                <PieChart size={32} />
              </div>
              <div>
                <h3 className="text-gray-500 text-lg font-medium">Resolved</h3>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.resolved || 0}</p>
                <p className="text-base text-gray-500 mt-2">{stats.resolutionRate || 0}% resolution rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                <LineChart size={32} />
              </div>
              <div>
                <h3 className="text-gray-500 text-lg font-medium">Pending</h3>
                <p className="text-4xl font-bold text-amber-600 mt-2">{stats.pending || 0}</p>
                <p className="text-base text-gray-500 mt-2">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600">
                <Clock size={32} />
              </div>
              <div>
                <h3 className="text-gray-500 text-lg font-medium">In Progress</h3>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.inProgress || 0}</p>
                <p className="text-base text-gray-500 mt-2">
                  {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="h-[400px]">
          {stats && stats.stats?.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BarChart2 size={48} className="mb-4" />
              <p>No data available for the selected time range.</p>
            </div>
          )}
        </div>
      </div>
      {stats && stats.stats?.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Status Distribution</h3>
          <div className="space-y-8">
            {stats.stats.map((item) => (
              <div key={item._id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium capitalize text-gray-700">{item._id.replace('_', ' ')}</span>
                  <span className="text-lg font-bold">
                    {item.count} ({stats.total > 0 ? (item.count / stats.total * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item._id === 'pending' ? 'bg-amber-500' : item._id === 'in_progress' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;