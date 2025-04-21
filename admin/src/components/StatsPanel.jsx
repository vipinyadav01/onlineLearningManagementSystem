import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart2, PieChart, LineChart, RefreshCw, AlertCircle } from 'lucide-react';
import Chart from 'chart.js/auto';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return Promise.reject(new Error('No authentication token found'));
    }
    config.headers.Authorization = `Bearer ${token}`;
    
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    if (response.data?.success) {
      return response;
    }
    return Promise.reject(new Error(response.data?.message || 'Operation failed'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

const StatsPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await instance.get(`/doubts/admin-stats?timeRange=${timeRange}`);
        setStats(response.data.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  useEffect(() => {
    if (stats && chartRef.current) {
      renderChart();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats]);

  const renderChart = () => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.stats.map(item => item._id.replace('_', ' ')),
        datasets: [{
          label: 'Number of Doubts',
          data: stats.stats.map(item => item.count),
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)',
            'rgba(79, 70, 229, 0.7)',
            'rgba(16, 185, 129, 0.7)'
          ],
          borderColor: [
            'rgba(245, 158, 11, 1)',
            'rgba(79, 70, 229, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 1,
          borderRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Doubt Status Distribution',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  };

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
            onClick={() => window.location.reload()}
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
      {/* Time Range Selector */}
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600">
                <BarChart2 size={32} />
              </div>
              <div>
                <h3 className="text-gray-500 text-lg font-medium">Total Doubts</h3>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total}</p>
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
                <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.resolved}</p>
                <p className="text-base text-gray-500 mt-2">{stats.resolutionRate}% resolution rate</p>
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
                <p className="text-4xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                <p className="text-base text-gray-500 mt-2">{Math.round((stats.pending / stats.total) * 100)}% of total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="h-[400px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Status Distribution */}
      {stats && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Status Distribution</h3>
          <div className="space-y-8">
            {stats.stats.map((item) => (
              <div key={item._id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium capitalize text-gray-700">{item._id.replace('_', ' ')}</span>
                  <span className="text-lg font-bold">{item.count} ({(item.count / stats.total * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item._id === 'pending' ? 'bg-amber-500' :
                      item._id === 'in_progress' ? 'bg-indigo-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${(item.count / stats.total) * 100}%` }}
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