/**
 * Axios Instance – Configured HTTP client for API requests
 *
 * This instance sets a base URL for all API requests and includes credentials
 * (like cookies) with each request. It also sets the default content type
 * to 'application/json' for proper request formatting.
 *
 * Usage:
 *   import axios from './axiosInstance';
 *   axios.get('/api/products/')
 *
 */
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF Token handling for production
instance.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default instance;