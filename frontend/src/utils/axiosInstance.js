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
 * Base URL:
 *   https://inventory-backend-a6hg.onrender.com
 */

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
