import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LogOut, 
  Clock, 
  Activity, 
  UserCheck 
} from 'lucide-react';
import axios from 'axios';

const UserLogins = ({ onLogout }) => {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogins: 0,
    uniqueUsers: 0,
    mostActiveUser: ''
  });

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users/logins`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        
        const loginData = response.data;
        setLogins(loginData);

        // Calculate statistics
        const uniqueUsers = new Set(loginData.map(l => l.username)).size;
        const mostActiveUser = loginData.reduce((prev, current) => 
          (prev.count || 0) > (current.count || 0) ? prev : current
        ).username;

        setStats({
          totalLogins: loginData.length,
          uniqueUsers,
          mostActiveUser
        });
      } catch (error) {
        console.error('Error fetching logins:', error);
        setLogins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogins();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );

  const getLoginTimeClass = (loginDate) => {
    const hoursSinceLogin = (Date.now() - new Date(loginDate).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLogin < 1) return 'bg-green-100 text-green-800';
    if (hoursSinceLogin < 24) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users size={24} className="text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800">User Logins</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={Activity} 
            title="Total Logins" 
            value={stats.totalLogins} 
            color="text-blue-500"
          />
          <StatCard 
            icon={Users} 
            title="Unique Users" 
            value={stats.uniqueUsers} 
            color="text-green-500"
          />
          <StatCard 
            icon={UserCheck} 
            title="Most Active User" 
            value={stats.mostActiveUser || 'N/A'} 
            color="text-purple-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
            <Clock size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Recent Login Activity</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
          ) : logins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logins.map(login => {
                    const loginDate = new Date(login.lastLogin);
                    const timeClass = getLoginTimeClass(login.lastLogin);
                    
                    return (
                      <tr 
                        key={login.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {login.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                          {loginDate.toLocaleString()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${timeClass}`}>
                            {((Date.now() - loginDate.getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs ago
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users size={48} className="mb-4 text-blue-300" />
              <p className="text-lg">No recent logins found</p>
              <p className="text-sm text-gray-400 mt-2">
                User login history will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogins;