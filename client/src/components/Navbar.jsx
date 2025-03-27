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

  // Navigation items configuration
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: Book },
    {
      path: '/live-course',
      label: 'LIVE Course',
      icon: Clock,
      badge: <span className="ml-1.5 bg-red-500/90 text-[0.65rem] px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-md">New</span>
    },
    { path: '/request-callback', label: 'Request Callback', icon: User },
  ];

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        throw new Error('Failed to fetch user data');
      }

      return response.data.data;
    } catch (error) {
      console.error('Authentication Error:', error.message);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login');
      return null;
    }
  };

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
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setIsProfileOpen(false);
      navigate('/login');
    }
  };

  // Profile dropdown menu
  const ProfileDropdown = () => (
    <div
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
      onBlur={() => setIsProfileOpen(false)}
    >
      <div className="px-4 py-3">
        <p className="text-sm text-gray-900">{user?.name}</p>
        <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
      </div>
      <div className="py-1">
        <NavLink
          to="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => setIsProfileOpen(false)}
        >
          <User className="mr-2 h-4 w-4" /> Profile
        </NavLink>
      </div>
      <div className="py-1">
        <button
          onClick={handleLogout}
          className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  // Bottom Navigation Item Component
  const BottomNavItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full py-2 transition-all ${
          isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300'
        }`
      }
    >
      <Icon
        className={`w-6 h-6 transition-transform ${
          location.pathname === to ? 'scale-110' : 'group-hover:scale-105'
        }`}
      />
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Top Navigation (Desktop) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-lg shadow-xl py-3 border-b border-slate-700/30'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
                TechBit Academy
              </span>
            </NavLink>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-4 py-2.5 text-sm font-medium transition-all rounded-lg
                    ${
                      isActive
                        ? 'text-teal-400 bg-white/5'
                        : 'text-white/90 hover:text-teal-400 hover:bg-white/3'
                    }`
                  }
                >
                  {item.label}
                  {item.badge}
                  {location.pathname === item.path && (
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-teal-400/30 via-teal-400 to-teal-400/30" />
                  )}
                </NavLink>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4 ml-4 relative">
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 group"
                    aria-label="User profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-0.5 shadow-lg transition-transform group-hover:scale-105">
                      <img
                        src={user.profilePic || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border border-slate-700/30"
                      />
                    </div>
                    <span className="text-sm font-medium text-white flex items-center">
                      {user.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </span>
                  </button>
                  {isProfileOpen && <ProfileDropdown />}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium transition-all bg-gradient-to-r from-teal-500/90 to-cyan-500/90 rounded-lg hover:from-teal-500 hover:to-cyan-500 text-white shadow-md hover:shadow-teal-500/30"
                >
                  <span className="relative flex items-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/95 backdrop-blur-lg shadow-2xl border-t border-slate-700/30 rounded-t-2xl">
          <div className="grid grid-cols-5 gap-2 px-4 py-3">
            {navItems.map((item) => (
              <BottomNavItem
                key={item.path}
                icon={item.icon}
                label={item.label.split(' ')[0]} // Take first word for mobile
                to={item.path}
              />
            ))}
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
                  <LogIn className="w-6 h-6" />
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
