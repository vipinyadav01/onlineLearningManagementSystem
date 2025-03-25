import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, LogOut, Settings, HardDrive, Code, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePic = async () => {
    if (!profilePic) return;

    const formData = new FormData();
    formData.append('file', profilePic);
    formData.append('upload_preset', 'Hostel');

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      const newPicUrl = res.data.secure_url;
      
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:5000/api/auth/me',
        { profilePic: newPicUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser({ ...user, profilePic: newPicUrl });
      setPreview(null);
      setProfilePic(null);
    } catch (error) {
      console.error('Error updating profile pic:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-teal-400 text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row p-4 md:p-8 gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50 h-fit">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400/80 to-cyan-500/80 p-1 shadow-lg mb-4">
              <img
                src={preview || user?.profilePic || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-slate-800"
              />
            </div>
            <label className="absolute bottom-2 right-2 bg-slate-800/90 p-2 rounded-full cursor-pointer hover:bg-slate-700/90 transition-all shadow-md">
              <Camera className="w-4 h-4 text-teal-400" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          
          <h2 className="text-xl font-bold text-white text-center">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          
          {preview && (
            <button
              onClick={handleUpdatePic}
              className="mt-4 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-500 hover:to-cyan-500 text-white py-2 px-6 rounded-xl font-medium transition-all text-sm"
            >
              Save Changes
            </button>
          )}
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'profile' ? 'bg-slate-800/50 text-teal-400' : 'text-slate-400 hover:bg-slate-800/30'}`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'projects' ? 'bg-slate-800/50 text-teal-400' : 'text-slate-400 hover:bg-slate-800/30'}`}
          >
            <HardDrive className="w-5 h-5" />
            <span>Projects</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'skills' ? 'bg-slate-800/50 text-teal-400' : 'text-slate-400 hover:bg-slate-800/30'}`}
          >
            <Code className="w-5 h-5" />
            <span>Skills</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'security' ? 'bg-slate-800/50 text-teal-400' : 'text-slate-400 hover:bg-slate-800/30'}`}
          >
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 text-white py-2.5 px-6 rounded-xl font-medium transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {activeTab === 'profile' && <User className="w-6 h-6 text-teal-400" />}
            {activeTab === 'projects' && <HardDrive className="w-6 h-6 text-teal-400" />}
            {activeTab === 'skills' && <Code className="w-6 h-6 text-teal-400" />}
            {activeTab === 'security' && <Shield className="w-6 h-6 text-teal-400" />}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <button className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400/80 text-sm">Full Name</label>
                    <p className="text-white font-medium mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-slate-400/80 text-sm">Email Address</label>
                    <p className="text-white font-medium mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-teal-400" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400/80 text-sm">Phone Number</label>
                    <p className="text-white font-medium mt-1">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <label className="text-slate-400/80 text-sm">Location</label>
                    <p className="text-white font-medium mt-1">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-400" />
                About Me
              </h3>
              <p className="text-slate-300">
                Senior Software Engineer with 8+ years of experience building scalable web applications. 
                Specialized in React, Node.js, and cloud architectures. Passionate about open-source 
                and mentoring junior developers.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((project) => (
              <div key={project} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30 hover:border-teal-400/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Project {project}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-teal-400/10 text-teal-400 rounded-full">Active</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-teal-400">React</span>
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-teal-400">Node.js</span>
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-teal-400">MongoDB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-medium text-white mb-4">Technical Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'GraphQL'].map((skill) => (
                  <div key={skill} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    <span className="text-white">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-medium text-white mb-4">Experience Level</h3>
              <div className="space-y-4">
                {[
                  { skill: 'React', level: 90 },
                  { skill: 'Node.js', level: 85 },
                  { skill: 'TypeScript', level: 80 },
                  { skill: 'AWS', level: 70 },
                ].map((item) => (
                  <div key={item.skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm">{item.skill}</span>
                      <span className="text-teal-400 text-sm">{item.level}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full" 
                        style={{ width: `${item.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-medium text-white mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Password</h4>
                    <p className="text-slate-400 text-sm">Last changed 3 months ago</p>
                  </div>
                  <button className="text-teal-400 hover:text-teal-300 text-sm font-medium">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Two-Factor Authentication</h4>
                    <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <button className="text-teal-400 hover:text-teal-300 text-sm font-medium">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-medium text-white mb-4">Active Sessions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white">MacBook Pro</h4>
                      <p className="text-slate-400 text-sm">San Francisco, CA • Now</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                    Log Out
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white">iPhone 13</h4>
                      <p className="text-slate-400 text-sm">New York, NY • 2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;