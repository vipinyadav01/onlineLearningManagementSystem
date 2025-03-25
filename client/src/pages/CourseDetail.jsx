import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Clock, Calendar, BarChart, Award, CheckCircle, Play, 
  Download, Share2, BookOpen, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
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
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-slate-900 text-white">
        <h2 className="text-3xl font-bold mb-4">Course Not Found</h2>
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
              {course.isNew && !course.isBestseller && (
                <span className="inline-block bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded mb-4">NEW</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{course.rating || 'N/A'}</span>
                  <span className="text-slate-400 ml-1">({course.reviews || 0} reviews)</span>
                </div>
                <div className="text-slate-300">
                  <Users className="w-4 h-4 inline mr-1" />
                  {course.students?.toLocaleString() || 0} students
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-slate-300">Created by </span>
                <a href="#instructor" className="text-teal-400 hover:underline">{course.instructor}</a>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Last updated {course.lastUpdated || 'N/A'}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration || 'N/A'} total
                </div>
                <div className="flex items-center">
                  <BarChart className="w-4 h-4 mr-1" />
                  {course.level || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700">
              <div className="aspect-video relative">
                <img 
                  src={course.image || `/api/placeholder/800/450?text=${course.title}`}
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
                      <span className="text-lg text-teal-400">{course.discount || 0}% off</span>
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
                      <span>{course.duration || 'N/A'} on-demand video</span>
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>Resources available</span>
                    </li>
                    <li className="flex items-start">
                      <Download className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                      <span>Downloadable content</span>
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
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                  course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex">
                      <CheckCircle className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No learning objectives specified.</p>
                )}
              </div>
            </section>
            
            {/* Prerequisites */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-400 mr-3 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400">No prerequisites specified.</p>
                )}
              </ul>
            </section>
            
            {/* Course content/curriculum */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="text-sm text-slate-300">
                  {course.curriculum?.reduce((total, section) => total + (section.lectures || 0), 0) || 0} lectures • {course.duration || 'N/A'}
                </div>
              </div>
              
              <div className="border border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-700">
                {course.curriculum && course.curriculum.length > 0 ? (
                  course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-slate-800">
                      <button 
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full flex justify-between items-center p-4 hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{section.section}</h3>
                          <p className="text-sm text-slate-400">{section.lectures || 0} lectures • {section.duration || 'N/A'}</p>
                        </div>
                        {expandedSections[sectionIndex] ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      
                      {expandedSections[sectionIndex] && (
                        <div className="bg-slate-900 divide-y divide-slate-800">
                          {section.content && section.content.length > 0 ? (
                            section.content.map((lecture, lectureIndex) => (
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
                                <span className="text-sm text-slate-400">{lecture.duration || 'N/A'}</span>
                              </div>
                            ))
                          ) : (
                            <p className="p-4 text-slate-400">No content available for this section.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-slate-400">No curriculum available.</p>
                )}
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
                        src={course.image || `/api/placeholder/200/200?text=${course.instructor?.charAt(0) || 'I'}`}
                        alt={course.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{course.instructor}</h3>
                    <p className="text-teal-400">{course.instructorTitle || 'Instructor'}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{course.rating || 'N/A'} Instructor Rating</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 text-slate-400 mr-1" />
                    <span>Courses Taught</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-slate-400 mr-1" />
                    <span>{course.students?.toLocaleString() || 0} Students</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Play className="w-4 h-4 text-slate-400 mr-1" />
                    <span>{course.reviews || 0} Reviews</span>
                  </div>
                </div>
                
                <p className="text-slate-300">
                  {course.instructorBio || 'No bio available.'}
                </p>
              </div>
            </section>
            
            {/* Student reviews */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{course.rating || 'N/A'}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= Math.floor(course.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-400">Course Rating</div>
                  </div>
                  
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(rating => {
                      // Mock percentage data (replace with real data if available from backend)
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
                
                {/* Sample reviews (could be fetched separately from backend if added) */}
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
                  {/* Fetch related courses dynamically if backend supports it */}
                  <p className="text-slate-400">Related courses feature coming soon.</p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags && course.tags.length > 0 ? (
                    course.tags.map(tag => (
                      <Link 
                        key={tag} 
                        to={`/courses?tag=${tag}`}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-400">No tags available.</p>
                  )}
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
            Join thousands of students already mastering skills with our comprehensive courses.
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