import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Twitter, Camera } from 'lucide-react';
import axios from 'axios';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePic: null,
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }

      setFormData((prev) => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        // Enhanced error handling for signup
        if (!formData.name) {
          throw new Error('Name is required');
        }
        if (!formData.email) {
          throw new Error('Email is required');
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Profile picture upload with improved error handling
        let profilePicUrl = '';
        if (formData.profilePic) {
          const cloudinaryData = new FormData();
          cloudinaryData.append('file', formData.profilePic);
          cloudinaryData.append('upload_preset', 'Hostel');
          cloudinaryData.append('cloud_name', 'vipinyadav01');

          try {
            const cloudinaryRes = await axios.post(
              'https://api.cloudinary.com/v1_1/vipinyadav01/image/upload',
              cloudinaryData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                timeout: 10000 // 10 second timeout
              }
            );
            profilePicUrl = cloudinaryRes.data.secure_url;
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            throw new Error('Failed to upload profile picture. Please try again.');
          }
        }

        // Send signup data to backend
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profilePic: profilePicUrl,
        };

        const signupRes = await axios.post('http://localhost:5000/api/auth/signup', signupData);
        console.log('Signup successful:', signupRes.data);
      } else {
        // Login logic
        const loginData = {
          email: formData.email,
          password: formData.password,
        };

        const loginRes = await axios.post('http://localhost:5000/api/auth/login', loginData);
        console.log('Login successful:', loginRes.data);
      }
    } catch (err) {
      // More detailed error handling
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'An unexpected error occurred';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', profilePic: null });
    setProfilePicPreview(null);
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"></div>

        <div className="max-w-md w-full mx-auto relative z-10 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              TechBit Academy
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              {isLogin ? 'Welcome back' : 'Get Started'}
            </h1>
            <p className="text-slate-400/90">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to begin'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (Signup only) */}
            {!isLogin && (
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
            )}

            {/* Profile Picture Upload (Signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative group">
                  <label className="flex items-center justify-center w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-4 cursor-pointer hover:bg-slate-800/70 transition-all">
                    <Camera className="w-5 h-5 text-slate-400/80 mr-2" />
                    <span className="text-slate-400/80">
                      {formData.profilePic ? 'Change Profile Picture' : 'Upload Profile Picture'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {profilePicPreview && (
                  <div className="flex justify-center">
                    <img
                      src={profilePicPreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-teal-500/50"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-teal-400 transition-colors w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-10 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all placeholder-slate-500/80"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-teal-400 transition-colors w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 px-10 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all placeholder-slate-500/80"
                  placeholder={isLogin ? 'Your password' : 'Create a password'}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400/80 hover:text-teal-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            {isLogin && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-slate-800/50 border-slate-700/50 rounded focus:ring-teal-500/50 checked:bg-teal-500/80"
                  />
                  <span className="text-sm text-slate-400/90">Remember me</span>
                </label>
                <a href="#" className="text-sm text-teal-400/90 hover:text-teal-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-500 hover:to-cyan-500 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center group shadow-lg hover:shadow-teal-500/20 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="tracking-wide">{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!loading && (
                <ArrowRight className="ml-3 w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-8">
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-slate-900/80 text-slate-400/80 text-sm">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="w-full flex items-center justify-center p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
                <Github className="w-5 h-5 text-slate-400/90" />
              </button>
              <button className="w-full flex items-center justify-center p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
                <Twitter className="w-5 h-5 text-slate-400/90" />
              </button>
            </div>
          </div>

          {/* Toggle auth */}
          <p className="mt-8 text-center text-slate-400/90">
            {isLogin ? 'New here?' : 'Already registered?'}
            <button
              onClick={toggleView}
              className="ml-2 text-teal-400/90 hover:text-teal-300 font-medium transition-colors"
            >
              {isLogin ? 'Create account' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center bg-slate-900/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Elevate Your Skills
            </h2>
            <p className="text-slate-300/90 text-lg mb-8">
              Join a community of passionate learners and industry experts
            </p>

            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { value: '25K+', label: 'Students' },
                { value: '1.2M', label: 'Hours Taught' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <div key={index} className="bg-slate-900/30 p-4 rounded-2xl">
                  <p className="text-3xl font-bold text-teal-400 mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-400/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-500/10 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default AuthPage;