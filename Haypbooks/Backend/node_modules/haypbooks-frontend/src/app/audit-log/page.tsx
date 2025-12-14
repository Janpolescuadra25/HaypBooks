"use client"
import { useEffect, useState } from 'react'
import { formatDateTimeLocal } from '@/lib/date'

interface AuditRow {
  id: string
  ts: string
  actor?: string
  action: string
  entityType?: string
  entityId?: string
  meta?: Record<string, any>
}

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [actor, setActor] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)

  function buildQuery(reset = false) {
    const sp = new URLSearchParams()
    if (entity) sp.set('entity', entity)
    if (action) sp.set('action', action)
    if (actor) sp.set('actor', actor)
    if (start) sp.set('start', start)
    if (end) sp.set('end', end)
    sp.set('limit', '25')
    if (!reset && cursor) sp.set('cursor', cursor)
    return sp.toString()
  }

  function load(reset = false) {
    if (reset) {
      setCursor(undefined)
      setRows([])
    }
    setLoading(true)
    fetch('/api/audit?' + buildQuery(reset), { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error(`Failed (${r.status})`)
        const j = await r.json()
        setNextCursor(j.nextCursor)
        if (reset) setRows(j.rows)
        else setRows(prev => [...prev, ...j.rows])
        setError(null)
      })
      .catch(e => setError(e.message))
      .finally(()=> setLoading(false))
  }

  // We intentionally load only once on mount. Subsequent loads are driven by user actions (Apply/Load More).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(true) }, [])

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <h1 className="text-lg font-semibold">Audit Log</h1>
        <div className="grid md:grid-cols-6 gap-2 text-sm">
          <input className="input" placeholder="Entity (invoice,bill,journal,customer,vendor)" value={entity} onChange={e=>setEntity(e.target.value)} />
          <input className="input" placeholder="Action" value={action} onChange={e=>setAction(e.target.value)} />
          <input className="input" placeholder="Actor" value={actor} onChange={e=>setActor(e.target.value)} />
          <input className="input" aria-label="Start date" type="date" value={start} onChange={e=>setStart(e.target.value)} />
          <input className="input" aria-label="End date" type="date" value={end} onChange={e=>setEnd(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={()=>load(true)} className="btn btn-primary flex-1">Apply</button>
            <button onClick={()=>{ setEntity(''); setAction(''); setActor(''); setStart(''); setEnd(''); load(true) }} className="btn flex-1">Reset</button>
          </div>
        </div>
      </div>
      <div className="glass-card p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-2 py-1 text-left">Timestamp</th>
              <th className="px-2 py-1 text-left">Actor</th>
              <th className="px-2 py-1 text-left">Action</th>
              <th className="px-2 py-1 text-left">Entity</th>
              <th className="px-2 py-1 text-left">Entity ID</th>
              <th className="px-2 py-1 text-left">Meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-3 py-4 text-center text-slate-500">No events</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-2 py-1 tabular-nums whitespace-nowrap">{formatDateTimeLocal(r.ts)}</td>
                <td className="px-2 py-1">{r.actor || '—'}</td>
                <td className="px-2 py-1 font-medium">{r.action}</td>
                <td className="px-2 py-1">{r.entityType || '—'}</td>
                <td className="px-2 py-1 font-mono text-xs">{r.entityId || ''}</td>
                <td className="px-2 py-1 text-slate-600 max-w-xs truncate">{formatMeta(r.meta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 flex items-center gap-3">
          {error && <span className="text-red-600 text-sm">{error}</span>}
          {loading && <span className="text-slate-500 text-xs">Loading…</span>}
          {!loading && nextCursor && (
            <button className="btn btn-sm" onClick={()=>{ setCursor(nextCursor); load(false) }}>Load More</button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatMeta(meta?: Record<string, any>) {
  if (!meta) return ''
  const keys = Object.keys(meta)
  if (keys.length === 0) return ''
  return keys.slice(0,3).map(k => `${k}:${short(meta[k])}`).join(' | ')
}
function short(v: any) {
  if (v == null) return ''
  if (typeof v === 'string') return v.slice(0,30)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
