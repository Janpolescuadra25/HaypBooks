'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Amount from '@/components/Amount'

interface SnapshotBucket { status: string; count: number; total: number }
interface SummaryResponse {
  buckets: SnapshotBucket[]
  inflows: number
  outflows: number
  net: number
  progress: number
  counts: { for_review: number; categorized: number; excluded: number }
}

export default function ReconciliationSummary() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true); setError(null)
      try {
        const res = await fetch('/api/reconciliation/summary', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json() as SummaryResponse
        if (!alive) return
        setSummary(data)
      } catch (e:any) {
        if (!alive) return
        setError(e.message || 'Load failed')
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [refreshTick])
  const buckets = summary?.buckets || []
  const inflows = summary?.inflows || 0
  const outflows = summary?.outflows || 0
  const net = summary?.net || 0
  const forReview = summary?.counts.for_review || 0
  const categorized = summary?.counts.categorized || 0
  const progress = summary?.progress || 0

  const bulkCategorize = useCallback(async () => {
    // Fallback: still fetch up to 500 transactions to perform bulk categorize via existing endpoint until dedicated server op exists
    try {
      const res = await fetch('/api/transactions?page=1&limit=500', { cache: 'no-store' })
      if (!res.ok) throw new Error('Load transactions failed')
      const data = await res.json() as { transactions: { id: string; bankStatus?: string }[] }
      const targets = (data.transactions||[])
        .filter(r => (r.bankStatus||'for_review') === 'for_review' || r.bankStatus === 'imported')
        .slice(0,50)
      await Promise.all(targets.map(t => fetch('/api/transactions', { method: 'PUT', body: JSON.stringify({ ...t, bankStatus: 'categorized' }) })))
      setRefreshTick(t => t + 1)
    } catch (e) { /* silent */ }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Reconciliation snapshot</h2>
        {loading && <span className="text-xs text-slate-500">Loading…</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
  {!loading && !error && <button className="btn-secondary btn-xs" onClick={() => setRefreshTick(t => t + 1)}>Refresh</button>}
  {!loading && !error && forReview > 0 && <button className="btn-secondary btn-xs" onClick={bulkCategorize}>Mark all for review as categorized</button>}
        {!loading && !error && buckets.length > 0 && (
          <button
            className="btn-secondary btn-xs"
            onClick={() => {
              const header = 'status,count,total\n'
              const lines = buckets.map(b => `${b.status},${b.count},${b.total}`)
              const csv = header + lines.join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'reconciliation-snapshot.csv'; a.click()
              URL.revokeObjectURL(url)
            }}
          >Export snapshot</button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="For review" value={forReview} tone="amber" />
        <Metric title="Categorized" value={categorized} tone="emerald" />
        <Metric title="Excluded" value={buckets.find(b => b.status === 'excluded')?.count || 0} tone="slate" />
        <Metric title="Progress" value={`${progress}%`} tone="sky" detail={`${categorized}/${categorized + forReview || 0}`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric title="Inflows" value={<Amount value={inflows} />} tone="emerald" />
        <Metric title="Outflows" value={<Amount value={outflows} />} tone="rose" />
        <Metric title="Net" value={<Amount value={net} />} tone={net>=0 ? 'sky' : 'rose'} />
      </div>
      <div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          {/* SVG progress bar avoids inline style width */}
          <svg className="h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none" role="img" aria-label={`${progress}% categorized`}>
            <rect x="0" y="0" width="100" height="10" fill="transparent" />
            <rect x="0" y="0" height="10" fill="currentColor" className="text-emerald-500 transition-all" width={progress} />
          </svg>
        </div>
        <p className="mt-1 text-xs text-slate-500" aria-live="polite">{progress}% categorized</p>
      </div>
    </div>
  )
}

function Metric({ title, value, tone, detail }: { title: string; value: React.ReactNode; tone: 'amber'|'emerald'|'slate'|'sky'|'rose'; detail?: string }) {
  const toneMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    // Use slightly stronger rose variant for better contrast in small badges
    rose: 'bg-rose-100 text-rose-800 ring-rose-200'
  }
  return (
    <div className={`rounded-xl ring-1 ${toneMap[tone]} p-3 flex flex-col gap-1`}> 
      <div className="text-xs font-medium tracking-wide uppercase">{title}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {detail && <div className="text-[10px] uppercase tracking-wide text-slate-500">{detail}</div>}
    </div>
  )
}
