import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import AuthPage from './components/Login';
import CoursesDetail from './pages/CourseDetail';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import RequestCallback from './pages/RequestCallback';

// Define ComingSoon component before using it
const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl text-slate-300 max-w-md">
        This feature is coming soon. We're working hard to bring you the best experience.
      </p>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen font-sans">
        <Navbar />
        <div className="pt-20"> 
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
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;