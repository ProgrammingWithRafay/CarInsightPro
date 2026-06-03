import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// if 401, redirect to login (but skip for auth-check requests to avoid redirect loops)
api.interceptors.response.use(
  res => res,
  err => {
    const isAuthCheck = err.config?.url?.includes('/auth/me');
    if (err.response?.status === 401 && !isAuthCheck && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
