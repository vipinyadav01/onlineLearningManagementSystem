import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, Home, Clock, Book, LogIn } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data from the backend
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login');
      return null;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await fetchUserData();
        if (userData) {
          setIsLoggedIn(true);
          setUser(userData);
        }
      }
    };

    initializeAuth();
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Optionally call a logout endpoint if your backend supports it
        await axios.post(
          'http://localhost:5000/api/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setIsProfileOpen(false);
      navigate('/login');
    }
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
        className={`w-6 h-6 ${
          location.pathname === to ? 'scale-110' : 'group-hover:scale-105'
        } transition-transform`}
      />
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Top Navigation (Desktop Only) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/90 backdrop-blur-md shadow-xl py-3 border-b border-slate-700/30'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
              </div>
              <NavLink
                to="/"
                className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent"
              >
                TechBit Academy
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-sm font-medium transition-colors rounded-lg hover:bg-white/5 group ${
                    isActive ? 'text-teal-400' : 'text-white/90 hover:text-teal-400'
                  }`
                }
              >
                Home
                <span
                  className={`absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0 transition-all group-hover:w-full group-hover:left-0 ${
                    location.pathname === '/' ? 'w-full left-0' : ''
                  }`}
                ></span>
              </NavLink>
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-sm font-medium transition-colors rounded-lg hover:bg-white/5 group ${
                    isActive ? 'text-teal-400' : 'text-white/90 hover:text-teal-400'
                  }`
                }
              >
                Courses
                <span
                  className={`absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0 transition-all group-hover:w-full group-hover:left-0 ${
                    location.pathname === '/courses' ? 'w-full left-0' : ''
                  }`}
                ></span>
              </NavLink>
              <NavLink
                to="/live-course"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-sm font-medium transition-colors rounded-lg hover:bg-white/5 group ${
                    isActive ? 'text-teal-400' : 'text-white/90 hover:text-teal-400'
                  }`
                }
              >
                LIVE Course
                <span className="ml-1.5 bg-red-500/90 text-[0.65rem] px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-md">
                  New
                </span>
                <span
                  className={`absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0 transition-all group-hover:w-full group-hover:left-0 ${
                    location.pathname === '/live-course' ? 'w-full left-0' : ''
                  }`}
                ></span>
              </NavLink>
              <NavLink
                to="/request-callback"
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-sm font-medium transition-colors rounded-lg hover:bg-white/5 group ${
                    isActive ? 'text-teal-400' : 'text-white/90 hover:text-teal-400'
                  }`
                }
              >
                Request Callback
                <span
                  className={`absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0 transition-all group-hover:w-full group-hover:left-0 ${
                    location.pathname === '/request-callback' ? 'w-full left-0' : ''
                  }`}
                ></span>
              </NavLink>

              <div className="ml-4 relative">
                {isLoggedIn && user ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-0.5 shadow-lg">
                        <img
                          src={user.profilePic || 'https://via.placeholder.com/150'}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-white/90">{user.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-teal-400 transition-transform ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-700/50 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-700/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium transition-all bg-gradient-to-r from-teal-500/90 to-cyan-500/90 rounded-lg hover:from-teal-500 hover:to-cyan-500 text-white shadow-md hover:shadow-teal-500/20"
                  >
                    <span className="relative flex items-center gap-1">
                      Login
                      <ChevronDown className="ml-1 w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                    </span>
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-md shadow-2xl border-t border-slate-700/30 rounded-t-2xl">
          <div className="grid grid-cols-5 gap-2 px-4 py-3">
            <BottomNavItem icon={Home} label="Home" to="/" />
            <BottomNavItem icon={Book} label="Courses" to="/courses" />
            <div className="flex items-center justify-center">
              {isLoggedIn && user ? (
                <NavLink
                  to="/profile"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/50 -mt-8 border-4 border-slate-900 flex items-center justify-center"
                >
                  <img
                    src={user.profilePic || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/50 -mt-8 border-4 border-slate-900 flex items-center justify-center"
                >
                  <LogIn className="w-8 h-8" />
                </NavLink>
              )}
            </div>
            <BottomNavItem icon={Clock} label="LiveCourses" to="/live-course" />
            <BottomNavItem icon={User} label="Request" to="/request-callback" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;