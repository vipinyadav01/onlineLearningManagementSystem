import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  ShieldCheck,
  CreditCard,
  MapPin,
  Mail,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Info,
  Lock
} from 'lucide-react';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course || null;

  // State management
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);

  // Token verification
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', {
        state: {
          message: 'Please log in to complete your purchase',
          redirectPath: course?._id ? `/checkout/${course._id}` : '/courses'
        }
      });
      return false;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.isValid;
    } catch (err) {
      localStorage.removeItem('token');
      setError('Session expired. Please log in again.');
      navigate('/login', {
        state: {
          message: 'Your session has expired. Please log in again.',
          redirectPath: course?._id ? `/checkout/${course._id}` : '/courses'
        }
      });
      return false;
    }
  }, [navigate, course]);

  // Fetch user location
  const fetchUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return 'Geolocation not supported';
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { timeout: 5000 }
      );
      return res.data?.display_name || 'Location not found';
    } catch (err) {
      console.error('Geolocation error:', err);
      return 'Location unavailable';
    }
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.data || !response.data.success) {
        throw new Error('Invalid user data response');
      }

      return response.data.data;
    } catch (error) {
      console.error('Detailed Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        switch (error.response.status) {
          case 404:
            setError('User profile not found. Please log in again.');
            break;
          case 401:
            setError('Authentication expired. Please log in again.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Check your network connection.');
      } else {
        setError('Error processing your request. Please try again.');
      }

      localStorage.removeItem('token');
      navigate('/login');
      return null;
    }
  };

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;

    const initializeCheckout = async () => {
      if (!course?._id) {
        navigate('/courses');
        return;
      }

      const tokenValid = await verifyToken();
      if (!tokenValid || !isMounted) return;

      try {
        const userData = await fetchUserData();
        const location = await fetchUserLocation();

        if (isMounted) {
          setUser(userData);
          setAddress(location);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load checkout data');
          setLoading(false);
        }
      }
    };

    initializeCheckout();
    return () => {
      isMounted = false;
    };
  }, [course, navigate, verifyToken, fetchUserLocation]);

  // Handle payment
  const handlePayment = async () => {
    if (!course?._id || !user) {
      setError('Missing required information');
      return;
    }

    setPaymentLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payments/create-order`,
        {
          courseId: course._id,
          amount: course.price * 100,
          currency: 'INR',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = orderResponse.data;
      const order_id = order.id;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: course.price * 100,
        currency: 'INR',
        name: 'Course Platform',
        description: `Payment for ${course.title}`,
        order_id,
        handler: async (response) => {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/payments/verify-payment`,
              { ...response, courseId: course._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Payment successful!');
            setTimeout(() => navigate('/my-orders', {
              state: { message: 'Payment successful!' }
            }), 1500);
          } catch (err) {
            setError('Payment verification failed');
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#14b8a6',
        },
        modal: {
          ondismiss: () => setPaymentLoading(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-4 bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/50">
          <Loader2 className="animate-spin text-teal-400" size={32} />
          <span className="text-white text-lg font-medium">Preparing checkout...</span>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={handleGoBack}
          className="mb-8 flex items-center text-teal-400 hover:text-teal-300 transition-all duration-300 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Courses</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-teal-400"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="bg-teal-400/10 p-3 rounded-xl">
                    <ShieldCheck className="text-teal-400" size={28} />
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Secure Checkout</h1>
                </div>

                {/* Messages */}
                {error && (
                  <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-300 mb-6 animate-fadeIn">
                    <XCircle size={24} />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center space-x-3 bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-300 mb-6 animate-fadeIn">
                    <CheckCircle size={24} />
                    <p>{success}</p>
                  </div>
                )}

                {/* User Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-400/10 p-2 rounded-lg">
                      <User className="text-teal-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Your Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="text-teal-400" size={16} />
                        <span className="text-gray-400 text-sm">Name</span>
                      </div>
                      <p className="text-white font-medium truncate">{user?.name || 'N/A'}</p>
                    </div>

                    <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="text-teal-400" size={16} />
                        <span className="text-gray-400 text-sm">Email</span>
                      </div>
                      <p className="text-white font-medium truncate">{user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-teal-400/30 transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="text-teal-400" size={16} />
                      <span className="text-gray-400 text-sm">Location</span>
                    </div>
                    <p className="text-white font-medium text-sm">{address || 'Location unavailable'}</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-teal-400/10 p-2 rounded-lg">
                      <CreditCard className="text-teal-400" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Payment</h2>
                  </div>

                  <div className="flex items-center space-x-2 mb-6 bg-teal-400/5 backdrop-blur-sm p-3 rounded-lg border border-teal-400/20">
                    <Lock className="text-teal-400" size={16} />
                    <p className="text-gray-300 text-sm">
                      Secure payment processed by Razorpay with 256-bit encryption
                    </p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="w-full flex items-center justify-center space-x-3 bg-teal-500 hover:bg-teal-600 text-white py-5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        <span>Pay ₹{course?.price?.toLocaleString('en-IN') || '0'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 sticky top-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="bg-teal-400/10 p-1.5 rounded-lg mr-3">
                  <AlertCircle className="text-teal-400" size={18} />
                </span>
                Order Summary
              </h2>
              
              <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 mb-6">
                <p className="text-gray-400 text-sm mb-2">Course</p>
                <p className="text-white font-medium">{course?.title}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{course?.price?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxes</span>
                  <span className="text-white">Included</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-xl font-bold text-teal-400">₹{course?.price?.toLocaleString('en-IN') || '0'}</span>
                </div>
              </div>

              {/* Additional info cards */}
              <div className="space-y-4">
                <div className="bg-gray-700/20 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-teal-400/20 transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-teal-400 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <h3 className="text-white font-medium text-sm">Instant Access</h3>
                      <p className="text-gray-400 text-xs">Get immediate access to course content after payment</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/20 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-teal-400/20 transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <Info className="text-teal-400 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <h3 className="text-white font-medium text-sm">Need Help?</h3>
                      <p className="text-gray-400 text-xs">Contact our support team for any questions about your purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;