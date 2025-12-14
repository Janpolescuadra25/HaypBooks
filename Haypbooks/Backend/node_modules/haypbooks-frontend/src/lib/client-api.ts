// Minimal client-side fetch helper with JSON response typing
export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); msg = j?.error || msg } catch {}
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}
