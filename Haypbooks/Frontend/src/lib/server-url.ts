import { headers } from 'next/headers'

// Server-only: Build an absolute base URL for SSR fetch calls
// In non-request contexts (tests, SSG), fall back to env or localhost to avoid headers() errors
export function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
    if (host) return `${proto}://${host}`
  } catch {
    // Not in a request scope – fall through to env/defaults
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (env) return env
  return 'http://localhost:3000'
}
