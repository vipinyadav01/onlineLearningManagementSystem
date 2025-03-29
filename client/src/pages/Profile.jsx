import { useState, useEffect, useCallback } from 'react';
import { User, LogOut, ShoppingBag, Loader2, Mail, AlertCircle, Calendar, CreditCard, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      // Fetch user and orders data
      const [userResponse, ordersResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })
      ]);
  
      // Debug API responses
      console.log('User Response:', userResponse.data);
      console.log('Orders Response:', ordersResponse.data);
  
      // Validate responses
      if (!userResponse.data?.success) {
        throw new Error('Invalid user data response');
      }
      if (!ordersResponse.data?.success) {
        throw new Error('Invalid orders data response');
      }
  
      // Extract and set user data
      setUser(userResponse.data.data || userResponse.data.user || {});
  
      // Extract and set orders data safely
      const ordersData = ordersResponse.data.data || ordersResponse.data.orders || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
  
      setError(null);
    } catch (error) {
      console.error('Fetch Error:', {
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
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-700/50 max-w-md w-full">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 border-t-2 border-b-2 border-teal-400 rounded-full animate-spin"></div>
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          </div>
          <span className="text-white text-lg">Loading your profile...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur-md border border-red-500/30 p-8 rounded-xl text-center max-w-md w-full shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Issue</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 rounded-lg hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md hover:shadow-teal-500/30 font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-teal-400/10 text-teal-400';
    }
  };

  // Main Profile View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 overflow-hidden mb-8">
          {/* Profile Header with Background */}
          <div className="h-32 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 relative">
            <div className="absolute -bottom-12 left-8 flex items-end">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 p-1 shadow-lg">
                <img
                  src={user?.profilePic || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover border-2 border-slate-800"
                />
              </div>
            </div>
          </div>
          
          {/* User Info Section */}
          <div className="pt-16 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-teal-400" />
                  {user?.email || 'No email found'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg font-medium transition-all group self-start"
              >
                <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                <span className="group-hover:text-red-400 transition-colors">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex mb-6 border-b border-slate-700/50 overflow-x-auto hide-scrollbar">
          <button
            className={`px-4 py-3 font-medium flex items-center gap-2 transition-all relative ${
              activeTab === 'orders'
                ? 'text-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0"></div>
            )}
          </button>
          <button
            className={`px-4 py-3 font-medium flex items-center gap-2 transition-all relative ${
              activeTab === 'profile'
                ? 'text-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-4 h-4" />
            Profile Details
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0"></div>
            )}
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-400" />
                My Orders
              </h2>
              <span className="text-sm bg-slate-700 text-slate-300 px-3 py-1 rounded-lg">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-700/50">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full mx-auto flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2">No Orders Yet</h3>
                <p className="text-slate-400 mb-6">You haven't purchased any courses yet.</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-teal-500/30 font-medium"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-teal-400/30 transition-all group shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-medium text-white group-hover:text-teal-400 transition-colors">
                          {order.course?.title || 'Course'}
                        </h3>
                        <span className={`text-sm px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.status || 'Completed'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-slate-400">Order ID</span>
                          <span className="text-white font-mono text-xs mt-1 truncate">{order._id}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400">Purchase Date</span>
                          <span className="text-white flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-400" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400">Amount</span>
                          <span className="text-white flex items-center gap-1.5 mt-1">
                            <CreditCard className="w-3.5 h-3.5 text-teal-400" />
                            ₹{(order.amount / 100)?.toLocaleString('en-IN') || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 px-6 py-3 flex justify-between items-center">
                      <span className="text-slate-400 text-sm">
                        {order.paymentMethod || 'Online Payment'}
                      </span>
                      <button 
                        onClick={() => navigate(`/course/${order.course?._id}`)}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        View Course <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-md">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white">
                    {user?.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white">
                    {user?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white">
                    {user?.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;