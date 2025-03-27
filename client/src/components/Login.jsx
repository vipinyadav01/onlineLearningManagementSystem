import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
  Twitter,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500'
  ];

  return (
    <div className="flex items-center space-x-2 mt-2">
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-gray-600'}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${strengthColors[strength - 1] || 'text-gray-400'}`}>
        {strengthLabels[strength - 1] || 'Very Weak'}
      </span>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePic: null,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let refreshInterval;

    const verifyAndRefreshToken = async () => {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        setVerifyingToken(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.isValid) {
          navigate('/');
        } else {
          await refreshAccessToken();
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        if (err.response?.status === 401) {
          await refreshAccessToken();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setVerifyingToken(false);
        }
      }
    };

    const refreshAccessToken = async () => {
      try {
        const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
          refreshToken: localStorage.getItem('refreshToken')
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          navigate('/');
        } else {
          throw new Error('No new access token received');
        }
      } catch (refreshErr) {
        console.error('Token refresh failed:', refreshErr);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setVerifyingToken(false);
      }
    };

    verifyAndRefreshToken();

    refreshInterval = setInterval(refreshAccessToken, 15 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  useEffect(() => {
    if (!isLogin) {
      setPasswordValidation({
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        specialChar: /[^A-Za-z0-9]/.test(formData.password)
      });
    }
  }, [formData.password, isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    setFormData((prev) => ({ ...prev, profilePic: file }));
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicPreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      if (!isLogin) {
        if (!formData.name) {
          throw new Error('Name is required');
        }
        if (Object.values(passwordValidation).some(v => !v)) {
          throw new Error('Password does not meet all requirements');
        }
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!baseUrl) {
        throw new Error('API configuration is missing');
      }

      let response;
      if (!isLogin) {
        let profilePicUrl = '';
        if (formData.profilePic) {
          const cloudinaryData = new FormData();
          cloudinaryData.append('file', formData.profilePic);
          cloudinaryData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Hostel');
          cloudinaryData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vipinyadav01');

          const cloudinaryRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vipinyadav01'}/image/upload`,
            cloudinaryData
          );
          profilePicUrl = cloudinaryRes.data.secure_url;
        }

        response = await axios.post(`${baseUrl}/auth/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profilePic: profilePicUrl,
        });
      } else {
        response = await axios.post(`${baseUrl}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
      }

      if (response.data.data?.accessToken) {
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          err.message ||
                          'An unexpected error occurred';
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', profilePic: null });
    setProfilePicPreview(null);
    setError('');
    setSuccess('');
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-gray-800/80 p-4 rounded-xl shadow-lg">
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          <span className="text-white text-lg">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />

        <div className="max-w-md w-full mx-auto relative z-10 bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              TechBit Academy
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-gray-400 mb-6">
            {isLogin ? 'Sign in to continue learning' : 'Create an account to start your journey'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2 text-red-300">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-2 text-green-300">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-white placeholder-gray-500"
                  placeholder="Full Name"
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="flex items-center justify-center w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 cursor-pointer hover:bg-gray-700 transition-all">
                  <Camera className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">
                    {formData.profilePic ? 'Change Picture' : 'Upload Profile Picture'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {profilePicPreview && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={profilePicPreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-teal-500/50 shadow-md"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-white placeholder-gray-500"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-white placeholder-gray-500"
                placeholder={isLogin ? 'Password' : 'Create a password'}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <>
                <PasswordStrengthIndicator password={formData.password} />
                <div className="space-y-1 text-sm">
                  {[
                    { label: '8+ characters', check: passwordValidation.length },
                    { label: 'Uppercase', check: passwordValidation.uppercase },
                    { label: 'Lowercase', check: passwordValidation.lowercase },
                    { label: 'Number', check: passwordValidation.number },
                    { label: 'Special character', check: passwordValidation.specialChar },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.check ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={item.check ? 'text-green-400' : 'text-red-400'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 text-teal-500"
                  />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && Object.values(passwordValidation).some(v => !v))}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="w-full flex items-center justify-center p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-all">
                <Github className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-center p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-all">
                <Twitter className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={toggleView}
              className="ml-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-700">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Elevate Your Skills
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of learners mastering new skills with expert-led courses
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '25K+', label: 'Students' },
                { value: '1.2M', label: 'Hours Taught' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-teal-400 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
