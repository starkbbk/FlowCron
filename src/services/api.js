import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let clerkGetToken = null;

export const setClerkGetToken = (fn) => {
  clerkGetToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (clerkGetToken) {
    try {
      const token = await clerkGetToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error fetching Clerk token:', err);
    }
  } else {
    const token = localStorage.getItem('flowcron_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flowcron_token')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
