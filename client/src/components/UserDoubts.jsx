import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Loader, 
  LogIn, 
  Plus, 
  Check, 
  Clock, 
  AtSign, 
  Calendar,
  FileText,
  Film,
  Image as ImageIcon,
  File
} from 'lucide-react';

// Constants for API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const UserDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [authStatus, setAuthStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDoubts = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('token');
      setAuthStatus('unauthenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/doubts/my-doubts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // Add timeout to prevent hanging
      });

      if (response.data.success) {
        setDoubts(Array.isArray(response.data.data) ? response.data.data : []);
        setAuthStatus('authenticated');
      } else {
        throw new Error(response.data.message || 'Failed to fetch doubts');
      }
    } catch (error) {
      console.error('Fetch Doubts Error:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setAuthStatus('unauthenticated');
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(
          error.response?.data?.message || 
          'Failed to load your doubts. Please check your connection and try again.'
        );
        setAuthStatus('authenticated');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  if (loading || authStatus === 'checking') {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader className="h-12 w-12 text-teal-400 animate-spin" aria-label="Loading" />
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
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-md transition-all duration-200 transform hover:translate-y-[-1px]"
          aria-label="Go to Login"
        >
          <LogIn size={18} />
          Go to Login
        </button>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <Check size={14} className="mr-1.5" />;
      case 'in_progress':
      case 'pending':
      default:
        return <Clock size={14} className="mr-1.5" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30';
      case 'in_progress':
        return 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30';
      case 'pending':
      default:
        return 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30';
    }
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filename) => {
    if (!filename) return <File size={14} />;
    
    const ext = getFileExtension(filename);
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon size={14} />;
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      return <Film size={14} />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return <FileText size={14} />;
    }
    
    return <File size={14} />;
  };

  const getAttachmentURL = (attachment) => {
    if (!attachment) return '#';
    
    if (typeof attachment === 'string') {
      return isValidUrl(attachment) ? attachment : '#';
    }
    
    if (typeof attachment === 'object' && attachment !== null) {
      const url = attachment.secure_url || attachment.url;
      return isValidUrl(url) ? url : '#';
    }
    
    return '#';
  };

  const getAttachmentFilename = (attachment, index) => {
    let filename = `Attachment ${index + 1}`;
    
    if (typeof attachment === 'object' && attachment !== null) {
      filename = attachment.original_filename || attachment.filename || filename;
    } else if (typeof attachment === 'string' && isValidUrl(attachment)) {
      try {
        const url = new URL(attachment);
        const pathParts = url.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        const cleanedName = lastPart.replace(/^v\d+\//, '');
        if (cleanedName) {
          filename = decodeURIComponent(cleanedName);
        }
      } catch {
        if (attachment.includes('/')) {
          const urlParts = attachment.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          filename = lastPart.split('?')[0] || filename;
        }
      }
    }
    
    return filename;
  };

  const handleAttachmentClick = (event, attachment) => {
    const url = getAttachmentURL(attachment);
    const filename = getAttachmentFilename(attachment, 0);
    
    if (url === '#') {
      event.preventDefault();
      return;
    }

    if (getFileExtension(filename) === 'pdf' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
            <p className="text-slate-300 text-lg mb-6">You haven't submitted any doubts yet.</p>
            <button
              onClick={() => navigate('/doubt')}
              className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-md transition-all duration-200 transform hover:translate-y-[-1px]"
              aria-label="Submit a Doubt"
            >
              <Plus size={18} className="mr-2" />
              Submit a Doubt
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {doubts.map((doubt) => (
              <div
                key={doubt._id || `doubt-${Math.random()}`} // Fallback key for edge cases
                className="border border-slate-700/60 bg-slate-800/90 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">
                    {doubt.title || 'Untitled Doubt'}
                  </h3>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center ${getStatusClass(doubt.status)}`}
                  >
                    {getStatusIcon(doubt.status)}
                    {(doubt.status || 'pending')
                      .charAt(0)
                      .toUpperCase() + (doubt.status || 'pending').slice(1).replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-4 text-slate-300 leading-relaxed">
                  {doubt.description || 'No description provided.'}
                </p>

                {doubt.attachments && Array.isArray(doubt.attachments) && doubt.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 font-medium mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {doubt.attachments.map((attachment, index) => {
                        const url = getAttachmentURL(attachment);
                        const filename = getAttachmentFilename(attachment, index);
                        const fileIcon = getFileIcon(filename);
                        
                        return (
                          <a
                            key={`${doubt._id}-attachment-${index}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleAttachmentClick(e, attachment)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                              url === '#'
                                ? 'bg-gray-500/10 text-gray-400 cursor-not-allowed'
                                : 'bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/20'
                            }`}
                            aria-label={`Download ${filename}`}
                          >
                            <span className="mr-1.5">{fileIcon}</span>
                            {filename}
                          </a>
                        );
                      })}
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
                    <AtSign size={14} className="mr-1.5" />
                    Order ID: {doubt.order?._id?.substring(0, 6) || 'N/A'}
                  </span>
                  <span className="inline-flex items-center">
                    <Calendar size={14} className="mr-1.5" />
                    Submitted: {doubt.createdAt 
                      ? new Date(doubt.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
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