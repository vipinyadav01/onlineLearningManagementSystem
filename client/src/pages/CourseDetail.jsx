import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Clock, Calendar, BarChart, Award, CheckCircle, Play,
  Download, Share2, BookOpen, Users, ChevronDown, ChevronUp,
  Heart, Bookmark, MessageSquare, ThumbsUp, Edit2, Trash2
} from 'lucide-react';
import axios from 'axios';

// 🔒 Refresh token handler
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } else {
      throw new Error(`Invalid refresh token response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('Error refreshing token:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// ✅ Axios instance with interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      window.location.href = '/login?message=Session%20expired';
    }
    return Promise.reject(error);
  }
);

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [videoHover, setVideoHover] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [editingReview, setEditingReview] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        return null;
      }

      const res = await api.get('/auth/me');
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch user');
      }

      const userData = res.data.data;
      if (!userData || !userData._id) {
        throw new Error('Invalid user data received');
      }

      return {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        profilePic: userData.profilePic,
        isActive: userData.isActive,
        isAdmin: userData.isAdmin,
      };
    } catch (err) {
      console.error('Failed to fetch user:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchCourseAndUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const [userData, courseRes, reviewsRes] = await Promise.all([
          fetchUser(),
          api.get(`/admin/courses/${id}`),
          api.get(`/reviews/${id}`),
        ]);

        setUser(userData);
        if (!courseRes.data.success) throw new Error(courseRes.data.message || 'Course not found');
        setCourse(courseRes.data.course);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(
          err.response?.status === 404
            ? 'Course not found'
            : err.response?.data?.message || 'Failed to fetch course'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseAndUser();
  }, [id, fetchUser]);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleEnrollNow = () => {
    if (course) navigate('/checkout', { state: { course } });
  };

  const toggleLike = () => setIsLiked((prev) => !prev);
  const toggleBookmark = () => setIsBookmarked((prev) => !prev);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setReviewError('You must be logged in to submit a review.');
    if (!newReview.rating) return setReviewError('Please select a rating.');
    if (!newReview.comment.trim()) return setReviewError('Please enter a comment.');

    try {
      setReviewLoading(true);
      setReviewError(null);

      if (editingReview) {
        const res = await api.put(`/reviews/${editingReview._id}`, newReview);
        setReviews(reviews.map((r) => (r._id === editingReview._id ? res.data.review : r)));
        setEditingReview(null);
      } else {
        const res = await api.post('/reviews', {
          ...newReview,
          courseId: id,
          userId: user.id,
          userName: user.name || 'Anonymous',
          userImage: user.profilePic || 'https://via.placeholder.com/200x200?text=User',
        });
        setReviews([...reviews, res.data.review]);
      }

      setNewReview({ rating: 0, comment: '' });
    } catch (err) {
      console.error('Submit error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setNewReview({ rating: review.rating, comment: review.comment });
    setReviewError(null);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setReviewLoading(true);
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error('Delete error:', err);
      setReviewError(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(reviews.map((r) => (r._id === reviewId ? res.data.review : r)));
    } catch (err) {
      console.error('Helpful vote error:', err);
      setReviewError(err.response?.data?.message || 'Failed to vote helpful.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-slate-900 text-white">
        <h2 className="text-3xl font-bold mb-4">{error || 'Course Not Found'}</h2>
        <p className="text-slate-400 mb-8">
          {error ? error : "The course you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/courses"
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  return (
    <div className="bg-slate-900 text-white">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                {course.isBestseller && (
                  <span className="inline-block bg-yellow-500/90 text-black text-xs font-medium px-3 py-1 rounded-full">
                    BESTSELLER
                  </span>
                )}
                {course.isNew && !course.isBestseller && (
                  <span className="inline-block bg-teal-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                    NEW
                  </span>
                )}
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 text-sm ${isLiked ? 'text-pink-400' : 'text-slate-400'
                    } hover:text-pink-400 transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-400' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={toggleBookmark}
                  className={`flex items-center gap-1.5 text-sm ${isBookmarked ? 'text-teal-400' : 'text-slate-400'
                    } hover:text-teal-400 transition-colors`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-400' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{course.title || 'Untitled Course'}</h1>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">{course.description || 'No description available'}</p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center">
                  <div className="flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1.5 font-medium">{averageRating}</span>
                    <span className="text-slate-400 ml-1">({reviews.length})</span>
                  </div>
                </div>
                <div className="text-slate-300 flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5">
                  <Users className="w-4 h-4 inline mr-2" />
                  {(course.students || 0).toLocaleString()} students
                </div>
                <div className="text-slate-300 flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5">
                  <Clock className="w-4 h-4 mr-2" />
                  {course.duration || 'N/A'}
                </div>
                <div className="text-slate-300 flex items-center bg-slate-800/60 rounded-lg px-3 py-1.5">
                  <BarChart className="w-4 h-4 mr-2" />
                  {course.level || 'N/A'}
                </div>
              </div>

              <div className="mb-8">
                <span className="text-slate-300">Created by </span>
                <a href="#instructor" className="text-teal-400 hover:underline font-medium">
                  {course.instructor || 'Unknown Instructor'}
                </a>
                <span className="text-slate-400 ml-3 text-sm">
                  Last updated {course.lastUpdated || 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
              <div
                className="aspect-video relative"
                onMouseEnter={() => setVideoHover(true)}
                onMouseLeave={() => setVideoHover(false)}
              >
                <img
                  src={course.image || 'https://via.placeholder.com/800x450?text=Course+Preview'}
                  alt={`${course.title || 'Course'} preview`}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${videoHover ? 'opacity-100' : 'opacity-90'
                    }`}
                >
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </button>
                  {videoHover && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Preview this course
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-end gap-3 mb-8">
                  <span className="text-4xl font-bold">₹{course.price || 0}</span>
                  {course.originalPrice > course.price && (
                    <>
                      <span className="text-lg text-slate-400 line-through">₹{course.originalPrice}</span>
                      <span className="text-lg text-teal-400 font-medium">{course.discount || 0}% off</span>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEnrollNow}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Enroll Now</span>
                  </button>
                  <button className="w-full bg-slate-700/80 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300">
                    Add to Wishlist
                  </button>
                </div>

                <div className="mt-8 border-t border-slate-700/50 pt-6">
                  <h3 className="font-medium mb-4 text-lg">This course includes:</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start group">
                      <Clock className="w-5 h-5 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-white transition-colors">{course.duration || 'N/A'} on-demand video</span>
                    </li>
                    <li className="flex items-start group">
                      <BookOpen className="w-5 h-5 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-white transition-colors">Comprehensive resources</span>
                    </li>
                    <li className="flex items-start group">
                      <Download className="w-5 h-5 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-white transition-colors">Downloadable materials</span>
                    </li>
                    <li className="flex items-start group">
                      <Award className="w-5 h-5 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-white transition-colors">Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6">
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Share this course"
                  >
                    <div className="bg-slate-700/50 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
                      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs">Share</span>
                  </button>
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Download resources"
                  >
                    <div className="bg-slate-700/50 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
                      <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs">Resources</span>
                  </button>
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Gift this course"
                  >
                    <div className="bg-slate-700/50 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
                      <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs">Gift</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="flex border-b border-slate-700/50 mb-12">
              <button
                className={`px-6 py-4 font-medium text-base relative ${activeTab === 'curriculum' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('curriculum')}
              >
                Curriculum
                {activeTab === 'curriculum' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-teal-400 rounded-t-lg"></span>
                )}
              </button>
              <button
                className={`px-6 py-4 font-medium text-base relative ${activeTab === 'overview' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
                {activeTab === 'overview' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-teal-400 rounded-t-lg"></span>
                )}
              </button>
              <button
                className={`px-6 py-4 font-medium text-base relative ${activeTab === 'reviews' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-teal-400 rounded-t-lg"></span>
                )}
              </button>
            </div>

            <section className="mb-16 bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 hover:border-teal-400/30 transition-all duration-300 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8">What you&lsquo learn</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                  course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex group">
                      <CheckCircle className="w-6 h-6 text-teal-400 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-teal-300 transition-colors">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No learning objectives specified.</p>
                )}
              </div>
            </section>

            <section className="mb-16 bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 hover:border-teal-400/30 transition-all duration-300 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8">Prerequisites</h2>
              <ul className="space-y-4">
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <CheckCircle className="w-6 h-6 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-teal-300 transition-colors">{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400">No prerequisites specified.</p>
                )}
              </ul>
            </section>

            {activeTab === 'curriculum' && (
              <section className="mb-16">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Course Content</h2>
                  <div className="text-sm text-slate-300">
                    {course.curriculum?.reduce((total, section) => total + (section.lectures || 0), 0) || 0} lectures • {course.duration || 'N/A'}
                  </div>
                </div>

                <div className="border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm divide-y divide-slate-700/50">
                  {course.curriculum && course.curriculum.length > 0 ? (
                    course.curriculum.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="bg-slate-800/40 hover:bg-slate-750 transition-colors">
                        <button
                          onClick={() => toggleSection(sectionIndex)}
                          className="w-full flex justify-between items-center p-5 hover:bg-slate-700/50 transition-colors text-left"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{section.section}</h3>
                            <p className="text-sm text-slate-400 mt-1">{section.lectures || 0} lectures • {section.duration || 'N/A'}</p>
                          </div>
                          {expandedSections[sectionIndex] ? (
                            <ChevronUp className="w-5 h-5 text-teal-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-teal-400" />
                          )}
                        </button>

                        {expandedSections[sectionIndex] && (
                          <div className="bg-slate-900/70 divide-y divide-slate-800/50">
                            {section.content && section.content.length > 0 ? (
                              section.content.map((lecture, lectureIndex) => (
                                <div key={lectureIndex} className="flex justify-between items-center p-5 hover:bg-slate-800/70 transition-colors group">
                                  <div className="flex items-center">
                                    <div className="mr-3 bg-slate-700/50 p-2 rounded-full group-hover:bg-teal-500/20 transition-colors">
                                      <Play className="w-4 h-4 text-slate-300 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    <span className="group-hover:text-teal-300 transition-colors">
                                      {lecture.title}
                                      {lecture.isFree && (
                                        <span className="ml-2 text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">Preview</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{lecture.duration || 'N/A'}</span>
                                </div>
                              ))
                            ) : (
                              <p className="p-5 text-slate-400">No content available for this section.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-5 text-slate-400">No curriculum available.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'overview' && (
              <section className="mb-16 bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50">
                <h2 className="text-2xl font-bold mb-8">Course Overview</h2>
                <div className="prose prose-invert max-w-none prose-headings:text-teal-400 prose-a:text-teal-400 prose-strong:text-white">
                  {course.overview ? (
                    <div dangerouslySetInnerHTML={{ __html: course.overview }} />
                  ) : (
                    <p className="text-slate-400">No overview available for this course.</p>
                  )}
                </div>
              </section>
            )}

            <section id="instructor" className="mb-16 bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 hover:border-teal-400/30 transition-all duration-300 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8">Your Instructor</h2>

              <div className="flex flex-col md:flex-row items-start gap-6">
                <div>
                  <div className="w-24 h-24 rounded-full bg-slate-600 overflow-hidden border-2 border-teal-400/50 hover:border-teal-400 transition-colors shadow-lg">
                    <img
                      src={course.image || 'https://via.placeholder.com/200x200?text=Instructor'}
                      alt={course.instructor || 'Instructor'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold hover:text-teal-400 transition-colors">
                      <a href="#instructor">{course.instructor || 'Unknown Instructor'}</a>
                    </h3>
                    <p className="text-teal-400 text-lg">{course.instructorTitle || 'Instructor'}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm group bg-slate-700/30 p-3 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400 mr-2 group-hover:scale-110 transition-transform" /><span>{averageRating} Instructor Rating</span>
                    </div>
                    <div className="flex items-center text-sm group bg-slate-700/30 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-teal-400 mr-2 group-hover:scale-110 transition-transform" />
                      <span>{(course.totalStudents || 0).toLocaleString()} Students</span>
                    </div>
                    <div className="flex items-center text-sm group bg-slate-700/30 p-3 rounded-lg">
                      <BookOpen className="w-5 h-5 text-teal-400 mr-2 group-hover:scale-110 transition-transform" />
                      <span>{course.totalCourses || 0} Courses</span>
                    </div>
                    <div className="flex items-center text-sm group bg-slate-700/30 p-3 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-teal-400 mr-2 group-hover:scale-110 transition-transform" />
                      <span>{course.totalReviews || 0} Reviews</span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-6">
                    {course.instructorBio || 'No instructor bio available.'}
                  </p>

                  <a
                    href="#contact-instructor"
                    className="inline-flex items-center text-teal-400 hover:text-teal-300 font-medium transition-colors"
                  >
                    Contact Instructor
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </section>

            {activeTab === 'reviews' && (
              <section className="mb-16">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Student Reviews</h2>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1.5 font-medium">{averageRating}</span>
                    <span className="text-slate-400 ml-1">({reviews.length} ratings)</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-8 mb-12">
                  <div className="md:col-span-2 bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-6">Review Summary</h3>
                    <div className="space-y-4 mb-6">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter((r) => r.rating === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                        return (
                          <div key={rating} className="flex items-center">
                            <div className="w-24 text-sm flex items-center">
                              <span>{rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 ml-1" />
                            </div>
                            <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-right text-sm text-slate-400">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    {user ? (
                      <div className="mb-8 bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-xl font-bold mb-4">{editingReview ? 'Edit Your Review' : 'Add a Review'}</h3>
                        <form onSubmit={handleReviewSubmit}>
                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Rating</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setNewReview({ ...newReview, rating })}
                                  className="hover:scale-110 transition-transform focus:outline-none"
                                >
                                  <Star
                                    className={`w-6 h-6 ${newReview.rating >= rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-slate-500'
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Comment</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              rows={4}
                              placeholder="Share your experience about this course..."
                            ></textarea>
                          </div>

                          {reviewError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                              {reviewError}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={reviewLoading}
                              className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                              {reviewLoading ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                            </button>

                            {editingReview && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReview(null);
                                  setNewReview({ rating: 0, comment: '' });
                                }}
                                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="mb-8 bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 text-center">
                        <p className="mb-4">You need to be logged in to leave a review.</p>
                        <Link
                          to="/login"
                          className="inline-block bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Log In to Review
                        </Link>
                      </div>
                    )}

                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div
                            key={review._id}
                            className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-teal-400/30 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden mr-4">
                                  <img
                                    src={review.profilePic || `https://via.placeholder.com/40x40?text=${review.userName?.charAt(0) || 'U'}`}
                                    alt={review.userName || 'User'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">{review.userName || 'Anonymous'}</h4>
                                  <div className="flex items-center mt-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-4 h-4 ${review.rating >= star
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-slate-500'
                                            }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-slate-400 ml-2">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {user && review.userId === user.id && (
                                <div className="flex">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="text-slate-400 hover:text-teal-400 p-1"
                                    title="Edit review"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="text-slate-400 hover:text-red-400 p-1"
                                    title="Delete review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-slate-300 mb-4">{review.comment}</p>

                            <div className="flex justify-between items-center text-sm">
                              <button
                                onClick={() => handleHelpfulVote(review._id)}
                                className={`flex items-center gap-1.5 ${review.helpfulVotes?.includes(user?.id)
                                    ? 'text-teal-400'
                                    : 'text-slate-400 hover:text-teal-400'
                                  } transition-colors`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>
                                  Helpful ({review.helpfulVotes?.length || 0})
                                </span>
                              </button>

                              <span className="text-slate-400">
                                {review.isVerifiedPurchase && (
                                  <span className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-teal-400 mr-1" />
                                    Verified Purchase
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                          <p className="text-lg text-slate-300 mb-2">No reviews yet</p>
                          <p className="text-slate-400">Be the first to review this course!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Related Courses</h3>
              <div className="space-y-6">
                {/* This would be filled with actual related courses data */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={`https://via.placeholder.com/300x180?text=Related+Course+${i}`}
                        alt={`Related Course ${i}`}
                        className="w-full h-auto transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
                      <div className="absolute bottom-2 left-2 flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 text-xs font-medium">4.{i}</span>
                      </div>
                    </div>
                    <h4 className="font-medium group-hover:text-teal-400 transition-colors">
                      Advanced Course Title {i}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">Instructor Name</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold">₹1,{i}99</span>
                      <span className="text-xs text-slate-400">{i}h 30m</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <h3 className="text-xl font-bold mb-6">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'JavaScript', 'Web Development', 'Frontend', 'UI/UX', 'Design'].map((tag) => (
                    <a
                      key={tag}
                      href={`/courses?tag=${tag}`}
                      className="bg-slate-700/50 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;