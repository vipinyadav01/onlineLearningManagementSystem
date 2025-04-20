import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [authStatus, setAuthStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoubts = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        localStorage.removeItem('token');
        setAuthStatus('unauthenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/doubts/my-doubts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setDoubts(response.data.data || []);
          setAuthStatus('authenticated');
        } else {
          throw new Error(response.data.message || 'Failed to fetch doubts');
        }
      } catch (error) {
        console.error('Fetch Doubts Error:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem('token');
          setAuthStatus('unauthenticated');
          setError('Session expired. Please log in again.');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError('Failed to load your doubts. Please try again.');
          setAuthStatus('authenticated'); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [navigate]);

  if (loading || authStatus === 'checking') {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-700 border-t-teal-400"></div>
      </div>
    );
  }
  if (authStatus === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-slate-800/90 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
        <p className="text-slate-300 mb-8">Please log in to view your submitted doubts.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-md transition-all duration-200 transform hover:translate-y-[-1px]"
        >
          Go to Login
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto my-12 px-4 sm:px-6">
      <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">Your Submitted Doubts</h2>

        {error && (
          <div className="bg-slate-900/80 text-teal-300 p-5 rounded-lg mb-8 border-l-4 border-teal-400 shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {doubts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-slate-300 text-lg mb-6">You haven&apos submitted any doubts yet.</p>
            <button
              onClick={() => navigate('/submit-doubt')}
              className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-md transition-all duration-200 transform hover:translate-y-[-1px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Submit a Doubt
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {doubts.map((doubt) => (
              <div
                key={doubt._id}
                className="border border-slate-700/60 bg-slate-800/90 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">{doubt.title}</h3>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center
                    ${doubt.status === 'resolved' ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30' : 
                      doubt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30' : 
                      'bg-slate-600/40 text-slate-300 ring-1 ring-slate-500/30'}`}
                  >
                    {doubt.status === 'resolved' && (
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    )}
                    {doubt.status === 'pending' && (
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                    )}
                    {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                  </span>
                </div>

                <p className="mt-4 text-slate-300 leading-relaxed">{doubt.description}</p>

                {doubt.attachments && doubt.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 font-medium mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {doubt.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/20 transition-all duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                          </svg>
                          {attachment.filename || `Attachment ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {doubt.response && (
                  <div className="mt-6 p-4 bg-slate-900/80 rounded-lg border-l-4 border-teal-500">
                    <p className="text-sm font-medium text-teal-300 mb-2">Admin Response:</p>
                    <p className="text-slate-300 leading-relaxed">{doubt.response}</p>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                    Order ID: {doubt.order?._id?.substring(0, 6) || 'N/A'}
                  </span>
                  <span className="inline-flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Submitted: {new Date(doubt.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDoubts;