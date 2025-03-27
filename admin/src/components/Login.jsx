import React, { useState } from 'react';
import { Lock, Mail, LogIn, BookOpen } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        onLogin(response.data.token);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-xl rounded-xl px-8 py-10 space-y-6">
          <div className="flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              TechBit Academy
            </h2>
          </div>
          
          <p className="text-center text-sm text-gray-600">
            Admin Dashboard Login
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <a 
              href="#" 
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;