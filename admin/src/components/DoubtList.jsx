import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter, FaSync, FaCheck, FaTimes, FaComment } from 'react-icons/fa';

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
  const [refreshInterval, setRefreshInterval] = useState(null);
  const navigate = useNavigate();

  // Fetch doubts and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [doubtsRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/doubts/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/doubts/admin-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setDoubts(doubtsRes.data.data);
      setFilteredDoubts(doubtsRes.data.data);
      setStats(statsRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up polling for updates
  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let result = doubts;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(doubt => doubt.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doubt => 
        doubt.title.toLowerCase().includes(term) || 
        doubt.description.toLowerCase().includes(term) ||
        (doubt.user?.name && doubt.user.name.toLowerCase().includes(term)) ||
        (doubt.order?.orderNumber && doubt.order.orderNumber.toLowerCase().includes(term))
      );
    }
    
    setFilteredDoubts(result);
  }, [doubts, statusFilter, searchTerm]);

  // Handle status update
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
        const updatedDoubts = doubts.map(doubt => 
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search doubts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <button
              onClick={fetchData}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Doubts</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Resolution Rate</h3>
            <p className="text-2xl font-bold">{stats.resolutionRate}%</p>
          </div>
        </div>
      )}

      {/* Doubts List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoubts.map(doubt => (
                <tr key={doubt._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{doubt.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{doubt.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doubt.user?.name}</div>
                    <div className="text-sm text-gray-500">{doubt.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doubt.order?.orderNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${doubt.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        doubt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {doubt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedDoubt(doubt)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaComment />
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Respond to Doubt</h3>
                <button
                  onClick={() => {
                    setSelectedDoubt(null);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium">Title: {selectedDoubt.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedDoubt.description}</p>
                </div>
                
                {selectedDoubt.attachments?.length > 0 && (
                  <div>
                    <h4 className="font-medium">Attachments:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoubt.attachments.map((file, index) => (
                        <a 
                          key={index}
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {file.filename || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                    Your Response
                  </label>
                  <textarea
                    id="response"
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'pending')}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedDoubt.status === 'pending' ? 'bg-gray-100' : ''}`}
                  >
                    <FaTimes className="mr-2" /> Keep as Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'in_progress')}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedDoubt.status === 'in_progress' ? 'bg-blue-700' : ''}`}
                  >
                    <FaSync className="mr-2" /> Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedDoubt._id, 'resolved')}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${selectedDoubt.status === 'resolved' ? 'bg-green-700' : ''}`}
                  >
                    <FaCheck className="mr-2" /> Mark Resolved
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