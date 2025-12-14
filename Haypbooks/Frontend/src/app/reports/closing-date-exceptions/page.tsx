"use client"
import React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { formatDateTimeLocal } from '@/lib/date'
import ClosedThroughBanner from '@/components/ClosedThroughBanner'

function todayIso() { return new Date().toISOString().slice(0,10) }

export default function ClosingDateExceptionsPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [start, setStart] = React.useState(sp.get('start') || '')
  const [end, setEnd] = React.useState(sp.get('end') || todayIso())
  const [boundary, setBoundary] = React.useState(sp.get('boundary') || '')
  const [rows, setRows] = React.useState<any[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()

  React.useEffect(() => {
    setStart(sp.get('start') || '')
    setEnd(sp.get('end') || todayIso())
    setBoundary(sp.get('boundary') || '')
  }, [sp])

  const updateQuery = (nextStart: string, nextEnd: string, nextBoundary: string) => {
    const q = new URLSearchParams(sp.toString())
    nextStart ? q.set('start', nextStart) : q.delete('start')
    nextEnd ? q.set('end', nextEnd) : q.delete('end')
    nextBoundary ? q.set('boundary', nextBoundary) : q.delete('boundary')
    const qs = q.toString()
    router.replace((qs ? `${pathname}?${qs}` : pathname) as any)
  }

  const load = React.useCallback(async () => {
    setBusy(true); setError(undefined)
    try {
      const q = new URLSearchParams()
      if (start) q.set('start', start)
      if (end) q.set('end', end)
      if (boundary) q.set('boundary', boundary)
      q.set('limit', '5000')
      const res = await fetch(`/api/reports/closing-date-exceptions?${q.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setRows(Array.isArray(data?.rows) ? data.rows : [])
      if (!boundary && data?.boundary) setBoundary(data.boundary)
    } catch (e: any) {
      setError(String(e?.message || 'Failed'))
    } finally { setBusy(false) }
  }, [start, end, boundary])

  React.useEffect(()=>{ load() }, [load])

  function exportCsv() {
    const header = ['ts','actor','action','entityType','entityId','entityDate','fieldsChanged','amountDelta']
    const csv = [header.join(',')]
    for (const r of rows) {
      const line = [r.ts, r.actor || '', r.action || '', r.entityType || '', r.entityId || '', r.entityDate || '', (Array.isArray(r.fieldsChanged)?r.fieldsChanged.join('|'):''), String(r.amountDelta ?? '')]
        .map(v => typeof v === 'string' && /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : String(v ?? ''))
        .join(',')
      csv.push(line)
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const token = todayIso()
    a.download = `closing-date-exceptions_${token}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h1 className="text-xl font-semibold">Closing Date Exceptions</h1>
        <p className="text-slate-600 text-sm mt-1">Shows audit events that affect records dated on or before the closing date. Exports are JSON-first.</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
          <label className="flex flex-col text-sm">
            <span className="text-slate-600 mb-1">Event start</span>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={start} onChange={(e)=>{ setStart(e.target.value); updateQuery(e.target.value, end, boundary) }} />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-600 mb-1">Event end</span>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={end} onChange={(e)=>{ setEnd(e.target.value); updateQuery(start, e.target.value, boundary) }} />
          </label>
          <label className="flex flex-col text-sm md:col-span-2">
            <span className="text-slate-600 mb-1">Closing date (boundary)</span>
            <input type="date" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1" value={boundary} onChange={(e)=>{ setBoundary(e.target.value); updateQuery(start, end, e.target.value) }} placeholder="Auto from settings" />
          </label>
          <div className="md:col-span-3 flex items-end gap-2">
            <button type="button" onClick={load} className="rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-white" disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
            <button type="button" onClick={exportCsv} className="rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-white" disabled={busy || rows.length===0}>Export CSV</button>
          </div>
        </div>
        <div className="mt-2">
          <ClosedThroughBanner date={boundary || ''} onSuggestNextOpenDate={()=>{}} />
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
              <th className="p-2">Record date</th>
              <th className="p-2">Fields changed</th>
              <th className="p-2">Amount Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 whitespace-nowrap">{formatDateTimeLocal(r.ts)}</td>
                <td className="p-2 font-medium">{r.action}</td>
                <td className="p-2">{r.entityType}</td>
                <td className="p-2 font-mono text-xs">{r.entityId}</td>
                <td className="p-2 whitespace-nowrap">{r.entityDate}</td>
                <td className="p-2 text-xs text-slate-700">{Array.isArray(r.fieldsChanged) ? r.fieldsChanged.join(', ') : ''}</td>
                <td className="p-2 text-right tabular-nums">{typeof r.amountDelta === 'number' ? r.amountDelta.toFixed(2) : ''}</td>
              </tr>
            ))}
            {rows.length === 0 && !busy && (
              <tr><td className="p-3 text-slate-600" colSpan={7}>No exceptions for the selected settings.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
