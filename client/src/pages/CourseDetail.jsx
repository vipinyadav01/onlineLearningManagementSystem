import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Clock, Calendar, BarChart, Award, CheckCircle, Play, 
  Download, Share2, BookOpen, Users, ChevronDown, ChevronUp
} from 'lucide-react';

// Sample course data from previous component
const COURSES_DATA = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, React and Node.js in this comprehensive course for beginners to advanced developers.",
    instructor: "Sarah Johnson",
    instructorTitle: "Senior Frontend Engineer",
    instructorBio: "Sarah has over 10 years of experience in web development and has worked with companies like Google and Microsoft. She specializes in frontend technologies and loves teaching beginners.",
    rating: 4.8,
    reviews: 2453,
    students: 42350,
    duration: "48 hours",
    lastUpdated: "February 2025",
    level: "All Levels",
    price: 89.99,
    originalPrice: 199.99,
    discount: 55,
    category: "Web Development",
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    isBestseller: true,
    isNew: false,
    whatYouWillLearn: [
      "Build 25+ projects including a full-stack web application from scratch",
      "Learn modern HTML5, CSS3, JavaScript (ES6+), React, Node.js, and Express",
      "Master both frontend and backend development environments",
      "Understand how to connect and work with databases (MongoDB)",
      "Implement authentication and authorization using JWT",
      "Deploy your applications to production with various hosting options",
      "Optimize your applications for performance and SEO"
    ],
    prerequisites: [
      "Basic computer knowledge",
      "No prior programming experience needed - we'll teach you everything from scratch!",
      "Computer with internet connection (Windows, Mac, or Linux)"
    ],
    curriculum: [
      {
        section: "Introduction to Web Development",
        lectures: 12,
        duration: "2 hours",
        content: [
          { title: "Course Overview", duration: "8:24", isFree: true },
          { title: "How the Internet Works", duration: "15:42", isFree: true },
          { title: "Setting Up Your Development Environment", duration: "20:15", isFree: false }
        ]
      },
      {
        section: "HTML Fundamentals",
        lectures: 15,
        duration: "4 hours",
        content: [
          { title: "HTML Document Structure", duration: "12:38", isFree: false },
          { title: "Working with Text Elements", duration: "18:22", isFree: false },
          { title: "Lists, Tables and Forms", duration: "25:14", isFree: false }
        ]
      },
      {
        section: "CSS Styling",
        lectures: 18,
        duration: "6 hours",
        content: [
          { title: "CSS Selectors and Properties", duration: "22:18", isFree: false },
          { title: "Box Model & Layout", duration: "28:42", isFree: false },
          { title: "Flexbox and Grid Systems", duration: "35:11", isFree: false }
        ]
      },
      {
        section: "JavaScript Programming",
        lectures: 25,
        duration: "10 hours",
        content: [
          { title: "JavaScript Syntax & Variables", duration: "18:55", isFree: false },
          { title: "Functions and Control Flow", duration: "32:17", isFree: false },
          { title: "DOM Manipulation", duration: "24:33", isFree: false }
        ]
      },
      {
        section: "Building with React",
        lectures: 22,
        duration: "9 hours",
        content: [
          { title: "React Fundamentals", duration: "28:44", isFree: false },
          { title: "Components and Props", duration: "22:16", isFree: false },
          { title: "State Management with Hooks", duration: "34:28", isFree: false }
        ]
      },
      {
        section: "Backend with Node.js",
        lectures: 20,
        duration: "8 hours",
        content: [
          { title: "Node.js Fundamentals", duration: "26:12", isFree: false },
          { title: "Express Framework", duration: "31:18", isFree: false },
          { title: "RESTful API Design", duration: "29:45", isFree: false }
        ]
      },
      {
        section: "Full Stack Projects",
        lectures: 15,
        duration: "9 hours",
        content: [
          { title: "Project Planning and Setup", duration: "18:24", isFree: false },
          { title: "Building the Backend API", duration: "42:37", isFree: false },
          { title: "Connecting Frontend to Backend", duration: "38:15", isFree: false }
        ]
      }
    ]
  },
  // Other course data is kept the same as previous artifact...
  {
    id: 2,
    title: "Advanced React & Redux Masterclass",
    instructor: "Michael Chen",
    rating: 4.9,
    // Additional sample data would go here
  },
  {
    id: 3,
    title: "Python for Data Science & Machine Learning",
    instructor: "Dr. Alex Martinez",
    rating: 4.7,
    // Additional sample data would go here
  }
];

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    // Simulate API call to fetch course by ID
    const fetchCourse = () => {
      setLoading(true);
      // Find course by ID from our sample data
      const foundCourse = COURSES_DATA.find(c => c.id === parseInt(id));
      
      setTimeout(() => {
        setCourse(foundCourse);
        setLoading(false);
      }, 500); // Simulate network delay
    };

    fetchCourse();
  }, [id]);

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Course Not Found</h2>
        <p className="text-slate-400 mb-8">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              {course.isBestseller && (
                <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded mb-4">BESTSELLER</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{course.rating}</span>
                  <span className="text-slate-400 ml-1">({course.reviews} reviews)</span>
                </div>
                <div className="text-slate-300">
                  <Users className="w-4 h-4 inline mr-1" />
                  {course.students.toLocaleString()} students
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-slate-300">Created by </span>
                <a href="#instructor" className="text-teal-400 hover:underline">{course.instructor}</a>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Last updated {course.lastUpdated}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration} total
                </div>
                <div className="flex items-center">
                  <BarChart className="w-4 h-4 mr-1" />
                  {course.level}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700">
              <div className="aspect-video relative">
                <img 
                  src={`/api/placeholder/800/450?text=Course+${course.id}+Preview`}
                  alt={`${course.title} preview`}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-3xl font-bold">${course.price}</span>
                  {course.originalPrice > course.price && (
                    <>
                      <span className="text-lg text-slate-400 line-through">${course.originalPrice}</span>
                      <span className="text-lg text-teal-400">{course.discount}% off</span>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                    Enroll Now
                  </button>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                    Try Free Preview
                  </button>
                </div>
                
                <div className="mt-6 border-t border-slate-700 pt-6">
                  <h3 className="font-medium mb-4">This course includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Clock className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>{course.duration} on-demand video</span>
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>25 articles & resources</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>Downloadable source code</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button className="text-slate-300 hover:text-white">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="text-slate-300 hover:text-white">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* What you'll learn */}
            <section className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Prerequisites */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-3 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            {/* Course content/curriculum */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="text-sm text-slate-300">
                  {course.curriculum.reduce((total, section) => total + section.lectures, 0)} lectures • {course.duration}
                </div>
              </div>
              
              <div className="border border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-700">
                {course.curriculum.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="bg-slate-800">
                    <button 
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex justify-between items-center p-4 hover:bg-slate-700 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{section.section}</h3>
                        <p className="text-sm text-slate-400">{section.lectures} lectures • {section.duration}</p>
                      </div>
                      {expandedSections[sectionIndex] ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    
                    {expandedSections[sectionIndex] && (
                      <div className="bg-slate-900 divide-y divide-slate-800">
                        {section.content.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className="flex justify-between items-center p-4 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center">
                              <Play className="w-4 h-4 text-slate-400 mr-3" />
                              <span>
                                {lecture.title}
                                {lecture.isFree && (
                                  <span className="ml-2 text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Preview</span>
                                )}
                              </span>
                            </div>
                            <span className="text-sm text-slate-400">{lecture.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </section>
            
            {/* Instructor section */}
            <section id="instructor" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-16 h-16 rounded-full bg-slate-600 overflow-hidden">
                      <img 
                        src={`/api/placeholder/200/200?text=${course.instructor.charAt(0)}`}
                        alt={course.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{course.instructor}</h3>
                    <p className="text-teal-400">{course.instructorTitle}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{course.rating} Instructor Rating</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 text-slate-400 mr-1" />
                    <span>15 Courses</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-slate-400 mr-1" />
                    <span>{course.students.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Play className="w-4 h-4 text-slate-400 mr-1" />
                    <span>126 Reviews</span>
                  </div>
                </div>
                
                <p className="text-slate-300">
                  {course.instructorBio}
                </p>
              </div>
            </section>
            
            {/* Student reviews */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{course.rating}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= Math.floor(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-400">Course Rating</div>
                  </div>
                  
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(rating => {
                      // Calculate percentage (mock data)
                      const percentage = rating === 5 ? 78 : 
                                        rating === 4 ? 15 : 
                                        rating === 3 ? 5 : 
                                        rating === 2 ? 1.5 : 0.5;
                      
                      return (
                        <div key={rating} className="flex items-center gap-2 mb-1">
                          <div className="flex items-center w-24">
                            <span className="mr-1">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-right text-sm text-slate-400">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Sample reviews */}
                <div className="space-y-6">
                  <div className="border-t border-slate-700 pt-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden mr-3">
                          <img 
                            src="/api/placeholder/100/100?text=JD"
                            alt="John Doe"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">John Doe</h4>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className="w-4 h-4 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">2 weeks ago</span>
                    </div>
                    <p className="text-slate-300">
                      This course is absolutely fantastic! The instructor explains complex concepts in a way that's easy to understand. 
                      I've tried other courses before but this one really helped me grasp the fundamentals.
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden mr-3">
                          <img 
                            src="/api/placeholder/100/100?text=AS"
                            alt="Alice Smith"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">Alice Smith</h4>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4].map(star => (
                              <Star key={star} className="w-4 h-4 fill-yellow-400" />
                            ))}
                            <Star className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">1 month ago</span>
                    </div>
                    <p className="text-slate-300">
                      Great course overall. I would have liked to see more practical examples in the later sections, 
                      but the content is comprehensive and well-explained. The projects are challenging but rewarding.
                    </p>
                  </div>
                  
                  <div className="text-center pt-4">
                    <button className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                      Show all reviews
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              {/* Related courses */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                <h3 className="text-xl font-bold mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {COURSES_DATA.filter(c => c.id !== course.id).slice(0, 3).map(relatedCourse => (
                    <Link 
                      key={relatedCourse.id} 
                      to={`/courses/${relatedCourse.id}`}
                      className="flex gap-3 hover:bg-slate-700 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={`/api/placeholder/100/100?text=${relatedCourse.id}`}
                          alt={relatedCourse.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{relatedCourse.title}</h4>
                        <div className="flex items-center text-xs">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="ml-1">{relatedCourse.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{relatedCourse.instructor}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <Link 
                      key={tag} 
                      to={`/courses?tag=${tag}`}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your learning journey?</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of students already mastering web development with our comprehensive courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Enroll Now
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Try Free Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
