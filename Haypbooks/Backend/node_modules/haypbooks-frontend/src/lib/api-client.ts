import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend API base URL.
// In development we prefer a same-origin proxy (Next.js rewrites) so leave empty by default
// and set NEXT_PUBLIC_API_URL when pointing to a remote backend.
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
// Allow E2E tests to override API base at runtime via `window.__API_BASE_URL` when set
if (typeof window !== 'undefined' && (window as any).__API_BASE_URL !== undefined) {
  API_BASE_URL = (window as any).__API_BASE_URL || ''
}

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

// Request interceptor — ensure all requests go through the /api proxy.
// Many components use paths like `/companies/...` without the `/api/` prefix;
// the Next.js rewrite rule only matches `/api/:path*`, so we normalise here.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url && !config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      config.url = '/api' + (config.url.startsWith('/') ? '' : '/') + config.url;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
let refreshInProgress: Promise<any> | null = null
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // Helpful diagnostic: if backend returned HTML (Next.js fallback or 404 page),
    // surface a concise message explaining the likely routing misconfiguration.
    const contentType = error?.response?.headers?.['content-type'] || ''
    const bodyIsHtml = typeof error?.response?.data === 'string' && /<\!doctype html>|<html/i.test(error.response.data)
    if (contentType.includes('text/html') || bodyIsHtml) {
      const requestedUrl = originalRequest?.url || originalRequest?.baseURL || 'unknown'
      const msg = `API routing error: received HTML response for request to ${requestedUrl}. This usually means NEXT_PUBLIC_API_URL or Next rewrites are misconfigured and the request reached the Next server instead of the API backend.`
      console.error(msg)
      // Wrap and rethrow a clearer error so UI can show actionable advice
      const wrapped: any = new Error(msg)
      wrapped.original = error
      return Promise.reject(wrapped)
    }

    // Handle 401s with a single refresh attempt in flight to avoid flooding the backend
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const originalUrl = originalRequest?.url || originalRequest?.baseURL || ''
      // Don't attempt a global refresh for auth endpoints (login/send-verification/refresh) - let the caller handle failures
      const isAuthEndpoint = /\/api\/auth\//.test(originalUrl)
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      if (!refreshInProgress) {
        // Start a single refresh request for the app
        refreshInProgress = apiClient.post('/api/auth/refresh', {}, { withCredentials: true })
          .then((res) => {
            if (typeof window !== 'undefined') {
              if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user))
            }
            return res
          })
          .catch((err) => {
            // On refresh failure, clear local user and bubble the error
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user')
            }
            throw err
          })
          .finally(() => { refreshInProgress = null })
      }

      // Wait for the in-flight refresh (or its failure)
      return refreshInProgress
        .then(() => apiClient(originalRequest))
        .catch((err) => {
          // If refresh failed, redirect to login (or let caller handle it)
          if (typeof window !== 'undefined') {
            // Don't redirect if we're already on a public path; let UI surface an error
            const currentPath = window.location.pathname + window.location.search
            const isPublicPath = currentPath.startsWith('/login') || currentPath.startsWith('/signup') || currentPath.startsWith('/landing')
            if (!isPublicPath) window.location.href = `/login?next=${encodeURIComponent(currentPath)}`
          }
          return Promise.reject(err)
        })
    }

    if (error.response?.status === 401) {
      // Already retried or refresh isn't available — fail and redirect
      const originalUrl = originalRequest?.url || originalRequest?.baseURL || ''
      const isAuthEndpoint = /\/api\/auth\//.test(originalUrl)
      if (isAuthEndpoint) {
        // Let the caller handle auth endpoint failures (e.g., login page should show a verification/resend UI)
        return Promise.reject(error)
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        // Preserve current path so user returns after re-login
        const currentPath = window.location.pathname + window.location.search
        const isPublicPath = currentPath.startsWith('/login') || 
                            currentPath.startsWith('/signup') ||
                            currentPath.startsWith('/landing')
        if (isPublicPath) {
          window.location.href = '/login'
        } else {
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}`
        }
      }
    }

    return Promise.reject(error)
  }
);

export default apiClient;
