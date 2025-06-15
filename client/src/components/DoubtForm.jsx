import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FileText } from 'lucide-react';

const DoubtForm = () => {
  const [authStatus, setAuthStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [doubt, setDoubt] = useState({
    title: '',
    description: '',
    orderId: '',
    attachments: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        setAuthStatus('unauthenticated');
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const userResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, { headers });
        if (userResponse.data?.success) {
          setUser(userResponse.data.data || userResponse.data.user || {});
          setAuthStatus('authenticated');

          try {
            const ordersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/my-orders`, { headers });
            if (ordersResponse.data.success) {
              const userOrders = ordersResponse.data.orders || [];
              const successOrders = userOrders.filter(order => order.status === 'Success');
              setOrders(successOrders);

              const params = new URLSearchParams(location.search);
              const orderId = params.get('orderId');
              if (orderId && successOrders.some(order => order._id === orderId)) {
                setDoubt(prev => ({ ...prev, orderId }));
              } else if (orderId) {
                setError('Invalid or unauthorized order selected. Please choose a valid order from your account.');
              }
            } else {
              console.error('Failed to get orders:', ordersResponse.data.message);
              setError('Failed to load orders. Please try again or contact support.');
            }
          } catch (orderError) {
            console.error('Failed to fetch orders:', orderError);
            setError('Failed to load orders. Please try again or contact support.');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem('token');
          setAuthStatus('unauthenticated');
          setError('Session expired. Please log in again.');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Failed to authenticate. Please try logging in again.');
          setAuthStatus('unauthenticated');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, location.search]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoubt((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      setError('You can upload a maximum of 5 files');
      e.target.value = '';
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        setError(`File ${file.name} has an invalid type. Only JPG, PNG, PDF, and Word docs are allowed.`);
        return false;
      }
      if (!isValidSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      e.target.value = '';
      return;
    }

    setDoubt((prev) => ({
      ...prev,
      attachments: validFiles,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!doubt.title.trim() || !doubt.description.trim() || !doubt.orderId) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('token');
      setError('No authentication token found. Please log in.');
      setAuthStatus('unauthenticated');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', doubt.title.trim());
      formData.append('description', doubt.description.trim());
      formData.append('orderId', doubt.orderId);

      if (doubt.attachments && doubt.attachments.length > 0) {
        Array.from(doubt.attachments).forEach((file) => {
          formData.append('attachments', file);
        });
      }

      console.log('Submitting doubt:', { title: doubt.title, orderId: doubt.orderId });
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/doubts/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          `Your doubt has been submitted successfully! ` +
          `Doubt ID: ${response.data.doubt._id}, ` +
          `User ID: ${response.data.doubt.user}, ` +
          `Status: ${response.data.doubt.status}, ` +
          `Created: ${new Date(response.data.doubt.createdAt).toLocaleString()}`
        );
        setDoubt({
          title: '',
          description: '',
          orderId: '',
          attachments: [],
        });
        const fileInput = document.getElementById('attachments');
        if (fileInput) fileInput.value = '';
      } else {
        if (response.data.code === 'ORDER_NOT_COMPLETED') {
          setError(`This order is not completed yet (Status: ${response.data.orderStatus}). Please wait until the order is marked as "Success".`);
        } else if (response.data.code === 'ORDER_NOT_FOUND') {
          setError('The selected order was not found. Please choose a valid order from your account.');
        } else if (response.data.code === 'ORDER_OWNERSHIP_ERROR') {
          setError('The selected order does not belong to you. Please choose an order from your account.');
        } else if (response.data.code === 'INVALID_ORDER_ID') {
          setError('The provided order ID is invalid. Please select a valid order.');
        } else if (response.data.code === 'MISSING_FIELDS') {
          setError('Please provide all required fields: title, description, and order.');
        } else {
          setError(response.data.message || 'Failed to submit doubt. Please try again.');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.status === 400) {
        if (error.response.data?.code === 'ORDER_NOT_COMPLETED') {
          setError(`This order is not completed yet (Status: ${error.response.data.orderStatus}). Please wait until the order is marked as "Success".`);
        } else if (error.response.data?.code === 'ORDER_NOT_FOUND') {
          setError('The selected order was not found. Please choose a valid order from your account.');
        } else if (error.response.data?.code === 'ORDER_OWNERSHIP_ERROR') {
          setError('The selected order does not belong to you. Please choose an order from your account.');
        } else if (error.response.data?.code === 'INVALID_ORDER_ID') {
          setError('The provided order ID is invalid. Please select a valid order.');
        } else if (error.response.data?.code === 'MISSING_FIELDS') {
          setError('Please provide all required fields: title, description, and order.');
        } else {
          setError(error.response.data?.message || 'Validation error. Please check your inputs.');
        }
      } else if (error.response?.status === 401) {
        setError(error.response.data?.code === 'UNAUTHENTICATED' ? 'User not authenticated. Please log in.' : 'Session expired. Please log in again.');
        localStorage.removeItem('token');
        setAuthStatus('unauthenticated');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(
          error.response?.data?.message ||
          (error.message.includes('Network Error')
            ? 'Network error. Please check your connection.'
            : 'An error occurred while submitting your doubt. Please try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || authStatus === 'checking') {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-pulse space-y-4 max-w-3xl w-full px-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-12 bg-slate-800 rounded"></div>
          <div className="h-12 bg-slate-800 rounded"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
          <div className="h-16 bg-slate-800 rounded"></div>
          <div className="h-12 bg-slate-800 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-xl max-w-md w-full border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Login Required</h2>
            <p className="text-slate-400">Please sign in to access this feature</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-medium rounded-lg shadow-lg transition duration-200 transform hover:translate-y-[-2px] focus:ring-4 focus:ring-teal-500/30 focus:outline-none"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submit Your Doubt
          </h2>
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="bg-slate-900/80 text-teal-300 px-6 py-4 rounded-lg mb-6 border border-slate-700/70 flex items-start gap-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-teal-500/10 text-teal-400 px-6 py-4 rounded-lg mb-6 border border-teal-500/30 flex items-start gap-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Title <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={doubt.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-200 placeholder-slate-500 transition-all"
                placeholder="Brief title of your doubt"
              />
            </div>

            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-slate-300 mb-2">
                Related Order <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="orderId"
                  name="orderId"
                  value={doubt.orderId}
                  onChange={handleInputChange}
                  required
                  disabled={orders.length === 0}
                  className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-200 appearance-none transition-all ${
                    orders.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">{orders.length > 0 ? 'Select an order' : 'No orders available'}</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.orderId || order._id} - {order.courseTitle || 'Unnamed Course'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {orders.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  You don't have any completed orders yet. Please make a purchase first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description <span className="text-teal-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={doubt.description}
                onChange={handleInputChange}
                required
                rows="6"
                maxLength={1000}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-200 placeholder-slate-500 transition-all"
                placeholder="Describe your doubt in detail"
              ></textarea>
            </div>

            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments (Max 5 files)
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 bg-slate-900/30 transition-all hover:border-teal-500/30 focus-within:border-teal-500/50">
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  onChange={handleFileChange}
                  multiple
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 cursor-pointer text-slate-400"
                />
                {doubt.attachments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">Selected files:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {Array.from(doubt.attachments).map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Supported files: JPG, PNG, PDF, DOC (max 5MB each)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || orders.length === 0}
              className={`w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-medium py-3 px-4 rounded-lg shadow-lg transition duration-200 flex justify-center items-center transform hover:translate-y-[-2px] focus:ring-4 focus:ring-teal-500/30 focus:outline-none ${
                loading || orders.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {orders.length === 0 ? 'No Orders Available' : 'Submit Doubt'}
                </>
              )}
            </button>
          </form>

          {user && (
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-500/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-200">Your Information</h3>
              </div>

              <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Name</p>
                    <p className="text-slate-300">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Email</p>
                    <p className="text-slate-300">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">User ID</p>
                    <p className="text-slate-300 font-mono text-sm">{user._id}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
      <button
        onClick={() => navigate('/user-doubts')}
        className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
      >
        <FileText className="h-5 w-5 mr-2" />
        View Your Doubts
      </button>
    </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoubtForm;