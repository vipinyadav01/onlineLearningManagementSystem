import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, Users, ChevronRight } from 'lucide-react';

const COURSES_DATA = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, React and Node.js in this comprehensive course for beginners to advanced developers.",
    instructor: "Sarah Johnson",
    rating: 4.8,
    reviews: 2453,
    students: 42350,
    duration: "48 hours",
    level: "All Levels",
    price: 89.99,
    originalPrice: 199.99,
    category: "Web Development",
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    isBestseller: true,
    isNew: false,
  },
  {
    id: 2,
    title: "Advanced React & Redux Masterclass",
    description: "Take your React skills to the next level with advanced patterns, state management, and performance optimization.",
    instructor: "Michael Chen",
    rating: 4.9,
    reviews: 1876,
    students: 28542,
    duration: "32 hours",
    level: "Intermediate",
    price: 79.99,
    originalPrice: 149.99,
    category: "Frontend",
    tags: ["React", "Redux", "JavaScript", "TypeScript"],
    isBestseller: true,
    isNew: false,
  },
  {
    id: 3,
    title: "Python for Data Science & Machine Learning",
    description: "Learn Python programming and how to use it for data analysis, visualization, machine learning and AI applications.",
    instructor: "Dr. Alex Martinez",
    rating: 4.7,
    reviews: 3241,
    students: 56789,
    duration: "42 hours",
    level: "Beginner to Intermediate",
    price: 94.99,
    originalPrice: 189.99,
    category: "Data Science",
    tags: ["Python", "Data Science", "Machine Learning", "AI"],
    isBestseller: false,
    isNew: true,
  },
  {
    id: 4,
    title: "Full-Stack JavaScript with MERN Stack",
    description: "Build complete applications with MongoDB, Express, React, and Node.js. Master RESTful APIs and modern JS frameworks.",
    instructor: "David Wilson",
    rating: 4.6,
    reviews: 1532,
    students: 23456,
    duration: "38 hours",
    level: "Intermediate",
    price: 84.99,
    originalPrice: 169.99,
    category: "Fullstack",
    tags: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    isBestseller: false,
    isNew: false,
  },
  {
    id: 5,
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design. Create stunning designs using Figma and implement them with code.",
    instructor: "Emma Rodriguez",
    rating: 4.9,
    reviews: 2187,
    students: 31452,
    duration: "28 hours",
    level: "All Levels",
    price: 74.99,
    originalPrice: 129.99,
    category: "Design",
    tags: ["UI", "UX", "Figma", "Design", "User Research"],
    isBestseller: true,
    isNew: false,
  },
  {
    id: 6,
    title: "DevOps & Cloud Engineering Masterclass",
    description: "Master DevOps practices, CI/CD pipelines, containerization with Docker, orchestration with Kubernetes, and cloud deployment.",
    instructor: "James Park",
    rating: 4.8,
    reviews: 1243,
    students: 18964,
    duration: "36 hours",
    level: "Intermediate to Advanced",
    price: 99.99,
    originalPrice: 199.99,
    category: "DevOps",
    tags: ["DevOps", "Docker", "Kubernetes", "AWS", "CI/CD"],
    isBestseller: false,
    isNew: true,
  }
];

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

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter courses based on search term, category, and level
  const filteredCourses = COURSES_DATA.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level.includes(selectedLevel);
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 mb-12 relative overflow-hidden">
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
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center sm:justify-start gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-slate-600 rounded-lg py-3 px-4 text-white transition-colors sm:w-auto"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-slate-800 rounded-xl p-6 mb-8 transition-all duration-300 ${isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}>
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
      </div>

      {/* Course listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl text-white font-medium mb-2">No courses found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Link 
      to={`/courses/${course.id}`} 
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all hover:shadow-xl hover:shadow-teal-900/20 group"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={`/api/placeholder/800/450?text=Course+${course.id}`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {course.isBestseller && (
          <span className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">BESTSELLER</span>
        )}
        {course.isNew && (
          <span className="absolute top-4 left-4 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-teal-400 font-medium">{course.category}</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white ml-1 text-sm font-medium">{course.rating}</span>
            <span className="text-slate-400 ml-1 text-xs">({course.reviews})</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">{course.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{course.description}</p>
        <div className="flex items-center text-sm text-slate-400 mb-4">
          <Clock className="w-4 h-4 mr-1" />
          <span className="mr-4">{course.duration}</span>
          <Users className="w-4 h-4 mr-1" />
          <span>{course.students.toLocaleString()} students</span>
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
  );
};

export default Courses;