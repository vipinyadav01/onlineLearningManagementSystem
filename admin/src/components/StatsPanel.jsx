import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart2, PieChart, LineChart, RefreshCw, AlertCircle } from 'lucide-react';
import Chart from 'chart.js/auto';

const StatsPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();
  const chartRef = React.createRef();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/doubts/admin-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch statistics');
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
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
  }, [stats, chartRef.current]);

  const renderChart = () => {
    const ctx = chartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }
    
    // Create new chart with modern colors
    chartRef.current.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.stats.map(item => item._id.replace('_', ' ')),
        datasets: [{
          label: 'Number of Doubts',
          data: stats.stats.map(item => item.count),
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)', // amber for pending
            'rgba(79, 70, 229, 0.7)',  // indigo for in_progress
            'rgba(16, 185, 129, 0.7)'  // emerald for resolved
          ],
          borderColor: [
            'rgba(245, 158, 11, 1)',
            'rgba(79, 70, 229, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Doubt Status Distribution',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-3 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Statistics Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <BarChart2 size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Doubts</h3>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                <PieChart size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.resolved}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.resolutionRate}% resolution rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <LineChart size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-1">{Math.round((stats.pending / stats.total) * 100)}% of total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <canvas ref={chartRef} height="300"></canvas>
      </div>

      {/* Status Distribution */}
      {stats && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Status Distribution</h3>
          <div className="space-y-6">
            {stats.stats.map((item) => (
              <div key={item._id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium capitalize text-gray-700">{item._id.replace('_', ' ')}</span>
                  <span className="font-medium">{item.count} ({(item.count / stats.total * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
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
