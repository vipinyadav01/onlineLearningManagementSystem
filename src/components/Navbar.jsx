import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toggle login state for demonstration
  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-slate-900/90 backdrop-blur-md shadow-xl py-3 border-b border-slate-700/30'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
            </div>
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              TechBit Academy
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/live-course">
              LIVE Course
              <span className="ml-1.5 bg-red-500/90 text-[0.65rem] px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-md">
                New
              </span>
            </NavLink>
            <NavLink href="/request-callback">Request Callback</NavLink>

            <div className="ml-4 relative">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-0.5 shadow-lg">
                      <div className="bg-slate-800 rounded-full p-1.5">
                        <User className="w-5 h-5 text-teal-400/90" />
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-teal-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-700/50 py-2">
                      <button
                        onClick={handleAuth}
                        className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-700/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/login"
                  className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium transition-all bg-gradient-to-r from-teal-500/90 to-cyan-500/90 rounded-lg hover:from-teal-500 hover:to-cyan-500 text-white shadow-md hover:shadow-teal-500/20"
                >
                  <span className="relative flex items-center gap-1">
                    Login
                    <ChevronDown className="ml-1 w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-teal-400 transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isMenuOpen
          ? 'max-h-96 opacity-100 border-b border-slate-700 bg-slate-900/90 backdrop-blur-md'
          : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-3 space-y-2">
          <MobileNavLink href="/">Home</MobileNavLink>
          <MobileNavLink href="/courses">Courses</MobileNavLink>
          <MobileNavLink href="/live-course">LIVE Course</MobileNavLink>
          <MobileNavLink href="/request-callback">Request Callback</MobileNavLink>

          <div className="pt-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-0.5">
                  <div className="bg-slate-800 rounded-full p-1.5">
                    <User className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
                <button
                  onClick={handleAuth}
                  className="flex-1 bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white px-5 py-3 rounded-lg font-medium hover:shadow-red-500/20 transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="block w-full text-center bg-gradient-to-r from-teal-500/90 to-cyan-500/90 text-white px-5 py-3 rounded-lg font-medium hover:shadow-teal-500/20 transition-all"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Updated Desktop navigation link component
const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="relative px-4 py-2.5 text-sm font-medium text-white/90 hover:text-teal-400 transition-colors rounded-lg hover:bg-white/5 group"
  >
    {children}
    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0 transition-all group-hover:w-full group-hover:left-0"></span>
  </a>
);

// Updated Mobile navigation link component
const MobileNavLink = ({ href, children }) => (
  <a
    href={href}
    className="block px-3 py-3.5 text-base font-medium text-white/90 hover:text-teal-400 border-b border-slate-800 hover:bg-white/5 transition-all rounded-lg"
  >
    {children}
  </a>
);

export default Navbar;