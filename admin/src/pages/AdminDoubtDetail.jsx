import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AlertCircle, RefreshCw, ArrowLeft, CheckCircle, Loader2, Paperclip } from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const AdminDoubtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const fetchDoubt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/doubts/admin/single/${id}`);
      setDoubt(res.data.data);
      setStatus(res.data.data.status);
      setResponse(res.data.data.response || '');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch doubt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubt();
    // eslint-disable-next-line
  }, [id]);

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleResponseChange = (e) => setResponse(e.target.value);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/doubts/admin/${id}`, { status, response });
      setSuccess('Doubt updated successfully!');
      fetchDoubt();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update doubt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
        <Loader2 className="animate-spin w-16 h-16 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-red-200 animate-fade-in">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDoubt}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center shadow-md hover:shadow-xl"
          >
            <RefreshCw className="mr-2 h-5 w-5 animate-spin-slow" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!doubt) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-8 min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doubt Details</h1>
            <p className="text-sm text-gray-500">Created: {new Date(doubt.createdAt).toLocaleString()}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${doubt.status === 'pending' ? 'bg-amber-100 text-amber-700' : doubt.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{doubt.status.replace('_', ' ')}</span>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="text-sm text-gray-600">User: <span className="font-semibold">{doubt.user?.name || 'Unknown'}</span></div>
            <div className="text-sm text-gray-600">Email: <span className="font-semibold">{doubt.user?.email || 'N/A'}</span></div>
            <div className="text-sm text-gray-600">Course: <span className="font-semibold">{doubt.courseTitle || doubt.order?.courseTitle || doubt.order?.productName || 'N/A'}</span></div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Title</h2>
          <p className="text-gray-700 text-base mb-4 bg-indigo-50 rounded-lg p-4 font-medium">{doubt.title}</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-700 text-base bg-indigo-50 rounded-lg p-4">{doubt.description}</p>
        </div>
        {doubt.attachments && doubt.attachments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Attachments</h2>
            <ul className="flex flex-wrap gap-4">
              {doubt.attachments.map((att, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    {att.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Admin Response</h2>
          <textarea
            className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 bg-indigo-50"
            value={response}
            onChange={handleResponseChange}
            placeholder="Write your response to the user..."
          />
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Update Status</h2>
          <select
            className="w-full md:w-1/2 border-2 border-gray-200 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700 font-medium transition-all duration-300"
            value={status}
            onChange={handleStatusChange}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 shadow-md focus:ring-2 focus:ring-indigo-400 focus:outline-none ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {success && <span className="text-emerald-600 font-medium flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminDoubtDetail; 