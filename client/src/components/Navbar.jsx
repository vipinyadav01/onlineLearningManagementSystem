import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { User, Home, Clock, Book, LogIn, LogOut, ChevronDown } from 'lucide-react';
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
      path: '/doubt',
      label: 'Doubt',
      icon: Clock,
      badge: <span className="ml-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide shadow-md font-semibold">Live</span>
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

  // Profile dropdown menu with backdrop blur effect
  const ProfileDropdown = () => (
    <>
      {/* Backdrop for closing dropdown when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsProfileOpen(false)}
      />
      
      <div className="absolute right-0 top-full mt-3 w-56 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden z-50">
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
          <p className="text-sm text-white font-medium">{user?.name}</p>
          <p className="text-xs text-slate-300 truncate">{user?.email}</p>
        </div>
        <div className="py-1 bg-slate-800/70">
          <NavLink
            to="/profile"
            className="block px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 flex items-center transition-colors"
            onClick={() => setIsProfileOpen(false)}
          >
            <User className="mr-2 h-4 w-4 text-teal-400" /> Profile
          </NavLink>
        </div>
        <div className="py-1 bg-slate-800/70">
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 flex items-center transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </>
  );

  // Bottom Navigation Item Component
  const BottomNavItem = ({ icon: Icon, label, to, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full py-2 transition-all ${
          isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300'
        }`
      }
    >
      <div className="relative">
        <Icon
          className={`w-6 h-6 transition-transform ${
            location.pathname === to ? 'scale-110' : 'group-hover:scale-105'
          }`}
        />
        {badge && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Top Navigation (Desktop) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/90 backdrop-blur-lg shadow-xl py-3 border-b border-slate-700/30'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 hover:shadow-teal-500/30">
                <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-cyan-400 transition-all">
                TechBit Academy
              </span>
            </NavLink>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-4 py-2.5 text-sm font-medium transition-all rounded-lg flex items-center
                    ${
                      isActive
                        ? 'text-teal-400 bg-white/5'
                        : 'text-white/90 hover:text-teal-400 hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 mr-1.5 opacity-80" />
                  {item.label}
                  {item.badge}
                  {location.pathname === item.path && (
                    <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0" />
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-0.5 shadow-lg transition-transform group-hover:scale-105 ring-2 ring-slate-700/50">
                      <img
                        src={user.profilePic || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-white flex items-center group-hover:text-teal-300 transition-colors">
                      {user.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {isProfileOpen && <ProfileDropdown />}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium transition-all bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg hover:from-teal-400 hover:to-cyan-400 text-white shadow-md hover:shadow-teal-500/30"
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
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.map((item, index) => (
              <BottomNavItem
                key={item.path}
                icon={item.icon}
                label={item.label.split(' ')[0]} // Take first word for mobile
                to={item.path}
                badge={item.badge ? true : false}
              />
            ))}
            <div className="flex items-center justify-center">
              {isLoggedIn && user ? (
                <NavLink
                  to="/profile"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/50 -mt-8 border-4 border-slate-900 flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  <img
                    src={user.profilePic || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover p-0.5"
                  />
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/30 -mt-8 border-4 border-slate-900 flex items-center justify-center transform hover:scale-105 transition-transform"
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