import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
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
    
    // Create new chart
    chartRef.current.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.stats.map(item => item._id.replace('_', ' ')),
        datasets: [{
          label: 'Number of Doubts',
          data: stats.stats.map(item => item.count),
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
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
            text: 'Doubt Status Distribution'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Statistics Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaChartBar size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Doubts</h3>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaChartPie size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-gray-500">{stats.resolutionRate}% resolution rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaChartLine size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">{Math.round((stats.pending / stats.total) * 100)}% of total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <canvas ref={chartRef} height="300"></canvas>
      </div>

      {/* Status Distribution */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Status Distribution</h3>
          <div className="space-y-4">
            {stats.stats.map((item) => (
              <div key={item._id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium capitalize">{item._id.replace('_', ' ')}</span>
                  <span>{item.count} ({(item.count / stats.total * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      item._id === 'pending' ? 'bg-yellow-400' :
                      item._id === 'in_progress' ? 'bg-blue-500' :
                      'bg-green-500'
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