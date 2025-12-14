// Lightweight base URL helper for server components and tests
// Falls back to localhost in non-browser/test contexts
export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  const env = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || process.env.URL
  if (env) {
    const hasProtocol = /^https?:\/\//i.test(env)
    return hasProtocol ? env : `https://${env}`
  }
  return 'http://localhost:3000'
}
