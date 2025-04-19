import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import AuthPage from './components/Login';
import CoursesDetail from './pages/CourseDetail';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import RequestCallback from './pages/RequestCallback';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import Testimonials from './pages/Testimonial';
import DoubtForm from "./components/DoubtForm"

const ComingSoon = ({ title }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Interactive cursor glow effect */}
      <div 
        className="fixed w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none z-10"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
          transition: 'transform 0.1s ease-out',
        }}
      ></div>

      <div className="relative z-20">
        <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Coming Soon</span>
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-4">{title}</h1>
        <p className="text-xl text-slate-300 max-w-md">
          This feature is coming soon. We're working hard to bring you the best experience.
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Router>
      <div className="bg-slate-900 min-h-screen font-sans relative overflow-hidden">
        {/* Cursor Glow Effect */}
        <div 
          className="fixed w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none z-10"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
            transition: 'transform 0.1s ease-out',
          }}
        ></div>

        <Navbar />
        <div className="pt-20 relative z-20"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CoursesDetail />} />
            <Route path="/blog" element={<ComingSoon title="Blog" />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />
            <Route path="/live-course" element={<ComingSoon title="Live Courses" />} />
            <Route path="/request-callback" element={<RequestCallback/>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path='/testimonials' element={<Testimonials />} />
            <Route path='/doubt' element={<DoubtForm />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
