import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  LogOut, 
  Users, 
  BookOpen, 
  Calendar 
} from 'lucide-react';
import axios from 'axios';

const UserEnrolled = ({ onLogout }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    uniqueCourses: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/enrollments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        
        const enrollmentData = response.data;
        setEnrollments(enrollmentData);

        // Calculate statistics
        const uniqueCourses = new Set(enrollmentData.map(e => e.course)).size;
        const uniqueUsers = new Set(enrollmentData.map(e => e.username)).size;

        setStats({
          totalEnrollments: enrollmentData.length,
          uniqueCourses,
          uniqueUsers
        });
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BarChart2 size={24} className="text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800">User Enrollments</h1>
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
            icon={Users} 
            title="Total Enrollments" 
            value={stats.totalEnrollments} 
            color="text-blue-500"
          />
          <StatCard 
            icon={BookOpen} 
            title="Unique Courses" 
            value={stats.uniqueCourses} 
            color="text-green-500"
          />
          <StatCard 
            icon={Users} 
            title="Unique Users" 
            value={stats.uniqueUsers} 
            color="text-purple-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
            <BookOpen size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Enrollment Details</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Enrollment Date</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map(enrollment => (
                    <tr 
                      key={enrollment.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {enrollment.course}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookOpen size={48} className="mb-4 text-blue-300" />
              <p className="text-lg">No enrollments found</p>
              <p className="text-sm text-gray-400 mt-2">
                New course enrollments will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEnrolled;