import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Camera, Plus } from 'lucide-react';
import axios from 'axios';

const AdminCourses = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    instructorTitle: '',
    instructorBio: '',
    duration: '',
    lastUpdated: '',
    level: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    tags: '',
    isBestseller: false,
    isNew: false,
    whatYouWillLearn: '',
    prerequisites: '',
    curriculum: '[]',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState('basic');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'image' && formData[key]) {
        data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/courses`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        navigate('/'); 
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError(err.response?.data?.message || 'Failed to create course');
      console.error('Course creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'content', label: 'Course Content' },
    { id: 'media', label: 'Media' },
  ];

  const renderFormSection = () => {
    switch (currentSection) {
      case 'basic':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Category*</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                rows="4"
                required
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  placeholder="e.g. 8 hours"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleChange}
                  className="h-5 w-5 border-gray-300 rounded focus:ring-blue-500 accent-blue-500"
                  disabled={loading}
                />
                <span className="text-gray-800 text-lg">Bestseller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="h-5 w-5 border-gray-300 rounded focus:ring-blue-500 accent-blue-500"
                  disabled={loading}
                />
                <span className="text-gray-800 text-lg">New</span>
              </label>
            </div>
          </>
        );
      case 'instructor':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Instructor Name*</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Instructor Title</label>
              <input
                type="text"
                name="instructorTitle"
                value={formData.instructorTitle}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                placeholder="e.g. Senior Developer"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Instructor Bio</label>
              <textarea
                name="instructorBio"
                value={formData.instructorBio}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                rows="4"
                disabled={loading}
              />
            </div>
          </>
        );
      case 'pricing':
        return (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Price ($)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  required
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Original Price ($)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                  disabled={loading}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Last Updated</label>
              <input
                type="date"
                name="lastUpdated"
                value={formData.lastUpdated}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </>
        );
      case 'content':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">What You'll Learn (comma-separated)</label>
              <textarea
                name="whatYouWillLearn"
                value={formData.whatYouWillLearn}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                rows="3"
                placeholder="e.g. React basics, State management, API integration"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Prerequisites (comma-separated)</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                rows="3"
                placeholder="e.g. Basic HTML, CSS knowledge, JavaScript fundamentals"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500"
                placeholder="e.g. development, programming, web"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Curriculum (JSON format)</label>
              <textarea
                name="curriculum"
                value={formData.curriculum}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-black focus:outline-none focus:border-2 focus:border-blue-500 font-mono"
                rows="6"
                placeholder='[{"section": "Introduction", "lectures": 3, "duration": "1 hour", "content": [{"title": "Welcome", "duration": "10:00", "isFree": true}]}]'
                disabled={loading}
              />
            </div>
          </>
        );
      case 'media':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Course Image</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all">
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                disabled={loading}
              />
              {preview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                  <p className="mt-4 text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-blue-500" />
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-800">
                  <Camera className="w-16 h-16 mb-4 text-blue-500" />
                  <p className="text-xl font-medium">Upload Course Image</p>
                  <p className="text-sm mt-2 text-gray-600">Click or drag and drop an image file</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl p-6 md:p-8 shadow-md">
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Book className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Course
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-white border-2 border-red-500 rounded-xl text-red-600 text-sm animate-pulse">
            {error}
          </div>
        )}

        <div className="mb-8">
          <ul className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setCurrentSection(section.id)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    currentSection === section.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white text-gray-800 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormSection()}

          <div className="border-t border-gray-200 pt-6 mt-8 flex justify-between">
            {currentSection !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  setCurrentSection(sections[currentIndex - 1].id);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto flex gap-4">
              {currentSection !== 'media' ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === currentSection);
                    setCurrentSection(sections[currentIndex + 1].id);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-red-600 text-white rounded-lg font-medium transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    {loading ? 'Creating...' : 'Create Course'}
                  </div>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCourses;