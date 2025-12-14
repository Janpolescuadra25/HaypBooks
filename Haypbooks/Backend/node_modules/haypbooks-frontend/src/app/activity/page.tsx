"use client"
import AuditEventsPanel from '@/components/AuditEventsPanel'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

export default function ActivityHubPage() {
  return (
    <Suspense fallback={<div className="glass-card">Loading…</div>}>
      <ActivityHubInner />
    </Suspense>
  )
}

function ActivityHubInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  // Use native date pickers with ISO values (YYYY-MM-DD)
  const [start, setStart] = useState<string>(searchParams.get('start') || '')
  const [end, setEnd] = useState<string>(searchParams.get('end') || '')
  const entity = useMemo(() => searchParams.get('entity') || '', [searchParams])
  const [action, setAction] = useState<string>(searchParams.get('action') || '')

  useEffect(() => {
    setStart(searchParams.get('start') || '')
    setEnd(searchParams.get('end') || '')
    setAction(searchParams.get('action') || '')
  }, [searchParams])

  const updateQuery = (nextStart: string, nextEnd: string, nextAction: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (nextStart) sp.set('start', nextStart); else sp.delete('start')
    if (nextEnd) sp.set('end', nextEnd); else sp.delete('end')
    if (nextAction) sp.set('action', nextAction); else sp.delete('action')
    const qs = sp.toString()
    const href = (qs ? `${pathname}?${qs}` : pathname) as Route
    router.replace(href)
  }

  const onStartChange = (v: string) => {
    setStart(v)
    updateQuery(v, end, action)
  }
  const onEndChange = (v: string) => {
    setEnd(v)
    updateQuery(start, v, action)
  }
  const onActionChange = (v: string) => {
    setAction(v)
    updateQuery(start, end, v)
  }

  const heading = entity ? `${entity.toUpperCase()} Activity` : 'Activity'

  async function exportCsv() {
    const sp = new URLSearchParams()
    if (entity) sp.set('entity', entity)
    if (start) sp.set('start', start)
    if (end) sp.set('end', end)
    if (action) sp.set('action', action)
    sp.set('limit', '10000')
    // JSON-first: fetch rows then build CSV client-side
    const res = await fetch(`/api/audit?${sp.toString()}`, { cache: 'no-store' })
    if (!res.ok) {
      alert('Export failed')
      return
    }
    const data = await res.json()
    const rows: any[] = Array.isArray(data?.rows) ? data.rows : []
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
    const token = new Date().toISOString().slice(0,10)
    const key = entity ? entity : 'all'
    a.href = url
    a.download = `activity_${key}_${token}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{heading}</h1>
          <div className="flex items-center gap-2">
            <BackButton fallback="/" />
          </div>
        </div>
        <p className="text-slate-600 text-sm mt-1">{entity ? `Recent ${entity} audit events` : 'Recent audit events across HaypBooks'}</p>
        <div className="mt-3 flex items-end gap-2 text-sm">
          <div className="flex flex-col">
            <label htmlFor="activity-start" className="block text-slate-600 mb-1">Start</label>
            <input id="activity-start" type="date" value={start} onChange={(e) => onStartChange(e.target.value)} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="activity-end" className="block text-slate-600 mb-1">End</label>
            <input id="activity-end" type="date" value={end} onChange={(e) => onEndChange(e.target.value)} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="activity-action" className="block text-slate-600 mb-1">Action (optional)</label>
            <input id="activity-action" type="text" placeholder="create | update | delete | merge" value={action} onChange={(e) => onActionChange(e.target.value)} className="w-[26ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <button type="button" onClick={exportCsv} className="ml-auto rounded-md border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-white">Export CSV</button>
          <div aria-live="polite" className="sr-only">
            {(start ? `Start ${start}. ` : 'No start date. ') + (end ? `End ${end}.` : 'No end date.')}
          </div>
        </div>
      </div>
      <AuditEventsPanel
        title={entity ? `Recent ${entity} activity` : 'All Recent Activity'}
        entity={entity || undefined}
        limit={50}
        start={start || undefined}
        end={end || undefined}
        // Note: action filter is handled in ActivityHub for export and query params;
        // AuditEventsPanel intentionally keeps a simple surface (entity/date range)
      />
    </div>
  )
}
