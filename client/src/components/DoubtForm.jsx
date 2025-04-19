import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoubtForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [doubt, setDoubt] = useState({
    title: '',
    description: '',
    orderId: '',
    attachments: []
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
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
      setIsLoggedIn(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoubt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setDoubt(prev => ({
      ...prev,
      attachments: e.target.files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create form data to handle files
      const formData = new FormData();
      formData.append('title', doubt.title);
      formData.append('description', doubt.description);
      formData.append('orderId', doubt.orderId);
      
      // Append each file to the form data
      if (doubt.attachments && doubt.attachments.length > 0) {
        for (let i = 0; i < doubt.attachments.length; i++) {
          formData.append('attachments', doubt.attachments[i]);
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/doubts/create`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Your doubt has been submitted successfully!');
        // Reset form
        setDoubt({
          title: '',
          description: '',
          orderId: '',
          attachments: []
        });
      } else {
        throw new Error(response.data.message || 'Failed to submit doubt');
      }
    } catch (error) {
      console.error('Submit Doubt Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Authentication expired. Please log in again.');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            navigate('/login');
            break;
          case 400:
            setError(error.response.data.message || 'Invalid input. Please check your data.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Check your network connection.');
      } else {
        setError(error.message || 'Error processing your request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">Please log in to submit your doubt.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Submit Your Doubt</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={doubt.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title of your doubt"
          />
        </div>

        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Related Order</label>
          <select
            id="orderId"
            name="orderId"
            value={doubt.orderId}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an order</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                {order.orderNumber || order._id} - {order.productName || 'Unknown Product'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={doubt.description}
            onChange={handleInputChange}
            required
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your doubt in detail"
          ></textarea>
        </div>

        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            onChange={handleFileChange}
            multiple
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">You can upload screenshots or relevant documents (max 5MB each)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting...' : 'Submit Doubt'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Your Information</h3>
        {user && (
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User ID:</span> {user._id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtForm;