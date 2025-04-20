import { useState, useEffect, useRef } from 'react';
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
  const profileRef = useRef(null);

  // Navigation items configuration
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: Book },
    {
      path: '/doubt',
      label: 'Doubt',
      icon: Clock,
      badge: true
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Profile dropdown menu with glass morphism effect
  const ProfileDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden z-50 border border-slate-700/50">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-0.5">
            <img
              src={user?.profilePic || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-sm text-slate-300 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="py-1">
        <NavLink
          to="/profile"
          className="block px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 flex items-center transition-all"
          onClick={() => setIsProfileOpen(false)}
        >
          <User className="mr-3 h-4 w-4 text-teal-400" /> 
          <span>Your Profile</span>
        </NavLink>
      </div>
      <div className="py-1 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full text-left block px-4 py-3 text-sm text-red-400 hover:bg-slate-700/50 flex items-center transition-all"
        >
          <LogOut className="mr-3 h-4 w-4" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Desktop Navigation Item Component
  const DesktopNavItem = ({ path, label, icon: Icon, badge }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `relative px-5 py-2.5 text-sm font-medium transition-all rounded-lg flex items-center gap-2 
        ${isActive
          ? 'text-teal-400 bg-white/5'
          : 'text-white/90 hover:text-teal-400 hover:bg-white/5'
        }`
      }
    >
      <Icon className="w-4 h-4 opacity-90" />
      <span>{label}</span>
      {badge && (
        <span className="flex h-5 items-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="ml-1.5 text-xs bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold text-white">Live</span>
        </span>
      )}
      {location.pathname === path && (
        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0" />
      )}
    </NavLink>
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
          className={`w-5 h-5 transition-transform ${
            location.pathname === to ? 'scale-110' : 'hover:scale-105'
          }`}
        />
        {badge && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-xs mt-1.5">{label.split(' ')[0]}</span>
    </NavLink>
  );

  return (
    <>
      {/* Top Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-lg shadow-lg py-3 border-b border-slate-800/50'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 shadow-teal-500/20">
                <img src="/favicon-32x32.png" alt="Logo" className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-cyan-400 transition-all">
                TechBit Academy
              </span>
            </NavLink>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <DesktopNavItem
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                />
              ))}
            </div>

            {/* Auth Section - Desktop */}
            <div className="hidden md:block">
              {isLoggedIn && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 group bg-slate-800/60 hover:bg-slate-700/60 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50"
                    aria-label="User profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-0.5 shadow-lg transition-transform group-hover:scale-105">
                      <img
                        src={user.profilePic || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors">
                      {user.name}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isProfileOpen && <ProfileDropdown />}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 overflow-hidden font-medium transition-all bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg hover:from-teal-400 hover:to-cyan-400 text-white shadow-md hover:shadow-teal-500/20"
                >
                  <span className="flex items-center gap-2">
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
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
        <div className="bg-slate-900/95 backdrop-blur-xl shadow-2xl border-t border-slate-800/50 rounded-t-xl">
          <div className="grid grid-cols-5 gap-1 px-2 py-1">
            {navItems.map((item, index) => (
              <BottomNavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                to={item.path}
                badge={item.badge}
              />
            ))}
            <div className="flex items-center justify-center">
              {isLoggedIn && user ? (
                <NavLink
                  to="/profile"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-12 h-12 rounded-full shadow-lg shadow-teal-500/30 -mt-5 border-4 border-slate-900 flex items-center justify-center transform hover:scale-105 transition-transform"
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
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-12 h-12 rounded-full shadow-lg shadow-teal-500/20 -mt-5 border-4 border-slate-900 flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  <LogIn className="w-5 h-5" />
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