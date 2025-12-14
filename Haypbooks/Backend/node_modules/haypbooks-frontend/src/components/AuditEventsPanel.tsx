"use client"

import { useEffect, useState } from 'react'

// Align with /api/audit response rows which are sourced from db.auditEvents
// Flexible shape to accommodate both older and newer audit structures
type AuditRow = {
  id: string
  ts: string
  actor?: string
  action: string
  entity?: string
  entityType?: string
  entityId: string
  meta?: Record<string, unknown>
  before?: unknown
  after?: unknown
}

import { formatDateTimeLocal } from '@/lib/date'

export default function AuditEventsPanel({ entity, entityId, title, limit, start, end }: { entity?: string; entityId?: string; title?: string; limit?: number; start?: string; end?: string }) {
  const [events, setEvents] = useState<AuditRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sp = new URLSearchParams()
    if (entity) sp.set('entity', entity)
    if (entityId) sp.set('entityId', entityId)
    if (limit) sp.set('limit', String(limit))
    if (start) sp.set('start', start)
    if (end) sp.set('end', end)
    setLoading(true)
    fetch(`/api/audit?${sp.toString()}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load audit events')
        const j = await r.json()
        const rows = Array.isArray(j?.rows) ? j.rows : (Array.isArray(j?.events) ? j.events : [])
        setEvents(rows)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [entity, entityId, limit, start, end])

  return (
    <div className="glass-card bg-white/70">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-slate-900">{title || 'Recent Activity'}</h3>
        {loading && <span className="text-xs text-slate-500">Loading…</span>}
      </div>
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-sm text-slate-600">No recent events</div>
      ) : (
        <ul className="space-y-1 text-sm text-slate-800">
          {events.slice(0, 10).map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3">
              <div>
                <span className="font-medium">{e.action}</span>
                {/* Show entity type for context when available */}
                {e.entityType && <span className="ml-1 rounded bg-slate-100 px-1.5 py-px text-[11px] text-slate-700 align-middle">{e.entityType}</span>}
                {e.meta && Object.keys(e.meta).length > 0 && (
                  <span className="text-slate-600"> — {summarizeMeta(e.meta)}</span>
                )}
              </div>
              <time className="shrink-0 tabular-nums text-slate-500" dateTime={e.ts}>{formatDateTimeLocal(e.ts)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function summarizeMeta(meta: Record<string, unknown>): string {
  try {
    const pairs = Object.entries(meta)
      .filter(([k]) => k !== 'before' && k !== 'after')
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${formatVal(v)}`)
    return pairs.join(', ')
  } catch {
    return ''
  }
}

function formatVal(v: unknown) {
  if (typeof v === 'number') return v.toString()
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return ''
}
