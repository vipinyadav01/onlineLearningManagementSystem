import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle2, 
  Mail, 
  Calendar, 
  Activity, 
  RefreshCcw 
} from 'lucide-react';

const UserLogins = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
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

  // Loading state with skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-gray-300 h-20 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={fetchUsers}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <RefreshCcw className="mr-2 w-4 h-4" /> Retry
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">User Logins</h1>
          <div className="text-gray-500 flex items-center">
            <UserCircle2 className="mr-2 w-6 h-6" />
            <span>{users.length} Total Users</span>
          </div>
        </div>

        <div className="grid gap-4">
          {users.map(user => (
            <div 
              key={user._id} 
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex items-center space-x-6"
            >
              <UserCircle2 className="w-12 h-12 text-blue-500" />
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800 flex items-center">
                      <Mail className="mr-2 w-4 h-4 text-gray-500" />
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="mr-2 w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <UserCircle2 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogins;