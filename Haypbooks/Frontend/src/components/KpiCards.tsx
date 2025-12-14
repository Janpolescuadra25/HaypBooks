"use client"
import { useEffect, useMemo, useState } from 'react'
import { evaluateKpi, statusColor, statusDot, defaultKpiThresholds, KpiThresholds } from '@/lib/kpi-benchmarks'

function Sparkline({ data, color = '#0ea5e9', overlay }: { data: number[]; color?: string; overlay?: { data: number[]; color?: string } }) {
  const w = 120, h = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(1, max - min)
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      {overlay && overlay.data.length === data.length && (
        (() => {
          const pts = overlay.data.map((v, i) => {
            const x = (i / Math.max(1, overlay.data.length - 1)) * w
            const y = h - ((v - min) / range) * h
            return `${x},${y}`
          }).join(' ')
          return <polyline fill="none" stroke={overlay.color || '#94a3b8'} strokeWidth="1.5" strokeDasharray="3 3" points={pts} />
        })()
      )}
    </svg>
  )
}

export type Metrics = {
  months: string[]
  revenue: number[]
  grossMargin: number[]
  cash: number[]
  mrr: number[]
  churn: number[]
  arDays: number[]
  apDays: number[]
  prev?: {
    revenue: number[]
    grossMargin: number[]
    cash: number[]
    mrr: number[]
    churn: number[]
    arDays: number[]
    apDays: number[]
  }
}

type Props = { metrics: Metrics; compared?: boolean }

const STORAGE_KEY = 'hayp.kpi.thresholds.v1'

