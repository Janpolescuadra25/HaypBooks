"use client"
import { useState } from 'react'

type Props = {
  customerId: string
  defaultAsOf?: string
  defaultStart?: string | null
  canSend: boolean
}

export function SendStatementClient({ customerId, defaultAsOf, defaultStart, canSend }: Props) {
  const [asOf, setAsOf] = useState<string>(defaultAsOf || new Date().toISOString().slice(0,10))
  const [start, setStart] = useState<string>(defaultStart || '')
  const [type, setType] = useState<'summary'|'detail'>('summary')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle'|'queued'|'error'>('idle')
  const [messageId, setMessageId] = useState<string>('')

  async function send() {
    setLoading(true)
    setStatus('idle')
    setMessageId('')
    try {
      const body: any = { asOf, type }
      if (start) body.start = start
      const res = await fetch(`/api/customers/${encodeURIComponent(customerId)}/statement/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        setStatus('error')
        return
      }
      const json = await res.json()
      const msgId = json?.result?.messageId || json?.messageId || ''
      setMessageId(msgId)
      setStatus('queued')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-medium text-slate-800">Send statement</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-600 flex flex-col">
          As of
          <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
        </label>
        <label className="text-xs text-slate-600 flex flex-col">
          Start (optional)
          <input type="date" value={start} onChange={e => setStart(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
        </label>
        <label className="text-xs text-slate-600 flex flex-col">
          Type
          <select value={type} onChange={e => setType(e.target.value as any)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">
            <option value="summary">Summary</option>
            <option value="detail">Detail</option>
          </select>
        </label>
        <button
          type="button"
          onClick={send}
          disabled={loading || !canSend}
          className="btn-secondary disabled:opacity-50"
          title={!canSend ? 'Requires permission to send statements' : undefined}
        >{loading ? 'Queueing…' : 'Send statement'}</button>
        {status === 'queued' && (
          <span className="text-xs text-emerald-700">Queued{messageId ? ` • ${messageId}` : ''}</span>
        )}
        {status === 'error' && (
          <span className="text-xs text-rose-700">Error sending</span>
        )}
      </div>
    </div>
  )
}
