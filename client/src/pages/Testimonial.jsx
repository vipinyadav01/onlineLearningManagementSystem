import { useState, useEffect } from 'react';
import { ChevronRight, Users, Star, Quote, Sparkles, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import BlurText from '../components/BlurText';

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Aarav Mehta",
      role: "AI Research Engineer",
      company: "TechNova",
      image: "https://via.placeholder.com/150",
      quote: "This platform didn't just transform my career—it completely reimagined my understanding of what's possible in tech. The curriculum pushed me to think beyond conventional boundaries, preparing me for challenges I didn't even know existed in the field.",
      category: "ai",
      rating: 5
    },
    {
      id: 2,
      name: "Neha Kapoor",
      role: "Quantum Computing Specialist",
      company: "QuantumLeap",
      image: "https://via.placeholder.com/150",
      quote: "The immersive projects empowered me to tackle challenges I never thought possible, making me a pioneer in my field. I went from theory to implementation in record time, and now lead groundbreaking initiatives at my company.",
      category: "quantum",
      rating: 5
    },
    {
      id: 3,
      name: "Rohan Iyer",
      role: "Blockchain Architect",
      company: "ChainInnovate",
      image: "https://via.placeholder.com/150",
      quote: "The combination of visionary curriculum and supportive community accelerated my growth beyond what I thought was humanly possible. I built a network of brilliant minds that continues to fuel my professional journey.",
      category: "blockchain",
      rating: 5
    },
    {
      id: 4,
      name: "Priya Sharma",
      role: "Cybersecurity Expert",
      company: "SecureShield",
      image: "https://via.placeholder.com/150",
      quote: "After completing the advanced security courses, I was able to identify vulnerabilities that even seasoned professionals missed. This education wasn't just about learning—it was about developing an entirely new mindset for approaching digital security.",
      category: "security",
      rating: 5
    },
    {
      id: 5,
      name: "Aditya Verma",
      role: "Cloud Solutions Architect",
      company: "CloudSphere",
      image: "https://via.placeholder.com/150",
      quote: "The hands-on approach to cloud infrastructure fundamentally changed how I architect solutions. I can now confidently design systems that scale elegantly under any conditions, thanks to the rigorous practical exercises.",
      category: "cloud",
      rating: 4
    },
    {
      id: 6,
      name: "Ishita Rao",
      role: "ML Operations Engineer",
      company: "DataPulse",
      image: "https://via.placeholder.com/150",
      quote: "Moving from theory to production-ready machine learning models seemed impossible until I discovered this program. Now I lead MLOps initiatives that deliver real business impact, all built on the foundation I developed here.",
      category: "ai",
      rating: 5
    },
    {
      id: 7,
      name: "Kabir Nair",
      role: "AR/VR Developer",
      company: "ImmerseTech",
      image: "https://via.placeholder.com/150",
      quote: "The specialized immersive technology track prepared me for challenges at the cutting edge of spatial computing. I went from struggling with basic concepts to creating experiences that redefine human-computer interaction.",
      category: "immersive",
      rating: 4
    },
    {
      id: 8,
      name: "Ananya Menon",
      role: "Robotics Engineer",
      company: "AutomatePro",
      image: "https://via.placeholder.com/150",
      quote: "The robotics curriculum bridged the gap between traditional engineering and cutting-edge automation techniques. Now I lead a team developing next-generation industrial robots that are transforming manufacturing.",
      category: "robotics",
      rating: 5
    },
    {
      id: 9,
      name: "Arjun Chatterjee",
      role: "Blockchain Developer",
      company: "BlockMatrix",
      image: "https://via.placeholder.com/150",
      quote: "The deep dive into distributed systems and cryptography principles gave me an edge in developing secure, scalable blockchain solutions. Now I'm contributing to protocols that might reshape how value moves around the world.",
      category: "blockchain",
      rating: 5
    }
  ];
  

  // Filter categories
  const categories = [
    { id: 'all', name: 'All Stories' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'security', name: 'Cybersecurity' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'quantum', name: 'Quantum Computing' },
    { id: 'immersive', name: 'AR/VR' },
    { id: 'robotics', name: 'Robotics' }
  ];

  // Filter testimonials based on selected category
  const filteredTestimonials = activeFilter === 'all' 
    ? testimonials 
    : testimonials.filter(item => item.category === activeFilter);

  // Render star rating component
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-teal-400' : 'text-slate-600'}`} 
        fill={i < rating ? '#2dd4bf' : 'none'} 
      />
    ));
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] bg-repeat"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className="relative opacity-20"
              style={{
                gridColumnStart: Math.floor(Math.random() * 12) + 1,
                gridRowStart: Math.floor(Math.random() * 12) + 1,
              }}
            >
              <div 
                className="absolute w-32 h-32 rounded-full bg-teal-500/20 blur-3xl animate-pulse"
                style={{ 
                  animationDuration: `${Math.random() * 8 + 4}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Interactive cursor glow effect */}
      <div 
        className="fixed w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none z-10"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
          transition: 'transform 0.1s ease-out',
        }}
      ></div>

      {/* Header Section */}
      <section className="py-24 px-6 w-full relative z-20 max-w-6xl mx-auto">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center mb-6">
            <a href="/" className="flex items-center text-slate-400 hover:text-teal-400 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Back to Home</span>
            </a>
          </div>
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
              <Quote className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Success Stories</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-3 tracking-tight">
              Our Community of
            </h1>
            <BlurText
              text="Technological Visionaries"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-5xl font-bold mb-8 tracking-tight text-white"
            />
            <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover how our platform has transformed careers and empowered innovators to make their mark on the future of technology.
            </p>
          </div>
          
          {/* Filter Categories */}
          <div className="overflow-x-auto pb-4 mb-8">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                    activeFilter === category.id 
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                      : 'backdrop-blur-md bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-teal-500/50'
                  }`}
                  onClick={() => setActiveFilter(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid Section */}
      <section className="px-6 w-full max-w-6xl mx-auto mb-24 relative z-20">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {filteredTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="p-8 rounded-2xl backdrop-blur-md border border-slate-700 bg-slate-800/50 transition-all hover:scale-102 hover:border-teal-500/50 flex flex-col h-full"
            >
              <Quote className="text-teal-400 w-8 h-8 mb-6" />
              <p className="text-slate-300 mb-6 flex-grow">{testimonial.quote}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 mr-3 flex items-center justify-center text-slate-900 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                    <p className="text-xs text-teal-400">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTestimonials.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 mb-4">
              <Filter className="text-teal-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No stories found</h3>
            <p className="text-slate-400 mb-6">Try selecting a different category</p>
            <button 
              className="px-6 py-2 rounded-full text-sm transition-all duration-300 backdrop-blur-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-teal-500/50"
              onClick={() => setActiveFilter('all')}
            >
              Show all stories
            </button>
          </div>
        )}
      </section>

      {/* Featured Story Section */}
      <section className="py-24 px-6 w-full bg-gradient-to-b from-slate-900 to-slate-800 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 mb-6">
              <Sparkles className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-xs font-mono uppercase tracking-widest text-teal-400">Featured Story</span>
            </div>
            <h2 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              Transformational Journey
            </h2>
          </div>
          
          <div className="backdrop-blur-md bg-slate-800/30 border border-slate-700 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center text-slate-900 text-4xl font-bold">
                  DT
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Dr. Taylor Richards</h3>
                  <p className="text-teal-400 mb-1">Former Neurosurgeon</p>
                  <p className="text-lg text-white">Now: Neural Interface Architect at BrainLink Technologies</p>
                </div>
              </div>
              
              <div className="mb-8">
                <Quote className="text-teal-400 w-10 h-10 mb-4" />
                <p className="text-xl text-slate-300 italic mb-4">
                  "After 15 years as a neurosurgeon, I felt limited by current medical technology. I wanted to create solutions that could help millions, not just the patients I could personally treat. 
                </p>
                <p className="text-xl text-slate-300 italic mb-4">
                  This educational platform bridged the gap between my medical expertise and cutting-edge technology. The specialized neural engineering track allowed me to apply my understanding of the brain to developing interfaces that could transform lives.
                </p>
                <p className="text-xl text-slate-300 italic">
                  Now I lead a team developing neural interfaces that help paralyzed patients regain movement. What seemed impossible is now my daily work, and it all began with taking that first course."
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs backdrop-blur-md bg-slate-800/50 border border-teal-500/50 text-teal-400">Neural Engineering</span>
                <span className="px-3 py-1 rounded-full text-xs backdrop-blur-md bg-slate-800/50 border border-slate-700 text-slate-300">Career Transition</span>
                <span className="px-3 py-1 rounded-full text-xs backdrop-blur-md bg-slate-800/50 border border-slate-700 text-slate-300">Medical Technology</span>
                <span className="px-3 py-1 rounded-full text-xs backdrop-blur-md bg-slate-800/50 border border-slate-700 text-slate-300">Human-Machine Interface</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <a href="/story/dr-taylor-richards" className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-all hover:border-teal-500/50">
              Read Full Story
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Share Your Story CTA */}
      <section className="py-24 px-6 w-full text-center relative z-20">
        <div className="max-w-3xl mx-auto backdrop-blur-md bg-slate-800/30 border border-slate-700 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              Share Your Success Story
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-8">
              Your journey can inspire future innovators. Tell us how our platform helped transform your career and shape your technological vision.
            </p>
            <a
              href="/share-story"
              className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-lg rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-900/40 transition-all duration-300 hover:scale-105"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-80 group-hover:h-80 opacity-10"></span>
              <span className="relative flex items-center">
                Submit Your Story
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;