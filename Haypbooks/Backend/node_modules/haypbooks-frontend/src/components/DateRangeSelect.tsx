"use client"
import { useMemo } from 'react'
import { todayIso } from '@/lib/date'

type Props = {
  start: string
  end: string
  onChange: (next: { start: string; end: string }) => void
  showPresets?: boolean
}

export default function DateRangeSelect({ start, end, onChange, showPresets = true }: Props) {
  const presets = useMemo(() => buildPresets(), [])
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col">
        <label htmlFor="dr-start" className="text-xs text-slate-600">Start</label>
        <input id="dr-start" type="date" value={start} onChange={(e) => onChange({ start: e.target.value, end })}
          className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-mono tabular-nums" />
      </div>
      <div className="flex flex-col">
        <label htmlFor="dr-end" className="text-xs text-slate-600">End</label>
        <input id="dr-end" type="date" value={end} onChange={(e) => onChange({ start, end: e.target.value })}
          className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-mono tabular-nums" />
      </div>
      {showPresets && (
        <div className="hidden md:flex items-center gap-1.5">
          {presets.map((p) => (
            <button key={p.label} type="button" onClick={() => onChange(p.range)}
              className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs hover:bg-white"
              aria-label={`Set date range to ${p.label}`}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function buildPresets() {
  const today = new Date()
  const iso = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10)
  const startOfWeek = (d: Date) => {
    const n = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    const day = n.getUTCDay() // 0 Sun
    n.setUTCDate(n.getUTCDate() - day)
    return n
  }
  const startOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  const endOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
  const startOfQuarter = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1))
  const endOfQuarter = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3 + 3, 0))
  const startOfYear = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const twelveMonthsAgo = (d: Date) => new Date(Date.UTC(d.getUTCFullYear() - 1, d.getUTCMonth(), d.getUTCDate()))

  const T = iso(today)
  const Y = iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1)))
  const W0 = startOfWeek(today)
  const W1 = new Date(W0); W1.setUTCDate(W1.getUTCDate() - 1) // last week end
  const W1S = new Date(W1); W1S.setUTCDate(W1.getUTCDate() - 6)
  const M0S = startOfMonth(today)
  const M0E = endOfMonth(today)
  const M1E = new Date(M0S); M1E.setUTCDate(M0S.getUTCDate() - 1)
  const M1S = startOfMonth(M1E)
  const Q0S = startOfQuarter(today)
  const Q0E = endOfQuarter(today)
  const Y0S = startOfYear(today)
  const L30S = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29))
  const L12S = twelveMonthsAgo(today)

  const range = (s: Date, e: Date) => ({ start: iso(s), end: iso(e) })
  return [
    { label: 'Today', range: { start: T, end: T } },
    { label: 'Yesterday', range: { start: Y, end: Y } },
    { label: 'This Week', range: range(W0, today) },
    { label: 'Last Week', range: range(W1S, W1) },
    { label: 'Last 2 Weeks', range: range(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 13)), today) },
    { label: 'This Month', range: range(M0S, today) },
    { label: 'Last Month', range: range(M1S, M1E) },
    { label: 'Last 30 Days', range: range(L30S, today) },
    { label: 'MTD', range: range(M0S, today) },
    { label: 'QTD', range: range(Q0S, today) },
    { label: 'YTD', range: range(Y0S, today) },
    { label: 'Last 12 Months', range: range(L12S, today) },
  ]
}