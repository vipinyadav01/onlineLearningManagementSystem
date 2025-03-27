import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, Users, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  "All Categories",
  "Web Development",
  "Frontend",
  "Backend",
  "Fullstack",
  "Data Science",
  "Mobile Development",
  "DevOps",
  "Design"
];

const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const CourseSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    className="bg-slate-800 rounded-xl overflow-hidden animate-pulse"
  >
    <div className="aspect-video bg-slate-700"></div>
    <div className="p-6">
      <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-full mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>
  </motion.div>
);

const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen bg-slate-900 flex items-center justify-center"
  >
    <div className="text-center bg-slate-800 p-8 rounded-xl border border-red-500/30">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
      <p className="text-slate-400 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center mx-auto"
      >
        <RefreshCw className="mr-2 w-5 h-5" />
        Try Again
      </button>
    </div>
  </motion.div>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(''); // Reset error state

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/courses`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Courses response:', response.data);

      // Assuming the backend returns { success: true, courses: [...] }
      if (response.data.success && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
        if (response.data.courses.length === 0) {
          setError('No courses available at the moment.');
        }
      } else {
        setError(response.data.message || 'No courses found');
        setCourses([]);
      }
    } catch (err) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      const errorMessage =
        err.response?.status === 404
          ? 'Courses endpoint not found'
          : err.response?.data?.message || 'Failed to load courses. Please check your connection.';

      setError(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || (course.level && course.level.includes(selectedLevel));

    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (error && !loading) {
    return <ErrorState message={error} onRetry={fetchCourses} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-slate-900 text-white"
    >
      {/* Hero section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 mb-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <img
            src="/api/placeholder/1200/400"
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Expand Your Knowledge</h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mb-6">
            Discover courses taught by industry experts and take your skills to the next level with hands-on projects and real-world applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center sm:justify-start gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-slate-600 rounded-lg py-3 px-4 text-white transition-colors sm:w-auto"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 rounded-xl p-6 mb-8 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course listings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          // Skeleton Loaders
          <>
            {[1, 2, 3, 4, 5, 6].map(item => (
              <CourseSkeleton key={item} />
            ))}
          </>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full text-center py-12 bg-slate-800 rounded-xl"
          >
            <h3 className="text-xl text-white font-medium mb-2">No courses found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        to={`/courses/${course._id}`}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all hover:shadow-xl hover:shadow-teal-900/20 group block"
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={course.image || `/api/placeholder/800/450?text=${course.title}`}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {course.isBestseller && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded"
            >
              BESTSELLER
            </motion.span>
          )}
          {course.isNew && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded"
            >
              NEW
            </motion.span>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-teal-400 font-medium">{course.category}</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white ml-1 text-sm font-medium">{course.rating || 'N/A'}</span>
              <span className="text-slate-400 ml-1 text-xs">({course.reviews || 0})</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">{course.title}</h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">{course.description}</p>
          <div className="flex items-center text-sm text-slate-400 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            <span className="mr-4">{course.duration || 'N/A'}</span>
            <Users className="w-4 h-4 mr-1" />
            <span>{course.students?.toLocaleString() || 0} students</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-white">${course.price}</span>
              {course.originalPrice > course.price && (
                <span className="text-sm text-slate-400 line-through ml-2">${course.originalPrice}</span>
              )}
            </div>
            <div className="text-teal-400 flex items-center font-medium text-sm group-hover:translate-x-1 transition-transform">
              <span>View Course</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Courses;