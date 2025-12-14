import { mockApi } from '@/lib/mock-api'

/**
 * Unified API client. In development, if NEXT_PUBLIC_USE_MOCK_API==='true' on the browser,
 * requests are served from the in-process mock layer (Mock Backend First).
 * On the server (SSR/route handlers) or when disabled, falls back to real fetch.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const useMock = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
  if (useMock) {
    return mockApi<T>(path, init)
  }
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}
