let cached: any | null = null
let inFlight: Promise<any> | null = null

export async function getProfileCached(): Promise<any | null> {
  if (cached) return cached
  if (inFlight) return inFlight
  inFlight = fetch('/api/user/profile', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(p => {
      cached = p
      return p
    })
    .finally(() => { inFlight = null })
  return inFlight
}

export function clearProfileCache() {
  cached = null
}
