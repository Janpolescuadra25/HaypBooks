"use client"
export type MinimizedItem = {
  id: string
  label: string
  icon: 'grid' | 'widgets' | 'doc' | 'form'
  color: 'teal' | 'indigo' | 'slate' | 'sky' | 'rose'
  dirty?: boolean
  route: string
  ts?: number
}

export const MIN_STORE_KEY = 'hb.minimized.items.v1'
export const MIN_INTENT_KEY = 'hb.minimized.intent.v1'

export function readMinimized(): MinimizedItem[] {
  try {
    const raw = localStorage.getItem(MIN_STORE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function writeMinimized(items: MinimizedItem[]) {
  try { localStorage.setItem(MIN_STORE_KEY, JSON.stringify(items)) } catch {}
}

export function upsertMinimized(item: MinimizedItem) {
  const cur = readMinimized()
  const idx = cur.findIndex(i => i.id === item.id)
  const withTs = { ...item, ts: Date.now() }
  if (idx >= 0) cur[idx] = { ...cur[idx], ...withTs }
  else cur.push(withTs)
  writeMinimized(cur)
}

export function removeMinimized(id: string) {
  writeMinimized(readMinimized().filter(i => i.id !== id))
}

export function setRestoreIntent(id: string, route: string) {
  try { localStorage.setItem(MIN_INTENT_KEY, JSON.stringify({ id, route, ts: Date.now() })) } catch {}
}

export function consumeRestoreIntent(maxAgeMs = 10000): { id: string } | null {
  try {
    const raw = localStorage.getItem(MIN_INTENT_KEY)
    if (!raw) return null
    const intent = JSON.parse(raw) as { id?: string; route?: string; ts?: number }
    if (!intent?.id) return null
    if (intent.ts && Date.now() - intent.ts > maxAgeMs) return null
    localStorage.removeItem(MIN_INTENT_KEY)
    return { id: intent.id }
  } catch {
    return null
  }
}

export function dispatchRestore(id: string) {
  try {
    window.dispatchEvent(new CustomEvent('hb:minimized:restore', { detail: { id } }))
  } catch {}
}

export function addRestoreListener(cb: (id: string) => void) {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { id?: string } | undefined
    if (detail?.id) cb(detail.id)
  }
  window.addEventListener('hb:minimized:restore', handler as EventListener)
  return () => window.removeEventListener('hb:minimized:restore', handler as EventListener)
}
