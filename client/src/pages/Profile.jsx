import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Camera, LogOut, Home, Clock, Book } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    profilePic: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    profilePic: null,
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
        setFormData({ name: res.data.name, profilePic: null });
        setProfilePicPreview(res.data.profilePic);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Upload new profile picture to Cloudinary if provided
      let profilePicUrl = user.profilePic;
      if (formData.profilePic) {
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', formData.profilePic);
        cloudinaryData.append('upload_preset', 'Hostel'); // Replace with your Cloudinary upload preset
        cloudinaryData.append('cloud_name', 'vipinyadav01'); // Replace with your Cloudinary cloud name

        const cloudinaryRes = await axios.post(
          'https://api.cloudinary.com/v1_1/vipinyadav01/image/upload', // Replace with your Cloudinary cloud name
          cloudinaryData
        );
        profilePicUrl = cloudinaryRes.data.secure_url;
      }

      // Update user data
      const updatedData = {
        name: formData.name,
        profilePic: profilePicUrl,
      };

      const res = await axios.put('http://localhost:5000/api/auth/update', updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
      setProfilePicPreview(res.data.profilePic);
      setFormData({ name: res.data.name, profilePic: null });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Bottom Navigation Item Component
  const BottomNavItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full py-2 transition-colors ${
          isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300'
        }`
      }
    >
      <Icon
        className={`w-6 h-6 ${location.pathname === to ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}
      />
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"></div>

        <div className="max-w-md w-full mx-auto relative z-10 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-slate-400/90">Manage your account details</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-teal-500/20 border border-teal-500/50 rounded-xl text-teal-400 text-sm">
              {success}
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-1 shadow-lg">
              <img
                src={profilePicPreview || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-slate-800/80 p-2 rounded-full cursor-pointer hover:bg-slate-700/80 transition-colors">
                <Camera className="w-6 h-6 text-teal-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-teal-400 transition-colors w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-10 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all placeholder-slate-500/80"
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 transition-colors w-5 h-5" />
                <input
                  type="email"
                  value={user.email}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-10 text-slate-400/80 cursor-not-allowed"
                  placeholder="your@email.com"
                  readOnly
                />
              </div>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-500 hover:to-cyan-500 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center group shadow-lg hover:shadow-teal-500/20 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="tracking-wide">{loading ? 'Updating...' : 'Update Profile'}</span>
            </button>
          </form>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-gradient-to-r from-red-500/90 to-orange-500/90 hover:from-red-500 hover:to-orange-500 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center group shadow-lg hover:shadow-red-500/20"
          >
            <LogOut className="mr-2 w-5 h-5" />
            <span className="tracking-wide">Log Out</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-md shadow-2xl border-t border-slate-700/30 rounded-t-2xl">
          <div className="grid grid-cols-5 gap-2 px-4 py-3">
            <BottomNavItem icon={Home} label="Home" to="/" />
            <BottomNavItem icon={Book} label="Courses" to="/courses" />
            <div className="flex items-center justify-center">
              <NavLink
                to="/profile"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/50 -mt-8 border-4 border-slate-900 flex items-center justify-center"
              >
                <img
                  src={profilePicPreview || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </NavLink>
            </div>
            <BottomNavItem icon={Clock} label="LiveCourses" to="/live-course" />
            <BottomNavItem icon={User} label="Request" to="/request-callback" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;