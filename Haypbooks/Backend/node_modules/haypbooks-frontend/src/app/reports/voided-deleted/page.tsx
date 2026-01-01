"use client"
import React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { formatDateTimeLocal } from '@/lib/date'

function todayIso() { return new Date().toISOString().slice(0,10) }

function matchesVoidedOrDeleted(action: string): boolean {
  if (!action) return false
  const a = action.toLowerCase()
  return a === 'delete' || a.includes('delete') || a === 'void' || a.includes(':void') || a === 'invoice:payment-void' || a === 'deposit:void'
}

export default function VoidedDeletedReportPage() {
  const sp = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [start, setStart] = React.useState(sp.get('start') || '')
  const [end, setEnd] = React.useState(sp.get('end') || todayIso())
  const [rows, setRows] = React.useState<any[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()

  React.useEffect(() => {
    setStart(sp.get('start') || '')
    setEnd(sp.get('end') || todayIso())
  }, [sp])

  const updateQuery = (nextStart: string, nextEnd: string) => {
    const q = new URLSearchParams(sp.toString())
    nextStart ? q.set('start', nextStart) : q.delete('start')
    nextEnd ? q.set('end', nextEnd) : q.delete('end')
    const qs = q.toString()
    router.replace((qs ? `${pathname}?${qs}` : pathname) as any)
  }

  const load = React.useCallback(async () => {
    setBusy(true); setError(undefined)
    try {
      const q = new URLSearchParams()
      if (start) q.set('start', start)
      if (end) q.set('end', end)
      q.set('limit', '10000')
      const res = await fetch(`/api/audit?${q.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      const all: any[] = Array.isArray(data?.rows) ? data.rows : []
      const filtered = all.filter((r) => matchesVoidedOrDeleted(String(r.action||'')))
      setRows(filtered)
    } catch (e: any) {
      setError(String(e?.message || 'Failed'))
    } finally { setBusy(false) }
  }, [start, end])

  React.useEffect(()=>{ load() }, [load])

  function exportCsv() {
    const header = ['ts','actor','action','entityType','entityId','meta']
    const csv = [header.join(',')]
    for (const r of rows) {
      const meta = r.meta ? JSON.stringify(r.meta) : ''
      const line = [r.ts, r.actor || '', r.action || '', r.entityType || '', r.entityId || '', meta]
        .map(v => typeof v === 'string' && /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : String(v ?? ''))
        .join(',')
      csv.push(line)
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voided_deleted_${(start||'begin')}_${(end||todayIso())}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h1 className="text-xl font-semibold">Voided & Deleted Transactions</h1>
        <p className="text-slate-600 text-sm mt-1">Shows void and delete activity across the ledger, filtered by date. Exports are built from JSON.</p>
        <div className="mt-3 flex items-end gap-3">
          <label className="flex flex-col text-sm">
            <span className="text-slate-600 mb-1">Start</span>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={start} onChange={(e)=>{ setStart(e.target.value); updateQuery(e.target.value, end) }} />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-600 mb-1">End</span>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={end} onChange={(e)=>{ setEnd(e.target.value); updateQuery(start, e.target.value) }} />
          </label>
          <button type="button" onClick={load} className="rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-white" disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
          <button type="button" onClick={exportCsv} className="rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-white" disabled={busy || rows.length===0}>Export CSV</button>
        </div>
      </div>
      <div className="glass-card p-0 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="p-2">When</th>
              <th className="p-2">Action</th>
              <th className="p-2">Entity</th>
              <th className="p-2">ID</th>
              <th className="p-2">Actor</th>
              <th className="p-2">Meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 whitespace-nowrap">{formatDateTimeLocal(r.ts)}</td>
                <td className="p-2 font-medium">{r.action}</td>
                <td className="p-2">{r.entityType}</td>
                <td className="p-2 font-mono text-xs">{r.entityId}</td>
                <td className="p-2">{r.actor || ''}</td>
                <td className="p-2 text-xs text-slate-600">{r.meta ? JSON.stringify(r.meta) : ''}</td>
              </tr>
            ))}
            {rows.length === 0 && !busy && (
              <tr><td className="p-3 text-slate-600" colSpan={6}>No voided or deleted activity for the selected range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
