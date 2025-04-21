import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://inventory-backend-a6hg.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
