import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, RefreshCw, CheckCircle, XCircle, MessageCircle, Clock, AlertCircle } from 'lucide-react';

const DoubtList = () => {
  const [doubts, setDoubts] = useState([]);
  const [filteredDoubts, setFilteredDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Fetch doubts and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const token = localStorage.getItem('adminToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const [doubtsRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/doubts/admin-doubt`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/doubts/admin-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDoubts(doubtsRes.data.data);
      setFilteredDoubts(doubtsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config,
      });

      let errorMessage = 'Failed to fetch data. Please try again later.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('adminToken');
          navigate('/login');
        } else if (err.response.status === 500) {
          errorMessage = err.response.data?.message || 'Server error occurred. Please contact support.';
        } else {
          errorMessage = err.response.data?.message || `Error: ${err.message}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Check your network connection.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling for updates
  useEffect(() => {
    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let result = doubts;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((doubt) => doubt.status === statusFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (doubt) =>
          doubt.title.toLowerCase().includes(term) ||
          doubt.description.toLowerCase().includes(term) ||
          (doubt.user?.name && doubt.user.name.toLowerCase().includes(term)) ||
          (doubt.order?.orderNumber && doubt.order.orderNumber.toLowerCase().includes(term))
      );
    }

    setFilteredDoubts(result);
  }, [doubts, statusFilter, searchTerm]);

  const handleStatusUpdate = async (doubtId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/doubts/admin/${doubtId}`,
        { status, response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        const updatedDoubts = doubts.map((doubt) =>
          doubt._id === doubtId ? response.data.data : doubt
        );

        setDoubts(updatedDoubts);
        setSelectedDoubt(null);
        setResponseText('');
      }
    } catch (err) {
      console.error('Error updating doubt:', err);
      setError(err.response?.data?.message || 'Failed to update doubt');
    }
  };

  if (loading && doubts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl mb-6 shadow-sm">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-3 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={fetchData}
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
      {/* Filters and Search */}
      <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-indigo-400" />
            </div>
            <input
              type="text"
              placeholder="Search doubts..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="text-indigo-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm font-medium">Total Doubts</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.resolved}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-gray-500 text-sm font-medium">Resolution Rate</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.resolutionRate}%</p>
          </div>
        </div>
      )}

      {/* Doubts List */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoubts.map((doubt) => (
                <tr key={doubt._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{doubt.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{doubt.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{doubt.user?.name}</div>
                    <div className="text-sm text-gray-500">{doubt.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{doubt.order?.orderNumber || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${doubt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 
                        doubt.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' : 
                        'bg-amber-100 text-amber-800'}`}
                    >
                      {doubt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => setSelectedDoubt(doubt)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900">Respond to Doubt</h3>
                <button
                  onClick={() => {
                    setSelectedDoubt(null);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">Title: {selectedDoubt.title}</h4>
                  <p className="text-gray-600">{selectedDoubt.description}</p>
                </div>

                {selectedDoubt.attachments?.length >  Monopoly 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Attachments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoubt.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                        >
                          {file.filename || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="response"
                    rows="4"
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'pending')}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${selectedDoubt.status === 'pending' ? 'bg-gray-100' : ''}`}
                  >
                    <Clock className="mr-2 h-4 w-4" /> Keep as Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'in_progress')}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${selectedDoubt.status === 'in_progress' ? 'bg-indigo-700' : ''}`}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'resolved')}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${selectedDoubt.status === 'resolved' ? 'bg-emerald-700' : ''}`}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtList;