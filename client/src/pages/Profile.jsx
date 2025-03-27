import { useState, useEffect } from 'react';
import { User, LogOut, ShoppingBag, Loader2, Mail, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Detailed logging for debugging
        console.log('Authentication Token:', token);
        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

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

        // Validate user response
        if (!userResponse.data || !userResponse.data.success) {
          throw new Error('Invalid user data response');
        }

        // Extract and set user and orders data
        const userData = userResponse.data.data;
        const ordersData = ordersResponse.data.data || [];

        setUser(userData);
        setOrders(ordersData);
        setError(null);
      } catch (error) {
        console.error('Detailed Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        // Comprehensive error handling
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

        // Clear token and redirect
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-xl shadow-lg">
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          <span className="text-white text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Authentication Issue</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Main Profile View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 p-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-1 shadow-lg">
              <img
                src={user?.profilePic || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-slate-800"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                {user?.email || 'No email found'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">My Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-slate-700/50 rounded-lg p-6 text-center border border-slate-600">
              <p className="text-slate-400 mb-4">No orders found</p>
              <button
                onClick={() => navigate('/courses')}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 hover:border-teal-400/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white group-hover:text-teal-400 transition-colors">
                      {order.course?.title || 'Course'}
                    </h3>
                    <span className="text-sm px-2 py-1 bg-teal-400/10 text-teal-400 rounded-full">
                      {order.status || 'Completed'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    Order ID: {order._id}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-teal-400 font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ₹{(order.amount / 100)?.toLocaleString('en-IN') || '0'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
