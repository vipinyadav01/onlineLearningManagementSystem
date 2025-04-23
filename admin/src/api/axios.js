import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Role': 'admin'
  }
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (config.requiresAuth !== false) {
      // Only reject if authentication is required for this request
      return Promise.reject(new Error('No authentication token found'));
    }
    
    // Handle FormData correctly
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    console.log('Sending request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      hasToken: !!adminToken
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
    }
    return Promise.reject(error);
  }
);

export default api;