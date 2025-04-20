import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Mail, Calendar, AlertCircle, RefreshCw, Search, Filter, SortDesc, SortAsc, ChevronDown, ChevronUp, Bell, User, LogOut, Settings, HelpCircle, ArrowLeft } from 'lucide-react';

const UserLogins = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401 && typeof onLogout === 'function') {
        onLogout();
        navigate('/login');
      }
      setError(error.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate, onLogout]);

  useEffect(() => {
    // Filter users based on search term and selected filter
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFilter !== 'All') {
      // Add your filter logic here based on selectedFilter
      // For example:
      if (selectedFilter === 'Recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        result = result.filter(user => new Date(user.createdAt) >= oneWeekAgo);
      }
    }
    
    // Sort the filtered results
    result = [...result].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, selectedFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Loading state with improved skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="h-8 md:h-10 bg-gray-200 rounded-xl w-full md:w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full md:w-1/3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-200 h-24 md:h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with improved UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={fetchUsers}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Retry
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header area */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <UserCircle2 className="mr-2 w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
              User Logins
              <span className="ml-2 text-sm md:text-base bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full">
                {filteredUsers.length} of {users.length}
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </button>
              <button 
                onClick={fetchUsers}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="mr-2 w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Search and filter area */}
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 text-indigo-500" />
                <span>{selectedFilter}</span>
                {isFilterMenuOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {['All', 'Recent', 'Oldest'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedFilter === filter ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleSort('createdAt')}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              {sortConfig.direction === 'asc' ? (
                <SortAsc className="h-5 w-5 text-indigo-500" />
              ) : (
                <SortDesc className="h-5 w-5 text-indigo-500" />
              )}
              <span>Sort by Date</span>
            </button>
          </div>
        </div>

        {/* User cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div 
                  onClick={() => toggleUserExpansion(user._id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1 truncate max-w-[170px]">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="mr-1 w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs flex items-center">
                          <Bell className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {expandedUser === user._id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{user.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">Joined:</span>
                      <span className="ml-2">{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
              <UserCircle2 className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No users found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('All');
                }}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="mr-2 w-4 h-4" /> Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogins;
