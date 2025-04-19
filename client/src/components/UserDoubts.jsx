import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoubts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/doubts/my-doubts`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setDoubts(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch doubts');
        }
      } catch (error) {
        console.error('Fetch Doubts Error:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError('Failed to load your doubts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
      <p>{error}</p>
    </div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Submitted Doubts</h2>
      
      {doubts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">You haven't submitted any doubts yet.</p>
          <button 
            onClick={() => navigate('/submit-doubt')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
          >
            Submit a Doubt
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {doubts.map(doubt => (
            <div key={doubt._id} className="border rounded-lg p-5 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-800">{doubt.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${doubt.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                    doubt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                </span>
              </div>
              
              <p className="mt-2 text-gray-600">{doubt.description}</p>
              
              {doubt.attachments && doubt.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 font-medium">Attachments:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doubt.attachments.map((attachment, index) => (
                      <a 
                        key={index}
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                      >
                        {attachment.filename || `Attachment ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {doubt.response && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">Admin Response:</p>
                  <p className="mt-1 text-gray-600">{doubt.response}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>Order ID: {doubt.orderId}</span>
                <span>Submitted: {new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDoubts;