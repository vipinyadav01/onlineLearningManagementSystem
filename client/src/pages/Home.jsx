import { useState, useEffect } from 'react';
import { ChevronRight, Youtube, Users, BookOpen, ArrowRight, Star, Quote } from 'lucide-react';
import BlurText from '../components/BlurText';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 text-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-80">
          <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] bg-repeat"></div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className={`max-w-4xl z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400 mb-4">Revolutionary Learning Platform</span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-3 tracking-tight">
              We only teach what we
            </h1>
            <BlurText
              text="are truly exceptional at."
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight text-white"
            />
            <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Accelerate your career with expert-crafted courses and make your impact in the tech industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/courses"
                className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-lg rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Explore Courses
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-slate-400">
                Join Community
              </button>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 z-10 transition-all duration-1000 transform delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <Users className="text-teal-400 w-10 h-10 mr-4 group-hover:text-teal-300 transition-colors" />
            <div>
              <h3 className="text-3xl font-bold">25K+</h3>
              <p className="text-sm text-slate-400">Students taught</p>
            </div>
          </div>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <BookOpen className="text-teal-400 w-10 h-10 mr-4 group-hover:text-teal-300 transition-colors" />
            <div>
              <h3 className="text-3xl font-bold">20+</h3>
              <p className="text-sm text-slate-400">Expert instructors</p>
            </div>
          </div>
          <div className="flex items-center p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105 cursor-pointer">
            <Youtube className="text-teal-400 w-10 h-10 mr-4 group-hover:text-teal-300 transition-colors" />
            <div>
              <h3 className="text-3xl font-bold">502K+</h3>
              <p className="text-sm text-slate-400">YouTube subscribers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl w-full">
        <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105">
            <Star className="text-teal-400 w-8 h-8 mb-4 group-hover:text-teal-300 transition-colors" />
            <h3 className="text-xl font-semibold mb-2">Expert-Led Content</h3>
            <p className="text-slate-400">Learn from industry leaders who excel in their fields.</p>
          </div>
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105">
            <BookOpen className="text-teal-400 w-8 h-8 mb-4 group-hover:text-teal-300 transition-colors" />
            <h3 className="text-xl font-semibold mb-2">Practical Skills</h3>
            <p className="text-slate-400">Hands-on projects to build real-world experience.</p>
          </div>
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all group hover:scale-105">
            <Users className="text-teal-400 w-8 h-8 mb-4 group-hover:text-teal-300 transition-colors" />
            <h3 className="text-xl font-semibold mb-2">Thriving Community</h3>
            <p className="text-slate-400">Connect with peers and mentors for support and growth.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 max-w-6xl w-full bg-gradient-to-b from-slate-900 to-slate-800">
        <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
          What Our Students Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 transition-all hover:scale-105">
            <Quote className="text-teal-400 w-6 h-6 mb-4" />
            <p className="text-slate-300 mb-4">"This platform transformed my career. The courses are top-notch and the community is incredibly supportive."</p>
            <p className="text-sm text-slate-400">- Jane Doe, Software Engineer</p>
          </div>
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700 bg-slate-800/50 transition-all hover:scale-105">
            <Quote className="text-teal-400 w-6 h-6 mb-4" />
            <p className="text-slate-300 mb-4">"The practical projects gave me the confidence to tackle real-world challenges."</p>
            <p className="text-sm text-slate-400">- John Smith, Data Scientist</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <a
            href="/testimonials"
            className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors"
          >
            Read More Stories
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 w-full text-center">
        <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
          Ready to Start Your Journey?
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Join thousands of learners and take the first step towards mastering in-demand skills.
        </p>
        <a
          href="/signup"
          className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-lg rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Get Started Now
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </section>
    </div>
  );
};

export default Home;