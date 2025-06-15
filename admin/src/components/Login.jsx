import { useState } from "react";
import { Lock, Mail, LogIn, BookOpen } from 'lucide-react';
import axios from "axios";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
        email,
        password,
        role: "admin",
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        onLogin(response.data.token);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl px-8 py-10 space-y-8 transform hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg mb-4 transform hover:rotate-12 transition-transform duration-300">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">TechBit Academy</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Admin Dashboard Login</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg text-sm animate-bounce">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${isEmailFocused ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300 hover:shadow-md"
                  placeholder="Your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${isPasswordFocused ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300 hover:shadow-md"
                  placeholder="Your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:opacity-50 transform hover:-translate-y-1 hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4">
            <a
              href="#"
              className="text-sm text-indigo-600 hover:text-purple-600 transition-colors duration-300 font-medium hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">© {new Date().getFullYear()} TechBit Academy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
