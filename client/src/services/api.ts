import axios from 'axios';

/**
 * Core Axios instance configured for all API requests.
 * 
 * Automatically attaches cookies (via withCredentials) to handle session/JWT auth.
 * Defaults to localhost:5000/api if no environment variable is provided.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

/**
 * Global response interceptor for centralized error handling.
 * 
 * Specifically watches for 401 Unauthorized errors indicating an expired or missing token.
 * Automatically redirects the user to the login page, except during initial auth checks
 * (to prevent redirect loops) or if they are already on the login page.
 */
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
