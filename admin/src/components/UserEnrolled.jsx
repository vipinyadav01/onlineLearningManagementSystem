import React, { useState, useEffect } from 'react';
import { BarChart2, Users, BookOpen, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function UserEnrolled({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders/all-orders');

      if (response.data.success) {
        const orderData = response.data.orders.map(order => ({
          _id: order._id,
          orderId: order.orderId,
          courseId: order.courseId,
          courseTitle: order.courseTitle,
          userId: order.userId,
          userEmail: order.userEmail,
          userName: order.userName,
          date: new Date(order.createdAt),
        }));
        setOrders(orderData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Orders fetch error:', { message: err.message, status: err.status, details: err.details });
      let errorMessage = err.message || 'Failed to load orders';
      if (err.status === 401) {
        onLogout();
        navigate('/admin/login'); // Standardized to /admin/login
      } else if (err.status === 404) {
        errorMessage = 'Orders endpoint not found. Please check server configuration.';
      } else if (err.status === 500) {
        errorMessage = 'Server error occurred. Please contact support.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to the server. Please check your network or server status.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, onLogout]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl p-4 animate-pulse flex items-center space-x-4"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-xl w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white shadow-md rounded-xl p-6 flex items-center space-x-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );

  // Error Handling Component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Something Went Wrong</h2>
      <p className="text-gray-600 max-w-md">{error}</p>
      <div className="flex space-x-4">
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Retry</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <BarChart2 size={16} />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen size={64} className="mb-4 text-indigo-300" />
      <h2 className="text-xl font-semibold text-gray-800">No Orders Found</h2>
      <p className="text-gray-600 max-w-md mt-2">
        It looks like there are no orders at the moment. New orders will appear here as they occur.
      </p>
    </div>
  );

  // Calculate stats for cards
  const totalOrders = orders.length;
  const uniqueUsers = [...new Set(orders.map(order => order.userId))].length;
  const uniqueCourses = [...new Set(orders.map(order => order.courseId))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Total Orders"
            value={totalOrders}
            color="text-indigo-600"
          />
          <StatCard
            icon={BookOpen}
            title="Unique Courses"
            value={uniqueCourses}
            color="text-emerald-600"
          />
          <StatCard
            icon={Users}
            title="Unique Users"
            value={uniqueUsers}
            color="text-purple-600"
          />
        </div>
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
          </div>
          {loading ? (
            <div className="p-4">
              <SkeletonLoader />
            </div>
          ) : error ? (
            <ErrorDisplay />
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Order Date</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courseTitle}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {order.userName}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {order.userEmail}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserEnrolled;