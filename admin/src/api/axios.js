import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    // Only reject if explicitly success: false
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Operation failed'));
    }
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    // Handle 401 errors: Remove token but let components handle navigation
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      return Promise.reject(new Error('Session expired or unauthorized'));
    }

    // Standardize error format
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
);

export default instance;