export function KpiCards({ metrics, compared }: Props) {
  const [open, setOpen] = useState(false)
  const [thresholds, setThresholds] = useState<KpiThresholds>(defaultKpiThresholds)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setThresholds({ ...defaultKpiThresholds, ...JSON.parse(raw) })
    } catch {}
  }, [])

  const cards = useMemo(() => ([
    { key: 'Revenue (K)', label: 'Revenue (K)', value: `${metrics.revenue.at(-1)}k`, trend: metrics.revenue, color: '#16a34a', hint: 'Monthly total revenue', prev: metrics.prev?.revenue },
    { key: 'Gross margin (K)', label: 'Gross margin (K)', value: `${metrics.grossMargin.at(-1)}k`, trend: metrics.grossMargin, color: '#f59e0b', prev: metrics.prev?.grossMargin },
    { key: 'Cash (K)', label: 'Cash (K)', value: `${metrics.cash.at(-1)}k`, trend: metrics.cash, color: '#0ea5e9', prev: metrics.prev?.cash },
    { key: 'MRR (K)', label: 'MRR (K)', value: `${metrics.mrr.at(-1)}k`, trend: metrics.mrr, color: '#6366f1', prev: metrics.prev?.mrr },
    { key: 'Churn (%)', label: 'Churn (%)', value: `${metrics.churn.at(-1)}%`, trend: metrics.churn, color: '#ef4444', prev: metrics.prev?.churn },
    { key: 'A/R days', label: 'A/R days', value: `${metrics.arDays.at(-1)}`, trend: metrics.arDays, color: '#22c55e', prev: metrics.prev?.arDays },
    { key: 'A/P days', label: 'A/P days', value: `${metrics.apDays.at(-1)}`, trend: metrics.apDays, color: '#14b8a6', prev: metrics.prev?.apDays },
  ]), [metrics])

  function saveThresholds() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds))
      setOpen(false)
    } catch {}
  }

  function resetThresholds() {
    setThresholds(defaultKpiThresholds)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1" title="Healthy trend or target achieved."><span className="inline-block size-2 rounded-full bg-emerald-500" /> Good</div>
          <div className="flex items-center gap-1" title="Slight risk; watch closely."><span className="inline-block size-2 rounded-full bg-amber-500" /> Warn</div>
          <div className="flex items-center gap-1" title="Outside target; take action."><span className="inline-block size-2 rounded-full bg-rose-500" /> Bad</div>
        </div>
        <button aria-label="KPI settings" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 text-xs border border-slate-200 px-2 py-1 rounded-md"
          onClick={() => setOpen(true)}>
          <span className="i-mdi-cog-outline" aria-hidden />
          Settings
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => {
          const ev = evaluateKpi(c.label as any, c.trend, c.prev, thresholds)
          const prevOk = compared && c.prev && c.prev.length === c.trend.length
          const cur = Number(c.trend.at(-1) ?? 0)
          const prev = Number(prevOk ? c.prev!.at(-1) ?? 0 : 0)
          const delta = prevOk ? Number((cur - prev).toFixed(2)) : 0
          const pct = prevOk && prev !== 0 ? Number(((cur - prev) / Math.abs(prev) * 100).toFixed(1)) : 0
          const up = delta >= 0
          return (
            <div key={c.key} className="rounded-lg border border-slate-200 bg-white/80 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1" title={ev.explainer}>
                    <span className={`inline-block size-2 rounded-full ${statusDot(ev.status)}`} />
                    <span>{c.label}</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">{c.value}</div>
                  {prevOk && (
                    <div className={`mt-0.5 text-xs tabular-nums ${statusColor(ev.status)}`}>
                      {up ? '+' : ''}{delta} ({pct}%) vs prev
                    </div>
                  )}
                </div>
                <Sparkline data={c.trend} color={c.color} overlay={prevOk ? { data: c.prev! } : undefined} />
              </div>
              {c.hint && <div className="mt-1 text-xs text-slate-500">{c.hint}</div>}
            </div>
          )
        })}
      </div>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-xl sm:rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">KPI benchmark settings</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-slate-100">✕</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1">
                <div>Churn max good (%)</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.churnMaxGood}
                  onChange={e => setThresholds(t => ({ ...t, churnMaxGood: Number(e.target.value) }))} />
              </label>
              <label className="space-y-1">
                <div>Churn max warn (%)</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.churnMaxWarn}
                  onChange={e => setThresholds(t => ({ ...t, churnMaxWarn: Number(e.target.value) }))} />
              </label>

              <label className="space-y-1">
                <div>A/R days max good</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.arDaysMaxGood}
                  onChange={e => setThresholds(t => ({ ...t, arDaysMaxGood: Number(e.target.value) }))} />
              </label>
              <label className="space-y-1">
                <div>A/R days max warn</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.arDaysMaxWarn}
                  onChange={e => setThresholds(t => ({ ...t, arDaysMaxWarn: Number(e.target.value) }))} />
              </label>

              <label className="space-y-1">
                <div>A/P days min good</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.apDaysMinGood}
                  onChange={e => setThresholds(t => ({ ...t, apDaysMinGood: Number(e.target.value) }))} />
              </label>
              <label className="space-y-1">
                <div>A/P days max good</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.apDaysMaxGood}
                  onChange={e => setThresholds(t => ({ ...t, apDaysMaxGood: Number(e.target.value) }))} />
              </label>
              <label className="space-y-1">
                <div>A/P days min warn</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.apDaysMinWarn}
                  onChange={e => setThresholds(t => ({ ...t, apDaysMinWarn: Number(e.target.value) }))} />
              </label>
              <label className="space-y-1">
                <div>A/P days max warn</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.apDaysMaxWarn}
                  onChange={e => setThresholds(t => ({ ...t, apDaysMaxWarn: Number(e.target.value) }))} />
              </label>

              <label className="space-y-1 col-span-2">
                <div>Positive trend warn floor (% vs prev)</div>
                <input type="number" className="w-full border rounded px-2 py-1" value={thresholds.positiveWarnFloorPct}
                  onChange={e => setThresholds(t => ({ ...t, positiveWarnFloorPct: Number(e.target.value) }))} />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={resetThresholds} className="text-xs px-3 py-1 rounded border border-slate-200">Reset defaults</button>
              <div className="space-x-2">
                <button onClick={() => setOpen(false)} className="text-xs px-3 py-1 rounded border border-slate-200">Cancel</button>
                <button onClick={saveThresholds} className="text-xs px-3 py-1 rounded bg-slate-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
