import React, { useState, useEffect } from 'react';
import { BarChart2, Users, MessageSquare, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function DoubtList({ onLogout, role = "admin" }) {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.get(`/doubts/${role}`, {
      params: { page, limit }
    });

    const doubtData = response.data.data.docs.map(doubt => ({
      _id: doubt._id,
      doubtId: doubt._id,
      courseId: doubt.order?._id || 'N/A',
      courseTitle: doubt.order?.courseTitle || doubt.order?.productName || 'N/A',
      userId: doubt.user?._id || 'N/A',
      userEmail: doubt.user?.email || 'N/A',
      userName: doubt.user?.name || 'Unknown',
      status: doubt.status,
      title: doubt.title,
      date: new Date(doubt.createdAt),
    }));
    
    setDoubts(doubtData);
    setTotalPages(response.data.data.totalPages || 1);

  } catch (err) {
    console.error('Doubts fetch error:', err);
    
    let errorMessage;
    switch (err.response?.status) {
      case 403:
        errorMessage = 'Admin access required. Please log in with an admin account.';
        break;
      case 404:
        errorMessage = 'Doubts endpoint not found. Please check API configuration.';
        break;
      case 500:
        errorMessage = 'Server error occurred. Please try again later.';
        break;
      default:
        errorMessage = err.response?.data?.message || err.message || 'Failed to load doubts';
    }

    if (err.message.includes('Network Error')) {
      errorMessage = 'Cannot connect to the server. Please check your connection.';
    } else if (err.response?.data?.code === 'INVALID_QUERY') {
      errorMessage = 'Invalid query parameters. Please adjust filters and try again.';
    }

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [page, navigate, onLogout, role]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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

  // eslint-disable-next-line no-unused-vars
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

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageSquare size={64} className="mb-4 text-indigo-300" />
      <h2 className="text-xl font-semibold text-gray-800">No Doubts Found</h2>
      <p className="text-gray-600 max-w-md mt-2">
        It looks like there are no doubts at the moment. New doubts will appear here as they are submitted.
      </p>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
      >
        Next
      </button>
    </div>
  );

  const totalDoubts = doubts.length;
  const pendingDoubts = doubts.filter(d => d.status === 'pending').length;
  const resolvedDoubts = doubts.filter(d => d.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={MessageSquare}
            title="Total Doubts"
            value={totalDoubts}
            color="text-indigo-600"
          />
          <StatCard
            icon={MessageSquare}
            title="Pending Doubts"
            value={pendingDoubts}
            color="text-amber-600"
          />
          <StatCard
            icon={MessageSquare}
            title="Resolved Doubts"
            value={resolvedDoubts}
            color="text-emerald-600"
          />
        </div>
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
            <MessageSquare size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Doubt Details</h2>
          </div>
          {loading ? (
            <div className="p-4">
              <SkeletonLoader />
            </div>
          ) : error ? (
            <ErrorDisplay />
          ) : doubts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doubt ID</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Created At</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doubts.map(doubt => (
                      <tr
                        key={doubt._id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate(`/admin/doubts/${doubt._id}`)}
                      >
                        <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doubt.doubtId}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                          {doubt.courseTitle}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                          {doubt.userName}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {doubt.status.replace('_', ' ')}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                          {doubt.date.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default DoubtList;