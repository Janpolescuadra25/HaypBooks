export type AuditEvent = {
  id: string
  ts: string
  userId: string
  action: string
  entity: string
  entityId: string
  meta?: Record<string, unknown>
}

const store: AuditEvent[] = []

export function logEvent(e: Omit<AuditEvent, 'id' | 'ts'>) {
  const event: AuditEvent = { id: `ae_${Math.random().toString(36).slice(2,8)}`, ts: new Date().toISOString(), ...e }
  store.unshift(event)
  if (store.length > 200) store.pop()
}

export function getAuditEvents(filter?: { entity?: string; entityId?: string; start?: string; end?: string; limit?: number }) {
  const { entity, entityId, start, end, limit = 50 } = filter || {}
  let results = store
  if (entity) results = results.filter(r => r.entity === entity)
  if (entityId) results = results.filter(r => r.entityId === entityId)
  if (start) {
    const s = new Date(start + 'T00:00:00Z')
    if (!isNaN(s.valueOf())) results = results.filter(r => new Date(r.ts).getTime() >= s.getTime())
  }
  if (end) {
    const e = new Date(end + 'T23:59:59Z')
    if (!isNaN(e.valueOf())) results = results.filter(r => new Date(r.ts).getTime() <= e.getTime())
  }
  return results.slice(0, limit)
}
