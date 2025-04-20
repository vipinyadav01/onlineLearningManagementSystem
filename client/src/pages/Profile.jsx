import { useState, useEffect, useCallback } from 'react';
import { 
  User, LogOut, ShoppingBag, Loader2, Mail, AlertCircle, 
  Calendar, CreditCard, ExternalLink, Package, CheckCircle, 
  XCircle, Clock, ArrowLeft, IndianRupee, Hash, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
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
      
      if (!userResponse.data?.success) {
        throw new Error('Invalid user data response');
      }
      if (!ordersResponse.data?.success) {
        throw new Error('Invalid orders data response');
      }
      
      setUser(userResponse.data.data || userResponse.data.user || {});
      const ordersData = ordersResponse.data.data || ordersResponse.data.orders || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setError(null);
    } catch (error) {
      console.error('Fetch Error:', error);
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleFetchError = (error) => {
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
  };

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

  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-green-500/20 text-green-400',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Completed'
        };
      case 'pending':
        return {
          color: 'bg-yellow-500/20 text-yellow-400',
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending'
        };
      case 'failed':
      case 'cancelled':
        return {
          color: 'bg-red-500/20 text-red-400',
          icon: <XCircle className="w-4 h-4" />,
          text: status.charAt(0).toUpperCase() + status.slice(1)
        };
      default:
        return {
          color: 'bg-teal-400/20 text-teal-400',
          icon: <Package className="w-4 h-4" />,
          text: status || 'Processing'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="flex items-center gap-4 bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 max-w-md w-full">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-white text-lg font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-red-500/40 p-10 rounded-2xl text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Authentication Issue</h2>
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg hover:shadow-teal-500/30 font-medium text-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Order Detail View
  if (selectedOrder) {
    const statusDetails = getStatusDetails(selectedOrder.status);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Orders</span>
          </button>
          
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden">
            <div className="p-8 border-b border-slate-700/80">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  Order #{selectedOrder.orderId || selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <span className={`text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 ${statusDetails.color} font-medium`}>
                  {statusDetails.icon}
                  {statusDetails.text}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <div>
                    <span className="text-slate-400 block">Order Date</span>
                    <span className="text-white font-medium">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>
                {selectedOrder.completedAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                    <div>
                      <span className="text-slate-400 block">Completed</span>
                      <span className="text-white font-medium">{formatDate(selectedOrder.completedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 border-b border-slate-700/80">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-400" />
                Course Details
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={selectedOrder.course?.thumbnail || 'https://via.placeholder.com/150'}
                    alt={selectedOrder.course?.title}
                    className="w-40 h-28 rounded-xl object-cover border border-slate-700/80 shadow-lg"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-xl text-white font-semibold mb-2">
                    {selectedOrder.course?.title || 'Course Title'}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4">
                    {selectedOrder.course?.instructor || 'Unknown Instructor'}
                  </p>
                  <button
                    onClick={() => navigate(`/course/${selectedOrder.course?._id}`)}
                    className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-2 transition-colors group"
                  >
                    View Course <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-b border-slate-700/80">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                Payment Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-300">Payment ID</span>
                  </div>
                  <p className="text-white font-mono text-sm pl-6">
                    {selectedOrder.paymentId || 'Not available'}
                  </p>
                </div>
                
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-300">Amount Paid</span>
                  </div>
                  <p className="text-white font-semibold text-lg pl-6">
                    ₹{selectedOrder.amount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-300">Payment Method</span>
                  </div>
                  <p className="text-white pl-6">
                    {selectedOrder.paymentMethod || 'Online Payment'}
                  </p>
                </div>
                
                {selectedOrder.error && (
                  <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-slate-300">Error Message</span>
                    </div>
                    <p className="text-red-400 text-sm pl-6">
                      {selectedOrder.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-700/60">
                  <p className="text-slate-300 mb-2">Name</p>
                  <p className="text-white font-medium">{user?.name || 'Not provided'}</p>
                </div>
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-700/60">
                  <p className="text-slate-300 mb-2">Email</p>
                  <p className="text-white font-medium">{user?.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Profile View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden mb-10">
          {/* Profile Header with Background */}
          <div className="h-40 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 relative">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-1.5 shadow-xl">
                <img
                  src={user?.profilePic || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* User Info Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white">{user?.name || 'User'}</h1>
                <p className="text-slate-300 flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  {user?.email || 'No email found'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-all group self-start"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                <span className="group-hover:text-red-400 transition-colors">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex mb-8 border-b border-slate-700/60 overflow-x-auto hide-scrollbar">
          <button
            className={`px-6 py-4 font-medium flex items-center gap-2 transition-all relative text-lg ${
              activeTab === 'orders'
                ? 'text-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="w-5 h-5" />
            My Orders
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400/30 via-teal-400 to-teal-400/30 rounded-full"></div>
            )}
          </button>
          <button
            className={`px-6 py-4 font-medium flex items-center gap-2 transition-all relative text-lg ${
              activeTab === 'profile'
                ? 'text-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5" />
            Profile Details
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400/30 via-teal-400 to-teal-400/30 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-teal-400" />
                My Orders
              </h2>
              <span className="text-sm bg-slate-700/60 text-teal-300 px-4 py-2 rounded-xl font-medium">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-700/60 shadow-xl">
                <div className="w-20 h-20 bg-slate-700/60 rounded-full mx-auto flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">No Orders Yet</h3>
                <p className="text-slate-300 mb-8 max-w-md mx-auto">You haven't purchased any courses yet. Browse our collection to start your learning journey.</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 font-medium"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => {
                  const statusDetails = getStatusDetails(order.status);
                  
                  return (
                    <div
                      key={order._id}
                      className="bg-slate-800/70 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/60 hover:border-teal-400/40 transition-all group shadow-lg hover:shadow-xl cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-teal-400 transition-colors flex items-center gap-2">
                              {order.course?.title || order.courseTitle || 'Course'}
                              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                            </h3>
                          </div>
                          <span className={`text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 ${statusDetails.color} font-medium flex-shrink-0`}>
                            {statusDetails.icon}
                            {statusDetails.text}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 flex items-center gap-2 mb-1">
                              <Hash className="w-4 h-4 text-teal-400" />
                              Order ID
                            </span>
                            <span className="text-white font-mono text-sm">
                              {order.orderId || order._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-teal-400" />
                              Date
                            </span>
                            <span className="text-white">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 flex items-center gap-2 mb-1">
                              <IndianRupee className="w-4 h-4 text-teal-400" />
                              Amount
                            </span>
                            <span className="text-white font-semibold">
                              ₹{order.amount?.toLocaleString('en-IN') || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-8 border border-slate-700/60 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-teal-400" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="bg-slate-700/40 border border-slate-600/60 rounded-xl px-5 py-4 text-white font-medium">
                    {user?.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="bg-slate-700/40 border border-slate-600/60 rounded-xl px-5 py-4 text-white font-medium">
                    {user?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <div className="bg-slate-700/40 border border-slate-600/60 rounded-xl px-5 py-4 text-white font-medium">
                    {user?.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Member Since</label>
                  <div className="bg-slate-700/40 border border-slate-600/60 rounded-xl px-5 py-4 text-white font-medium">
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