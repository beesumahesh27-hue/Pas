import axios from 'axios';

const baseURL = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env.VITE_API_BASE_URL || '') + '/api'
  : (process.env.VITE_API_BASE_URL || '') + '/api';

const api = axios.create({
  baseURL,
});

export default api;
