import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, Users, ChevronRight, AlertTriangle, RefreshCw, X, Loader2 } from 'lucide-react';
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

const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Free", value: "free" },
  { label: "Under ₹2,999", value: "under2999" },
  { label: "₹3,000 - ₹6,999", value: "3000-6999" },
  { label: "₹7,000 - ₹10,999", value: "7000-10999" },
  { label: "Over ₹10,999", value: "over10999" }
];


const CourseSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-teal-400/30 transition-all"
  >
    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700/50 animate-pulse"></div>
    <div className="p-5">
      <div className="h-4 bg-slate-700/50 rounded-full w-1/2 mb-4"></div>
      <div className="h-6 bg-slate-700/50 rounded-full w-3/4 mb-3"></div>
      <div className="h-3 bg-slate-700/50 rounded-full w-full mb-4"></div>
      <div className="h-3 bg-slate-700/50 rounded-full w-full mb-4"></div>
      <div className="flex justify-between mt-6">
        <div className="h-4 bg-slate-700/50 rounded-full w-1/4"></div>
        <div className="h-4 bg-slate-700/50 rounded-full w-1/4"></div>
      </div>
    </div>
  </motion.div>
);

const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="col-span-full py-16 text-center"
  >
    <div className="max-w-md mx-auto bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-red-500/20">
      <div className="inline-flex items-center justify-center bg-red-500/10 p-4 rounded-full mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
      <p className="text-slate-400 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg transition-all flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20"
      >
        <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
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
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError('');

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/courses`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

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
      const errorMessage =
        err.response?.status === 404
          ? 'Courses endpoint not found'
          : err.response?.data?.message || 'Failed to load courses. Please check your connection.';

      setError(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
    
    // Price filtering
    let matchesPrice = true;

    if (selectedPrice === "free") {
      matchesPrice = course.price === 0;
    } else if (selectedPrice === "under2999") {
      matchesPrice = course.price >= 999 && course.price < 3000;
    } else if (selectedPrice === "3000-6999") {
      matchesPrice = course.price >= 3000 && course.price <= 6999;
    } else if (selectedPrice === "7000-10999") {
      matchesPrice = course.price >= 7000 && course.price <= 10999;
    } else if (selectedPrice === "over10999") {
      matchesPrice = course.price > 10999;
    }
    

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedLevel('All Levels');
    setSelectedPrice('all');
  };

  if (error && !loading) {
    return <ErrorState message={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Course Explorer
            </h1>
            <button
              onClick={fetchCourses}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and filter bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm pb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between mb-6">
            <div className="w-full md:w-auto">
              <h2 className="text-2xl font-bold text-white mb-2">Browse Courses</h2>
              <p className="text-slate-400">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
              </p>
            </div>
            
            <div className="w-full md:w-auto flex gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl py-2.5 px-4 text-white transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm !== '' || selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels' || selectedPrice !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {searchTerm !== '' && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm"
                >
                  <span className="text-slate-300">Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
              {selectedCategory !== 'All Categories' && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm"
                >
                  <span className="text-slate-300">{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('All Categories')}
                    className="ml-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
              {selectedLevel !== 'All Levels' && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm"
                >
                  <span className="text-slate-300">{selectedLevel}</span>
                  <button
                    onClick={() => setSelectedLevel('All Levels')}
                    className="ml-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
              {selectedPrice !== 'all' && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-sm"
                >
                  <span className="text-slate-300">
                    {PRICE_RANGES.find(p => p.value === selectedPrice)?.label}
                  </span>
                  <button
                    onClick={() => setSelectedPrice('all')}
                    className="ml-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
              <button
                onClick={clearFilters}
                className="text-teal-400 hover:text-teal-300 text-sm flex items-center ml-2"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 rounded-xl p-6 mb-8 overflow-hidden border border-slate-800 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <div className="space-y-2">
                    {CATEGORIES.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === category ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                  <div className="space-y-2">
                    {LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedLevel === level ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price Range</label>
                  <div className="space-y-2">
                    {PRICE_RANGES.map(range => (
                      <button
                        key={range.value}
                        onClick={() => setSelectedPrice(range.value)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedPrice === range.value ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course listings */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map(item => (
              <CourseSkeleton key={item} />
            ))}
          </motion.div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <div className="max-w-md mx-auto bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800">
              <div className="inline-flex items-center justify-center bg-slate-800 p-4 rounded-full mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Link
        to={`/courses/${course._id}`}
        className="h-full flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-800/30 rounded-2xl overflow-hidden border border-slate-800 hover:border-teal-500/30 transition-all group"
      >
        <div className="aspect-video relative overflow-hidden">
          <motion.img
            src={course.image || `/api/placeholder/800/450?text=${course.title}`}
            alt={course.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.isBestseller && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full"
              >
                Bestseller
              </motion.span>
            )}
            {course.isNew && !course.isBestseller && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
              >
                New
              </motion.span>
            )}
          </div>
          
          {/* View button appears on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center shadow-lg shadow-teal-500/20">
              View Course
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </motion.div>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-full">
              {course.category || 'Development'}
            </span>
            <div className="flex items-center bg-slate-800/50 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium ml-1">{course.rating || '4.8'}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
          
          <div className="mt-auto pt-4 border-t border-slate-800/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-xs text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.duration || '10h'}
                </div>
                <div className="flex items-center text-xs text-slate-400">
                  <Users className="w-3 h-3 mr-1" />
                  {course.students?.toLocaleString() || '1.2k'}
                </div>
              </div>
              
              <div className="text-right">
                {course.price === 0 ? (
                  <span className="text-teal-400 font-bold">₹-Free</span>
                ) : (
                  <>
                    <span className="text-white font-bold">₹{course.price}</span>
                    {course.originalPrice > course.price && (
                      <span className="text-slate-500 text-xs line-through ml-1">₹{course.originalPrice}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Courses;