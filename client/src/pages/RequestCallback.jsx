import { useState, useEffect } from 'react';
import { Phone, Mail, User, Clock, MessageSquare, CheckCircle } from 'lucide-react';

const RequestCallback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState('');
  const [messageInterval, setMessageInterval] = useState(null);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [messageInterval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult("Preparing your request...");
    const progressMessages = [
      "Initializing request...",
      "Encrypting your data...",
      "Connecting to our servers..."
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < progressMessages.length) {
        setResult(progressMessages[messageIndex]);
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    setMessageInterval(interval);
    
    try {
      // Create object instead of FormData
      const dataToSubmit = {
        access_key: "3eecb045-7326-4d75-b72b-a939051dc170",
        subject: "New Callback Request from TechBits Website",
        from_name: "TechBits Website",
        reply_to: formData.email,
        ...formData,
        botcheck: ""
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(dataToSubmit)
      });

      const data = await response.json();
      
      if (messageInterval) {
        clearInterval(messageInterval);
      }

      if (data.success) {
        setResult("Success! Preparing your confirmation...");
        setTimeout(() => {
          setIsSuccess(true);
          setFormData({
            name: '',
            email: '',
            phone: '',
            preferredTime: '',
            message: ''
          });
        }, 800);
      } else {
        console.error("Error submitting form:", data);
        setResult(data.message || "⚠️ Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setResult("⚠️ Connection issue. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent mb-2">
            Request a Callback
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Our TechBits consultants will call you back at your preferred time to discuss your technical needs.
          </p>
        </div>

        {/* Form */}
        {!isSuccess ? (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-teal-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent"
                    placeholder="Full Name"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-teal-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent"
                    placeholder="Email Address"
                  />
                </div>

                {/* Phone Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-teal-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent"
                    placeholder="Phone Number"
                  />
                </div>

                {/* Preferred Time Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-teal-400" />
                  </div>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent appearance-none"
                  >
                    <option value="">Preferred Callback Time</option>
                    <option value="morning">Morning (9AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 4PM)</option>
                    <option value="evening">Evening (4PM - 7PM)</option>
                  </select>
                </div>
              </div>

              {/* Message Field */}
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <MessageSquare className="h-5 w-5 text-teal-400" />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent"
                  placeholder="Any specific technologies or services you'd like to discuss?"
                />
              </div>

              {/* Hidden Web3Forms Honeypot Field (spam protection) */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-500 hover:to-cyan-500 text-white py-3.5 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-teal-500/20 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Request Callback
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              {/* Form submission status message */}
              {result && !isSuccess && (
                <div className="mt-3 text-center">
                  <p className="text-teal-400">{result}</p>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* Success Message */
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-400/20 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-500/20 mb-4">
              <CheckCircle className="h-8 w-8 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-slate-400 mb-6">
              Thank you for contacting TechBits. Our technical team will contact you at your preferred time. Typically we respond within 24 hours.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-teal-500/20"
            >
              Submit Another Request
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 mb-4">
              <Clock className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">24/7 Support</h3>
            <p className="text-slate-400 text-sm">
              Our TechBits support team is available round the clock to assist you with any technical queries.
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 mb-4">
              <User className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Expert Guidance</h3>
            <p className="text-slate-400 text-sm">
              Get personalized technical solutions from our certified TechBits specialists.
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 mb-4">
              <Phone className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Quick Response</h3>
            <p className="text-slate-400 text-sm">
              TechBits guarantees a callback within your specified time window for efficient service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCallback;