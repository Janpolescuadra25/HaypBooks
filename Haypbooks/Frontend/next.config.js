/**
 * Next.js config: during development proxy /api/* to backend (localhost:4000)
 * This ensures the browser treats API responses as same-origin and cookies
 * set by the backend are stored against the frontend origin (avoids SameSite cross-site issues).
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is active by default for this Next.js version; explicit setting removed
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // During development, proxy API requests to the local backend so cookies are same-origin
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return []
    return [
      // Map auth endpoints that the backend mounts under /auth (no /api prefix)
      {
        source: '/api/auth/:path*',
        destination: 'http://127.0.0.1:4000/api/auth/:path*',
      },
      // Default: preserve /api prefix when proxying to backend
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
