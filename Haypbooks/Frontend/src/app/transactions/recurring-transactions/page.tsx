"use client"
import React, { useEffect, useState } from 'react'
import './styles.css'
import { formatCurrency } from '@/lib/format'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'

type Template = {
  id: string
  kind: string
  name: string
  status: string
  frequency: string
  nextRunDate: string
  lastRunDate?: string
  endDate?: string
  remainingRuns?: number
  totalRuns?: number
  lines: Array<{ description: string; amount: number }>
  memo?: string
  currency?: string
  mode?: 'scheduled' | 'reminder' | 'unscheduled'
  // Note: original start date is not surfaced by list API today; assume nextRunDate is current anchor.
}

type HistoryEntry = {
  id: string
  templateId: string
  runDate: string
  artifactType: string
  artifactId?: string
  amount: number
  status: string
}

export default function RecurringTransactionsPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const [notice, setNotice] = useState<string|undefined>()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  async function refresh() {
    setLoading(true)
    setError(undefined)
    try {
      const r = await fetch('/api/recurring-transactions')
      const j = await r.json()
      setTemplates(j.data || [])
      // Fetch run history (viewer may be blocked; ignore errors)
      try {
        const qs = new URLSearchParams()
        if (start) qs.set('start', start)
        if (end) qs.set('end', end)
        const rh = await fetch(`/api/recurring-transactions/history${qs.toString() ? `?${qs.toString()}` : ''}`)
        if (rh.ok) {
          const hj = await rh.json()
          setHistory(Array.isArray(hj.data) ? hj.data.slice(0,25) : [])
        }
      } catch {}
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ refresh() },[])

  function openNewForm() {
    // Open dedicated New Recurring Template page
    router.push(toHref('/transactions/recurring-transactions/new'))
  }

  async function runTemplate(id: string) {
    setNotice(undefined)
    const r = await fetch('/api/recurring-transactions/run',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    const j = await r.json()
    if (!r.ok) { setError(j.error || 'run failed'); return }
    setNotice('Run completed (simulated materialization)')
    refresh()
  }

  async function pauseTemplate(id: string) {
    const r = await fetch('/api/recurring-transactions/pause',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    const j = await r.json()
    if (!r.ok) { setError(j.error || 'pause failed'); return }
    setNotice('Paused template')
    refresh()
  }

  async function resumeTemplate(id: string) {
    const r = await fetch('/api/recurring-transactions/resume',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    const j = await r.json()
    if (!r.ok) { setError(j.error || 'resume failed'); return }
    setNotice('Resumed template')
    refresh()
  }

  async function duplicateTemplate(t: Template) {
    setError(undefined); setNotice(undefined)
    try {
      const body = {
        kind: t.kind,
        name: `Copy of ${t.name}`.slice(0,120),
        status: 'active' as const,
        startDate: t.nextRunDate || new Date().toISOString().slice(0,10),
        endDate: t.endDate,
        frequency: t.frequency,
        mode: t.mode || 'scheduled',
        remainingRuns: t.remainingRuns,
        totalRuns: t.totalRuns,
        lines: t.lines,
        memo: t.memo,
        currency: t.currency || 'USD'
      }
      const r = await fetch('/api/recurring-transactions', { method:'POST', headers:{ 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) {
        const j = await r.json().catch(()=>null)
        throw new Error(j?.error || 'duplicate failed')
      }
      setNotice('Template duplicated')
      refresh()
    } catch(e:any) {
      setError(e.message || 'duplicate failed')
    }
  }

  async function deleteTemplate(id: string) {
    setError(undefined); setNotice(undefined)
    try {
      if (!confirm('Delete this recurring template? This cannot be undone.')) return
      const r = await fetch(`/api/recurring-transactions?id=${encodeURIComponent(id)}`, { method:'DELETE' })
      if (!r.ok) {
        const j = await r.json().catch(()=>null)
        throw new Error(j?.error || 'delete failed')
      }
      setNotice('Template deleted')
      refresh()
    } catch(e:any) {
      setError(e.message || 'delete failed')
    }
  }

  return (
    <div className="rt-wrapper">
      <div className="glass-card print:hidden">
        <div className="px-5 pt-5 pb-4" role="toolbar" aria-label="Recurring Transactions toolbar">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-[260px]">
              <h1 className="rt-title m-0 text-lg font-semibold">Recurring Transactions</h1>
              <p className="rt-sub m-0 text-sm text-slate-700">Automate journals, invoices, and bills on a defined interval. Brand-neutral, JSON-first lifecycle with deterministic scheduling.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ExportCsvButton exportPath="/api/recurring-transactions/export" title="Export CSV" />
              <PrintButton />
            </div>
          <hr className="rt-sep" />
          </div>
          <hr className="rt-sep" />
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  aria-label="Search templates"
                  placeholder="Search templates…"
                  className="border rounded px-2 py-1 text-sm min-w-[14rem]"
                  value={search}
                  onChange={e=> setSearch(e.target.value)}
                />
                {search && <button className="btn-secondary px-3 py-1 text-xs" onClick={()=> setSearch('')}>Clear</button>}
                <span className="text-xs text-slate-500">Filtered {templates.filter(t=> {
                  const q = search.toLowerCase()
                  return !q || t.name.toLowerCase().includes(q) || t.kind.toLowerCase().includes(q) || t.frequency.toLowerCase().includes(q)
                }).length} / {templates.length}</span>
              </div>
              <div className="flex items-start gap-2">
                <button className="btn-primary px-3 py-1 text-sm" onClick={openNewForm} aria-label="Create new recurring template">New</button>
                <aside className="min-w-[260px] shrink-0 border border-slate-200 rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-slate-800 m-0">Recent runs</h3>
                    <a className="text-xs text-sky-700 hover:underline" href={`/api/recurring-transactions/history/export${(()=>{const u=new URLSearchParams(); if(start) u.set('start',start); if(end) u.set('end',end); return u.toString()?`?${u.toString()}`:''})()}`}>CSV</a>
                  </div>
                  {history.length === 0 && <div className="text-xs text-slate-500">No runs yet.</div>}
                  {history.length > 0 && (
                    <ul className="m-0 p-0 list-none space-y-1">
                      {history.slice(0,5).map(h => {
                        const tmpl = templates.find(t=> t.id === h.templateId)
                        const currency = tmpl?.currency || 'USD'
                        const linkFor = () => {
                          if (!h.artifactId) return null
                          if (h.artifactType === 'journal') return `/journal/${h.artifactId}`
                          if (h.artifactType === 'invoice') return `/invoices/${h.artifactId}`
                          if (h.artifactType === 'bill') return `/bills/${h.artifactId}`
                          return null
                        }
                        return (
                          <li key={h.id} className="text-xs flex items-center justify-between gap-2">
                            <span className="truncate max-w-[10rem]" title={`${h.runDate} • ${(tmpl?.name||h.templateId)}• ${h.artifactType}`}>{h.runDate} · {tmpl?.name || h.templateId}</span>
                            <span className="shrink-0">{formatCurrency(h.amount, currency)}</span>
                            {linkFor() && <a className="text-sky-700 hover:underline shrink-0" href={linkFor()!}>Open</a>}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </aside>
              </div>
            </div>
            {loading && <div className="text-sm">Loading…</div>}
            {!loading && templates.length === 0 && <div className="rt-empty text-sm">No templates yet.</div>}
            {!loading && templates.length > 0 && (
              <div className="overflow-x-auto">
                <table className="rt-table text-sm" aria-label="Recurring templates">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Frequency</th>
                      <th>Next Run</th>
                      <th>Last Run</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Remaining</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Upcoming</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.filter(t=> {
                      const q = search.toLowerCase()
                      return !q || t.name.toLowerCase().includes(q) || t.kind.toLowerCase().includes(q) || t.frequency.toLowerCase().includes(q)
                    }).map(t => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.kind}</td>
                        <td>{t.frequency}</td>
                        <td>{t.nextRunDate}</td>
                        <td>{t.lastRunDate || '—'}</td>
                        <td>{t.endDate || '—'}</td>
                        <td>{(()=>{
                          // Derive 'ended' if paused due to endDate
                          const ended = t.endDate && t.nextRunDate > t.endDate
                          return ended ? 'ended' : t.status
                        })()}</td>
                        <td>{typeof t.remainingRuns === 'number' ? t.remainingRuns : '∞'}</td>
                        <td>{formatCurrency(t.lines.reduce((s,l)=> s + Number(l.amount||0),0), t.currency || 'USD')}</td>
                        <td>{t.mode || 'scheduled'}</td>
                        <td title="Next scheduled run dates">{(()=>{
                          // Lightweight inline projection (3 upcoming dates)
                          const out: string[] = []
                          const active = t.status === 'active'
                          const cap = typeof t.remainingRuns === 'number' ? Math.min(3, Math.max(0, t.remainingRuns)) : 3
                          let cur = t.nextRunDate
                          let left = cap
                          while (active && left > 0 && cur) {
                            out.push(cur)
                            const d = new Date(cur + 'T00:00:00Z')
                            if (t.frequency === 'daily') d.setUTCDate(d.getUTCDate()+1)
                            else if (t.frequency === 'weekly') d.setUTCDate(d.getUTCDate()+7)
                            else if (t.frequency === 'monthly') {
                              const origDay = d.getUTCDate()
                              const mAfter = d.getUTCMonth()+1
                              const yAfter = d.getUTCFullYear() + (mAfter > 11 ? 1 : 0)
                              const lastDay = new Date(Date.UTC(yAfter, (d.getUTCMonth()+1) + 1, 0)).getUTCDate()
                              const clamped = Math.min(origDay, lastDay)
                              d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth()+1); d.setUTCDate(clamped)
                            } else if (t.frequency === 'yearly') {
                              const origDay = d.getUTCDate(); const origMonth = d.getUTCMonth(); const targetYear = d.getUTCFullYear()+1
                              const lastDay = new Date(Date.UTC(targetYear, origMonth + 1, 0)).getUTCDate()
                              const clamped = Math.min(origDay, lastDay)
                              d.setUTCFullYear(targetYear, origMonth, clamped)
                            }
                            cur = d.toISOString().slice(0,10)
                            left--
                          }
                          return out.join(', ') || '—'
                        })()}</td>
                        <td className="rt-actions">
                          <button onClick={()=> runTemplate(t.id)} disabled={t.status !== 'active'}>Run Now</button>
                          {t.status === 'active' && <button onClick={()=> pauseTemplate(t.id)}>Pause</button>}
                          {t.status === 'paused' && <button onClick={()=> resumeTemplate(t.id)}>Resume</button>}
                          <button onClick={()=> duplicateTemplate(t)}>Duplicate</button>
                          <button onClick={()=> deleteTemplate(t.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      {notice && <div className="rt-notice">{notice}</div>}
      {error && <div className="rt-error">{error}</div>}
    </div>
  )
}
