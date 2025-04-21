import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return Promise.reject(new Error('No authentication token found'));
    }
    config.headers.Authorization = `Bearer ${token}`;
    
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    if (response.data?.success) {
      return response;
    }
    return Promise.reject(new Error(response.data?.message || 'Operation failed'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default instance;