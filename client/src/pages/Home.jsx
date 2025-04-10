import { useState, useEffect } from 'react';
import { ChevronRight, Youtube, Users, BookOpen, ArrowRight, Star, Quote, Sparkles, Zap, Globe } from 'lucide-react';
import BlurText from '../components/BlurText';
const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };
  
  // Ossum's quotes
  const ossumQuotes = [
    "Innovation distinguishes between a leader and a follower.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Knowledge is the currency of the digital age.",
    "To master technology is to master the future."
  ];

  return (
    <div className="flex flex-col items-center bg-slate-900 text-white relative overflow-hidden">
      {/* Simple background without animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Removed noise overlay and random blur elements */}
      </div>
      
      {/* Interactive cursor glow effect - kept as requested */}
      <div 
        className="fixed w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none z-10"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
          transition: 'transform 0.1s ease-out',
        }}
      ></div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen p-6 relative z-20">
        <div className={`max-w-4xl z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
              <Sparkles className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Evolution of Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-3 tracking-tight">
              We shape tomorrow's
            </h1>
            <BlurText
              text="technological visionaries."
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight text-white"
            />
            <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              {ossumQuotes[0]} Accelerate your career with our cutting-edge curriculum and immersive learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/courses"
                className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-lg rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-900/40 transition-all duration-300 hover:scale-105"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative">Explore Courses</span>
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 backdrop-blur-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-teal-500/50">
                Join Community
              </button>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 z-10 transition-all duration-1000 transform delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mr-4">
              <Users className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">1K+</h3>
              <p className="text-sm text-slate-400">Students taught</p>
            </div>
          </div>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mr-4">
              <BookOpen className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">5+</h3>
              <p className="text-sm text-slate-400">Expert instructors</p>
            </div>
          </div>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mr-4">
              <Youtube className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">50K+</h3>
              <p className="text-sm text-slate-400">YouTube subscribers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl w-full relative z-20">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
            <Zap className="w-4 h-4 text-teal-400 mr-2" />
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Our Approach</span>
          </div>
          <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
            Extraordinary Learning Experience
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {ossumQuotes[1]}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-102 hover:border-teal-500/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <Star className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pioneering Curriculum</h3>
            <p className="text-slate-400">Industry-defining content developed by leaders who shape the future of technology.</p>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-102 hover:border-teal-500/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <Zap className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Immersive Learning</h3>
            <p className="text-slate-400">Advanced projects that simulate real-world challenges with cutting-edge technology.</p>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-102 hover:border-teal-500/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <Globe className="text-teal-400 w-6 h-6 group-hover:text-teal-300 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Global Network</h3>
            <p className="text-slate-400">Connect with a worldwide community of forward-thinking professionals and visionaries.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 max-w-6xl w-full bg-gradient-to-b from-slate-900 to-slate-800 relative z-20">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
            <Users className="w-4 h-4 text-teal-400 mr-2" />
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Success Stories</span>
          </div>
          <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
            Voices of Innovation
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {ossumQuotes[2]}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 transition-all hover:scale-102 hover:border-teal-500/50">
            <Quote className="text-teal-400 w-8 h-8 mb-6" />
            <p className="text-slate-300 mb-6">"This platform didn't just transform my career—it completely reimagined my understanding of what's possible in tech."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 mr-3"></div>
              <div>
                <p className="font-medium">Jane Doe</p>
                <p className="text-sm text-slate-400">AI Research Engineer</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 transition-all hover:scale-102 hover:border-teal-500/50">
            <Quote className="text-teal-400 w-8 h-8 mb-6" />
            <p className="text-slate-300 mb-6">"The immersive projects empowered me to tackle challenges I never thought possible, making me a pioneer in my field."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 mr-3"></div>
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-sm text-slate-400">Quantum Computing Specialist</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 transition-all hover:scale-102 hover:border-teal-500/50 md:col-span-2 lg:col-span-1">
            <Quote className="text-teal-400 w-8 h-8 mb-6" />
            <p className="text-slate-300 mb-6">"The combination of visionary curriculum and supportive community accelerated my growth beyond what I thought was humanly possible."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 mr-3"></div>
              <div>
                <p className="font-medium">Alex Rivera</p>
                <p className="text-sm text-slate-400">Blockchain Architect</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a
            href="/testimonials"
            className="inline-flex items-center px-6 py-2 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-all hover:border-teal-500/50"
          >
            Read More Success Stories
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 w-full text-center relative z-20">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-slate-800/30 border border-slate-700 rounded-3xl p-12 relative overflow-hidden">
          {/* Simplified background without animated elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              Begin Your Technological Evolution
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              {ossumQuotes[3]} Join thousands of visionaries who are shaping tomorrow's innovations.
            </p>
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-lg rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-900/40 transition-all duration-300 hover:scale-105"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-80 group-hover:h-80 opacity-10"></span>
              <span className="relative flex items-center">
                Launch Your Journey
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
    
  );
};

export default Home;