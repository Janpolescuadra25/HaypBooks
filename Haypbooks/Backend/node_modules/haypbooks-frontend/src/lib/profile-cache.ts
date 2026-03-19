import apiClient from './api-client'

let cached: any | null = null
let inFlight: Promise<any> | null = null

export async function getProfileCached(): Promise<any | null> {
  if (cached) return cached
  if (inFlight) return inFlight
  inFlight = apiClient.get('/api/users/me')
    .then(r => r.data)
    .then(p => {
      cached = p
      return p
    })
    .catch(() => null)
    .finally(() => { inFlight = null })
  return inFlight
}

export function clearProfileCache() {
  cached = null
}
