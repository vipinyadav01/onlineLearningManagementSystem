import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AlertCircle, RefreshCw, User, BookOpen } from 'lucide-react';

const CourseCreators = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/courses/admin/with-creators');
      setCourses(response.data.courses);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Group courses by creator
  const grouped = courses.reduce((acc, course) => {
    const creator = course.createdBy?.name || 'Unknown';
    if (!acc[creator]) acc[creator] = [];
    acc[creator].push(course);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md">
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Course Creators</h1>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="text-gray-500 text-center py-12">No courses found.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([creator, courses]) => (
            <div key={creator} className="bg-gray-50 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-lg text-gray-800">{creator}</span>
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{courses.length} course{courses.length > 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {courses.map(course => (
                      <tr key={course._id}>
                        <td className="px-4 py-2 font-medium text-indigo-700">{course.title}</td>
                        <td className="px-4 py-2 text-gray-700">{course.category}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(course.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCreators; 