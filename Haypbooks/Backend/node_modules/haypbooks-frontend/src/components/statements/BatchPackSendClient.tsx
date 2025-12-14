"use client"
import { useState } from 'react'

export function BatchPackSendClient() {
  const [asOf, setAsOf] = useState<string>(new Date().toISOString().slice(0,10))
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [lastBatchId, setLastBatchId] = useState<string>('')
  const [itemsCount, setItemsCount] = useState<number>(0)

  async function sendBatch() {
    setLoading(true); setStatus('')
    try {
      const res = await fetch(`/api/customers/statements/pack/send?asOf=${asOf}`, { method: 'POST' })
      if (!res.ok) {
        setStatus(`Error ${res.status}`)
      } else {
        const json = await res.json()
        setLastBatchId(json.result.batchId)
        setItemsCount(json.result.count)
        setStatus('Queued')
      }
    } catch (e: any) {
      setStatus('Network error')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 flex-wrap">
        <label className="text-sm flex flex-col">As of
          <input
            type="date"
            value={asOf}
            onChange={e => setAsOf(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:bg-neutral-900 dark:border-neutral-700 dark:text-slate-100"
          />
        </label>
        <button onClick={sendBatch} disabled={loading} className="px-3 py-1 rounded bg-sky-600 text-white text-sm disabled:opacity-50">{loading ? 'Queueing…' : 'Batch Send All'}</button>
        {status && <span className="text-xs text-neutral-400">{status}{status === 'Queued' && ` • Batch ${lastBatchId} (${itemsCount})`}</span>}
      </div>
      {lastBatchId && <BatchAuditPreview batchId={lastBatchId} />}
    </div>
  )
}

function BatchAuditPreview({ batchId }: { batchId: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  async function load() {
    const res = await fetch(`/api/customers/statements/pack/audit?batchId=${batchId}`)
    if (res.ok) {
      const json = await res.json()
      setEvents(json.events || [])
      setChildren(json.children || [])
      setLoaded(true)
    }
  }
  return (
    <div className="border border-neutral-800 rounded p-2">
      <div className="flex items-center justify-between mb-1">
        <strong className="text-xs">Batch Audit Snapshot</strong>
        <button onClick={load} className="text-xs text-sky-500 hover:underline">{loaded ? 'Reload' : 'Load'}</button>
      </div>
      {loaded && (
        <div className="space-y-1">
          {events.map(e => (
            <div key={e.id} className="text-xs text-neutral-400">Wrapper: {e.after?.count} statements queued at {(e.ts || '').replace('T',' ').slice(0,19)}</div>
          ))}
          {children.slice(0,5).map(c => (
            <div key={c.id} className="text-xs text-neutral-500">Cust {c.entityId} queued</div>
          ))}
          {children.length > 5 && <div className="text-[10px] text-neutral-600">… {children.length - 5} more</div>}
        </div>
      )}
    </div>
  )
}
