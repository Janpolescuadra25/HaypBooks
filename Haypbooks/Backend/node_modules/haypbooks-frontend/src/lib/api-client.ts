import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend API base URL.
// In development we prefer a same-origin proxy (Next.js rewrites) so leave empty by default
// and set NEXT_PUBLIC_API_URL when pointing to a remote backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  // Prevent hanging UI by failing fast on slow/unreachable backends
  timeout: 15000,
});

// Request interceptor - attach JWT from localStorage if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      // Try refreshing the session using HTTP-only refresh cookie
      return apiClient.post('/api/auth/refresh')
        .then((res) => {
          if (typeof window !== 'undefined') {
            if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user))
          }
          // Retry original request
          return apiClient(originalRequest)
        })
        .catch(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
          return Promise.reject(error)
        })
    }

    if (error.response?.status === 401) {
      // Already retried or refresh isn't available — fail and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
);

export default apiClient;
