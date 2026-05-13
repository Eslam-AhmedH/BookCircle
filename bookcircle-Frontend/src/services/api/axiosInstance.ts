import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5089'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor ───────────────────────────────────────────
// Automatically attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ──────────────────────────────────────────
// Handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config.url || '';

      if (status === 401) {
        // Don't redirect if the request is the login request itself
        if (!url.includes('/api/auth/login')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/') {
            window.location.href = '/'
          }
        } else {
          // Explicit login unauthorized message
          error.message = 'Invalid email or password.';
          return Promise.reject(error);
        }
      }

      // Extract specific error message from the backend API response
      const data = error.response.data;
      if (data) {
        if (data.message) {
          error.message = data.message;
        } else if (data.errors) {
          // Flatten ModelState errors (e.g. { "Title": ["Title is required"] })
          const errorValues = Object.values(data.errors) as string[][];
          if (errorValues.length > 0 && errorValues[0].length > 0) {
            error.message = errorValues[0][0];
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
