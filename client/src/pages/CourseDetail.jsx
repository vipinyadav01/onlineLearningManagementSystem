import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Calendar, BarChart, Award, CheckCircle, Play,
  Download, Share2, BookOpen, Users, ChevronDown, ChevronUp,
  Heart, Bookmark, MessageSquare, ThumbsUp, Edit2, Trash2
} from 'lucide-react';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [videoHover, setVideoHover] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [user, setUser] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${baseUrl}/auth/refresh`, {
        refreshToken,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return null;
    }
  };

  // Function to fetch user details
  const fetchUser = async (token) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const userResponse = await axios.get(`${baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.data.success && userResponse.data.user) {
        return userResponse.data.user;
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      throw error;
    }
  };

  // Fetch course, user, and reviews
  useEffect(() => {
    const fetchCourseAndUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        let token = localStorage.getItem('token');

        // Check if token exists
        if (!token) {
          console.warn('No access token found');
          setUser(null);
        } else {
          try {
            // Try fetching user with current token
            const userData = await fetchUser(token);
            setUser(userData);
          } catch (userError) {
            console.warn('Failed to fetch user with access token:', userError);
            if (userError.response?.status === 401) {
              // Access token expired, try refreshing
              token = await refreshAccessToken();
              if (token) {
                // Retry fetching user with new token
                const userData = await fetchUser(token);
                setUser(userData);
              } else {
                setUser(null);
              }
            } else {
              console.error('User fetch error:', userError);
              setUser(null);
            }
          }
        }

        // Fetch course details
        const courseResponse = await axios.get(`${baseUrl}/admin/courses/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000,
        });

        if (courseResponse.data.success && courseResponse.data.course) {
          setCourse(courseResponse.data.course);
          setError(null);
        } else {
          setError(courseResponse.data.message || 'No course data received');
          setCourse(null);
        }

        // Fetch reviews
        const reviewsResponse = await axios.get(`${baseUrl}/reviews/${id}`);
        setReviews(reviewsResponse.data.reviews || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage =
          error.response?.status === 404
            ? 'Course or resource not found'
            : error.response?.data?.message || 'Failed to fetch data';
        setError(errorMessage);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseAndUser();
    }
  }, [id]);

  // Rest of the component remains unchanged unless specified
  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const handleEnrollNow = () => {
    if (course) {
      navigate('/checkout', { state: { course } });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Add API call to update like status
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Add API call to update bookmark status
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }
    if (newReview.rating === 0) {
      setReviewError('Please select a rating.');
      return;
    }
    if (!newReview.comment.trim()) {
      setReviewError('Please enter a comment.');
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError(null);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem('token');

      // Check if token is valid, refresh if needed
      try {
        await axios.get(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          token = await refreshAccessToken();
          if (!token) {
            setReviewError('Session expired. Please log in again.');
            return;
          }
        } else {
          throw error;
        }
      }

      if (editingReview) {
        const response = await axios.put(
          `${baseUrl}/reviews/${editingReview._id}`,
          {
            rating: newReview.rating,
            comment: newReview.comment,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setReviews(
          reviews.map((r) =>
            r._id === editingReview._id ? response.data.review : r
          )
        );
        setEditingReview(null);
      } else {
        const response = await axios.post(
          `${baseUrl}/reviews`,
          {
            courseId: id,
            userId: user.id,
            userName: user.name || 'Anonymous',
            rating: newReview.rating,
            comment: newReview.comment,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setReviews([...reviews, response.data.review]);
      }

      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.response?.data?.message || 'Failed to submit review.');
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
      setReviewError(null);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem('token');

      try {
        await axios.get(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          token = await refreshAccessToken();
          if (!token) {
            setReviewError('Session expired. Please log in again.');
            return;
          }
        } else {
          throw error;
        }
      }

      await axios.delete(`${baseUrl}/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      setReviewError(error.response?.data?.message || 'Failed to delete review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem('token');

      try {
        await axios.get(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          token = await refreshAccessToken();
          if (!token) {
            setReviewError('Session expired. Please log in again.');
            return;
          }
        } else {
          throw error;
        }
      }

      const response = await axios.post(
        `${baseUrl}/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setReviews(
        reviews.map((r) =>
          r._id === reviewId ? response.data.review : r
        )
      );
    } catch (error) {
      console.error('Error voting helpful:', error);
      setReviewError(error.response?.data?.message || 'Failed to vote helpful.');
    }
  };

  // Rest of the component (render, JSX, etc.) remains unchanged
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
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
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {course.isBestseller && (
                  <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    BESTSELLER
                  </span>
                )}
                {course.isNew && !course.isBestseller && (
                  <span className="inline-block bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </span>
                )}
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1 text-sm ${
                    isLiked ? 'text-pink-500' : 'text-slate-400'
                  } hover:text-pink-500 transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={toggleBookmark}
                  className={`flex items-center gap-1 text-sm ${
                    isBookmarked ? 'text-teal-400' : 'text-slate-400'
                  } hover:text-teal-400 transition-colors`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-400' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{averageRating}</span>
                  <span className="text-slate-400 ml-1">({reviews.length} reviews)</span>
                </div>
                <div className="text-slate-300">
                  <Users className="w-4 h-4 inline mr-1" />
                  {course.students?.toLocaleString() || 0} students
                </div>
              </div>

              <div className="mb-6">
                <span className="text-slate-300">Created by </span>
                <a href="#instructor" className="text-teal-400 hover:underline">
                  {course.instructor}
                </a>
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

            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700 transform hover:scale-[1.01] transition-transform duration-300">
              <div
                className="aspect-video relative"
                onMouseEnter={() => setVideoHover(true)}
                onMouseLeave={() => setVideoHover(false)}
              >
                <img
                  src={course.image || `/api/placeholder/800/450?text=${course.title}`}
                  alt={`${course.title} preview`}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                    videoHover ? 'opacity-100' : 'opacity-90'
                  }`}
                >
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-all duration-300 transform hover:scale-110">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </button>
                  {videoHover && (
                    <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                      Preview this course
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-3xl font-bold">₹{course.price}</span>
                  {course.originalPrice > course.price && (
                    <>
                      <span className="text-lg text-slate-400 line-through">₹{course.originalPrice}</span>
                      <span className="text-lg text-teal-400">{course.discount || 0}% off</span>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEnrollNow}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
                  >
                    Enroll Now
                  </button>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Add to Wishlist
                  </button>
                </div>

                <div className="mt-6 border-t border-slate-700 pt-6">
                  <h3 className="font-medium mb-4">This course includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start group">
                      <Clock className="w-5 h-5 text-slate-400 mr-3 mt-0.5 group-hover:text-teal-400 transition-colors" />
                      <span className="group-hover:text-white transition-colors">{course.duration || 'N/A'} on-demand video</span>
                    </li>
                    <li className="flex items-start group">
                      <BookOpen className="w-5 h-5 text-slate-400 mr-3 mt-0.5 group-hover:text-teal-400 transition-colors" />
                      <span className="group-hover:text-white transition-colors">Resources available</span>
                    </li>
                    <li className="flex items-start group">
                      <Download className="w-5 h-5 text-slate-400 mr-3 mt-0.5 group-hover:text-teal-400 transition-colors" />
                      <span className="group-hover:text-white transition-colors">Downloadable content</span>
                    </li>
                    <li className="flex items-start group">
                      <Award className="w-5 h-5 text-slate-400 mr-3 mt-0.5 group-hover:text-teal-400 transition-colors" />
                      <span className="group-hover:text-white transition-colors">Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Share this course"
                  >
                    <Share2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Share</span>
                  </button>
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Download resources"
                  >
                    <Download className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Resources</span>
                  </button>
                  <button
                    className="text-slate-300 hover:text-teal-400 transition-colors flex flex-col items-center group"
                    title="Gift this course"
                  >
                    <Award className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Gift</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex border-b border-slate-700 mb-8">
              <button
                className={`px-4 py-2 font-medium relative ${activeTab === 'curriculum' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('curriculum')}
              >
                Curriculum
                {activeTab === 'curriculum' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"></span>
                )}
              </button>
              <button
                className={`px-4 py-2 font-medium relative ${activeTab === 'overview' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
                {activeTab === 'overview' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"></span>
                )}
              </button>
              <button
                className={`px-4 py-2 font-medium relative ${activeTab === 'reviews' ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"></span>
                )}
              </button>
            </div>

            <section className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                  course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex group">
                      <CheckCircle className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-teal-300 transition-colors">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No learning objectives specified.</p>
                )}
              </div>
            </section>

            <section className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-6">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <CheckCircle className="w-5 h-5 text-teal-400 mr-3 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-teal-300 transition-colors">{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400">No prerequisites specified.</p>
                )}
              </ul>
            </section>

            {activeTab === 'curriculum' && (
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
                      <div key={sectionIndex} className="bg-slate-800 hover:bg-slate-750 transition-colors">
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
                                <div key={lectureIndex} className="flex justify-between items-center p-4 hover:bg-slate-800 transition-colors group">
                                  <div className="flex items-center">
                                    <Play className="w-4 h-4 text-slate-400 mr-3 group-hover:text-teal-400 transition-colors" />
                                    <span className="group-hover:text-teal-300 transition-colors">
                                      {lecture.title}
                                      {lecture.isFree && (
                                        <span className="ml-2 text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Preview</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{lecture.duration || 'N/A'}</span>
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
            )}

            {activeTab === 'overview' && (
              <section className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
                <div className="prose prose-invert max-w-none">
                  {course.overview ? (
                    <div dangerouslySetInnerHTML={{ __html: course.overview }} />
                  ) : (
                    <p className="text-slate-400">No overview available for this course.</p>
                  )}
                </div>
              </section>
            )}

            <section id="instructor" className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-16 h-16 rounded-full bg-slate-600 overflow-hidden border-2 border-teal-400/50 hover:border-teal-400 transition-colors">
                      <img
                        src={course.image || `/api/placeholder/200/200?text=${course.instructor?.charAt(0) || 'I'}`}
                        alt={course.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold hover:text-teal-400 transition-colors">
                      <a href="#instructor">{course.instructor}</a>
                    </h3>
                    <p className="text-teal-400">{course.instructorTitle || 'Instructor'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm group">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 group-hover:scale-110 transition-transform" />
                    <span>{averageRating} Instructor Rating</span>
                  </div>
                  <div className="flex items-center text-sm group">
                    <Award className="w-4 h-4 text-slate-400 mr-1 group-hover:text-teal-400 transition-colors" />
                    <span>Courses Taught</span>
                  </div>
                  <div className="flex items-center text-sm group">
                    <Users className="w-4 h-4 text-slate-400 mr-1 group-hover:text-teal-400 transition-colors" />
                    <span>{course.students?.toLocaleString() || 0} Students</span>
                  </div>
                  <div className="flex items-center text-sm group">
                    <Play className="w-4 h-4 text-slate-400 mr-1 group-hover:text-teal-400 transition-colors" />
                    <span>{reviews.length} Reviews</span>
                  </div>
                </div>

                <p className="text-slate-300">{course.instructorBio || 'No bio available.'}</p>

                <button className="mt-4 text-teal-400 hover:text-teal-300 font-medium flex items-center transition-colors">
                  View all courses by this instructor
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </div>
            </section>

            {activeTab === 'reviews' && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">{averageRating}</div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.floor(averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-slate-400">Course Rating</div>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const totalReviews = reviews.length;
                        const ratingCount = reviews.filter((r) => r.rating === rating).length;
                        const percentage = totalReviews > 0 ? (ratingCount / totalReviews) * 100 : 0;

                        return (
                          <div key={rating} className="flex items-center gap-2 mb-1 group">
                            <div className="flex items-center w-24">
                              <span className="mr-1 group-hover:text-yellow-400 transition-colors">{rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-right text-sm text-slate-400 group-hover:text-white transition-colors">{Math.round(percentage)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review._id} className="border-t border-slate-700 pt-6">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden mr-3 border border-slate-500 hover:border-teal-400 transition-colors">
                                <img
                                  src={`/api/placeholder/100/100?text=${review.userName.charAt(0)}`}
                                  alt={review.userName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium hover:text-teal-400 transition-colors">{review.userName}</h4>
                                <div className="flex text-yellow-400">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400' : ''}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                              {user && review.userId === user.id && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="text-slate-400 hover:text-teal-400 transition-colors"
                                    title="Edit review"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="text-slate-400 hover:text-red-400 transition-colors"
                                    title="Delete review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-300">{review.comment}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => handleHelpfulVote(review._id)}
                              className="flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm"
                              disabled={!user}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Helpful ({review.helpfulCount || 0})
                            </button>
                            <button className="flex items-center text-slate-400 hover:text-teal-400 transition-colors text-sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Reply
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No reviews yet. Be the first to leave a review!</p>
                    )}

                    <div className="text-center pt-4">
                      <button className="text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center justify-center mx-auto">
                        Show all reviews
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
                  <h3 className="text-xl font-bold mb-4">
                    {editingReview ? 'Edit Your Review' : 'Leave a Review'}
                  </h3>
                  {!user ? (
                    <p className="text-slate-400">
                      Please <Link to="/login" className="text-teal-400 hover:underline">log in</Link> to leave a review.
                    </p>
                  ) : (
                    <form onSubmit={handleReviewSubmit}>
                      {reviewError && (
                        <p className="text-red-400 mb-4">{reviewError}</p>
                      )}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 cursor-pointer ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`}
                              onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Comment</label>
                        <textarea
                          className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 text-white focus:outline-none focus:border-teal-400"
                          rows="4"
                          value={newReview.comment}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                          placeholder="Write your review here..."
                        ></textarea>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={reviewLoading}
                          className={`flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 ${reviewLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {reviewLoading ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                        {editingReview && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(null);
                              setNewReview({ rating: 0, comment: '' });
                              setReviewError(null);
                            }}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
                <h3 className="text-xl font-bold mb-4">Related Courses</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-lg bg-slate-600 overflow-hidden flex-shrink-0">
                      <img
                        src="/api/placeholder/200/200?text=Course"
                        alt="Related course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium hover:text-teal-400 transition-colors">Advanced React Patterns</h4>
                      <div className="flex items-center text-sm text-slate-400">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        4.8 (124)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-lg bg-slate-600 overflow-hidden flex-shrink-0">
                      <img
                        src="/api/placeholder/200/200?text=Course"
                        alt="Related course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium hover:text-teal-400 transition-colors">State Management Mastery</h4>
                      <div className="flex items-center text-sm text-slate-400">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        4.9 (87)
                      </div>
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <button className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                      View all related courses
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-teal-400/30 transition-colors duration-300">
                <h3 className="text-xl font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags && course.tags.length > 0 ? (
                    course.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/courses?tag=${tag}`}
                        className="bg-slate-700 hover:bg-slate-600 hover:text-teal-300 text-slate-300 px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-400">No tags available.</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-teal-400/20">
                <h3 className="text-xl font-bold mb-4 text-teal-400">Limited Time Offer</h3>
                <p className="text-slate-300 mb-4">
                  Enroll now and get access to exclusive resources and a private community!
                </p>
                <button
                  onClick={handleEnrollNow}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
                >
                  Enroll Now - ₹{course.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your learning journey?</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of students already mastering skills with our comprehensive courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleEnrollNow}
              className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
            >
              Enroll Now
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-8 rounded-lg font-medium transition-colors">
              Try Free Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;