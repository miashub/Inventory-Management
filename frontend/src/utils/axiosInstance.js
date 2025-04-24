/**
 * Axios Instance – Configured HTTP client for API requests
 *
 * This instance is preconfigured to:
 * - Use a base URL from the environment variable (REACT_APP_API_BASE_URL)
 * - Send credentials (like cookies/session tokens) with each request (withCredentials: true)
 * - Use 'application/json' as the default Content-Type
 * - Automatically attach the CSRF token (from cookies) to all requests for CSRF protection
 *
 * This central configuration ensures consistent API behavior across the app and avoids 
 * repeating boilerplate settings for every request.
 *
 * Example Usage:
 *   import axios from './axiosInstance';
 *
 *   // Get all products
 *   axios.get('/api/products/');
 *
 *   // Get a product by ID
 *   axios.get(`/api/products/${id}/`);
 *
 *   // Get product details by barcode
 *   axios.get(`/api/products/barcode/${barcode}/`);
 *
 *   // Get product details with source = scan-from-add
 *   axios.get(`/api/products/barcode/${decodedText}/?source=scan-from-add`);
 *
 *   // Create a new product
 *   axios.post(`/api/products/?source=${source}`, productData);
 *
 *   // Get product logs
 *   axios.get('/api/logs/');
 */

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically include CSRF token in request headers for secure POST/PUT/DELETE
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
