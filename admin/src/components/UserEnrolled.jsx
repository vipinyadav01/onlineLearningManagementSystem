import React, { useState, useEffect } from 'react';
import { BarChart2, Users, BookOpen, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserEnrolled({ onLogout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const enrollmentData = response.data.stats.topCourses.map((course, index) => ({
        id: `${course._id}-${index}`,
        course: course._id,
        totalEnrollments: course.totalEnrollments,
        date: new Date()
      }));
      
      setEnrollments(enrollmentData);
    } catch (error) {
      if (error.response?.status === 401) {
        onLogout();
        navigate('/login');
      }
      setError(error.response?.data?.message || 'Failed to load enrollments');
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [navigate, onLogout]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div 
          key={index} 
          className="bg-white shadow-md rounded-lg p-4 animate-pulse flex items-center space-x-4"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`${color} w-6 h-6`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  // Error Handling Component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <AlertTriangle size={64} className="text-red-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Something Went Wrong</h2>
      <p className="text-gray-600 max-w-md">{error || 'Unable to load enrollments'}</p>
      <div className="flex space-x-4">
        <button 
          onClick={fetchEnrollments}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
      <BookOpen size={64} className="mb-4 text-blue-300" />
      <h2 className="text-xl font-semibold text-gray-800">No Enrollments Found</h2>
      <p className="text-gray-600 max-w-md mt-2">
        It looks like there are no course enrollments at the moment. 
        New enrollments will appear here as they occur.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-blue-100">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={Users} 
            title="Total Enrollments" 
            value={enrollments.reduce((sum, e) => sum + (e.totalEnrollments || 0), 0)} 
            color="text-blue-500"
          />
          <StatCard 
            icon={BookOpen} 
            title="Unique Courses" 
            value={enrollments.length} 
            color="text-green-500"
          />
          <StatCard 
            icon={Users} 
            title="Top Course Enrollments" 
            value={enrollments[0]?.totalEnrollments || 0} 
            color="text-purple-500"
          />
        </div>

        {/* Enrollment Details */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
            <BookOpen size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Enrollment Details</h2>
          </div>

          {/* Conditional Rendering */}
          {loading ? (
            <div className="p-4">
              <SkeletonLoader />
            </div>
          ) : error ? (
            <ErrorDisplay />
          ) : enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course ID</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enrollments</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Last Updated</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map(enrollment => (
                    <tr 
                      key={enrollment.id} 
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {enrollment.course}
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.totalEnrollments}
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
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserEnrolled;