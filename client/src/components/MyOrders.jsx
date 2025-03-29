import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setOrders(response.data.orders || []);
        } else {
          setError(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
              <p className="text-slate-400 mb-4">You haven’t placed any orders yet.</p>
              <Link to="/courses" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{order.courseId?.title || 'Unknown Course'}</h2>
                      <p className="text-slate-400 text-sm">Order ID: {order.orderId}</p>
                      {order.paymentId && <p className="text-slate-400 text-sm">Payment ID: {order.paymentId}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Success'
                      ? 'bg-green-500/20 text-green-400'
                      : order.status === 'Failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p><strong>Amount:</strong> ₹{order.amount}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4">
                    <Link to={`/courses/${order.courseId?._id}`} className="text-teal-400 hover:underline text-sm">
                      View Course Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link to="/courses" className="text-teal-400 hover:underline font-medium">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
