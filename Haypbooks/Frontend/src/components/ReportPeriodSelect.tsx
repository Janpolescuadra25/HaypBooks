"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { useReportFilters } from '@/stores/reportFilters'

export type ReportPeriod =
  | 'Today'
  | 'Yesterday'
  | 'ThisWeek'
  | 'LastWeek'
  | 'Last2Weeks'
  | 'ThisMonth'
  | 'LastMonth'
  | 'Last30'
  | 'MTD'
  | 'ThisQuarter'
  | 'LastQuarter'
  | 'QTD'
  | 'ThisYear'
  | 'LastYear'
  | 'YTD'
  | 'YearToLastMonth'
  | 'Last12'
  | 'Custom'

export function ReportPeriodSelect({ value, showCompare = false }: { value?: ReportPeriod; showCompare?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const reportKey = `period:${pathname}`
  const { filters, load, update, status } = useReportFilters(reportKey)
  const current = (value || (searchParams.get('period') as ReportPeriod) || 'YTD') as ReportPeriod
  const compared = searchParams.get('compare') === '1'
  const urlStart = searchParams.get('start') || ''
  const urlEnd = searchParams.get('end') || ''
  const [start, setStart] = useState<string>(urlStart)
  const [end, setEnd] = useState<string>(urlEnd)
  const canApply = useMemo(() => !!start && !!end && start <= end, [start, end])

  // Initial load and URL sync if missing
  useEffect(() => {
    load()
    // After load, if URL lacks keys but store has them, merge them in
    const hasPeriod = !!searchParams.get('period')
    const hasCompare = searchParams.has('compare')
    const hasStart = !!searchParams.get('start')
    const hasEnd = !!searchParams.get('end')
    if (!hasPeriod || !hasCompare) {
      const savedPeriod = filters['period'] as ReportPeriod | undefined
      const savedCompare = filters['compare']
      const savedStart = filters['start']
      const savedEnd = filters['end']
      const sp = new URLSearchParams(searchParams?.toString() || '')
      if (!hasPeriod && savedPeriod) sp.set('period', savedPeriod)
      if (savedPeriod === 'Custom') {
        if (!hasStart && savedStart) sp.set('start', savedStart)
        if (!hasEnd && savedEnd) sp.set('end', savedEnd)
        if (savedStart) setStart(savedStart)
        if (savedEnd) setEnd(savedEnd)
      }
      if (!hasCompare && typeof savedCompare === 'string') {
        if (savedCompare === '1' || savedCompare.toLowerCase?.() === 'true') sp.set('compare', '1')
        else sp.delete('compare')
      }
      if (sp.toString() !== searchParams?.toString()) {
        router.replace(`${pathname}?${sp.toString()}` as Route)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey])

  function deriveRangeForPeriod(preset: ReportPeriod): { start: string; end: string } | null {
    if (preset === 'Custom') return null
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const iso = (d: Date) => d.toISOString().slice(0,10)
    const startOfWeek = (d: Date) => {
      // Assume week starts on Monday
      const wd = d.getUTCDay() // 0-6 (Sun-Sat)
      const delta = (wd + 6) % 7 // Mon=0, Sun=6
      return new Date(d.getTime() - delta * 86400000)
    }
    const endOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0))
    const startOfQuarterMonth = Math.floor(today.getUTCMonth() / 3) * 3
    const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1))

    switch (preset) {
      case 'Today': {
        const s = today
        return { start: iso(s), end: iso(s) }
      }
      case 'Yesterday': {
        const y = new Date(today.getTime() - 86400000)
        return { start: iso(y), end: iso(y) }
      }
      case 'ThisWeek': {
        const s = startOfWeek(today)
        return { start: iso(s), end: iso(today) }
      }
      case 'LastWeek': {
        const endPrev = new Date(startOfWeek(today).getTime() - 86400000)
        const startPrev = new Date(endPrev.getTime() - 6 * 86400000)
        return { start: iso(startPrev), end: iso(endPrev) }
      }
      case 'Last2Weeks': {
        const s = new Date(today.getTime() - 13 * 86400000)
        return { start: iso(s), end: iso(today) }
      }
      case 'ThisMonth': {
        const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        const e = endOfMonth(today.getUTCFullYear(), today.getUTCMonth())
        return { start: iso(s), end: iso(e) }
      }
      case 'LastMonth': {
        const firstThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        const e = new Date(firstThisMonth.getTime() - 86400000)
        const s = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1))
        return { start: iso(s), end: iso(e) }
      }
      case 'Last30': {
        const s = new Date(today.getTime() - 29 * 86400000)
        return { start: iso(s), end: iso(today) }
      }
      case 'MTD': {
        const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        return { start: iso(s), end: iso(today) }
      }
      case 'ThisQuarter': {
        const s = new Date(Date.UTC(today.getUTCFullYear(), startOfQuarterMonth, 1))
        const e = endOfMonth(today.getUTCFullYear(), startOfQuarterMonth + 2)
        return { start: iso(s), end: iso(e) }
      }
      case 'LastQuarter': {
        const q = Math.floor(today.getUTCMonth() / 3)
        const startQ = new Date(Date.UTC(today.getUTCFullYear(), q * 3, 1))
        const e = new Date(startQ.getTime() - 86400000)
        const s = new Date(Date.UTC(e.getUTCFullYear(), Math.floor(e.getUTCMonth() / 3) * 3, 1))
        return { start: iso(s), end: iso(e) }
      }
      case 'QTD': {
        const s = new Date(Date.UTC(today.getUTCFullYear(), startOfQuarterMonth, 1))
        return { start: iso(s), end: iso(today) }
      }
      case 'ThisYear': {
        const s = startOfYear
        const e = new Date(Date.UTC(today.getUTCFullYear(), 11, 31))
        return { start: iso(s), end: iso(e) }
      }
      case 'LastYear': {
        const s = new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1))
        const e = new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31))
        return { start: iso(s), end: iso(e) }
      }
      case 'YTD': {
        const s = startOfYear
        return { start: iso(s), end: iso(today) }
      }
      case 'YearToLastMonth': {
        const prevMonth = today.getUTCMonth() - 1
        if (prevMonth < 0) {
          // January: use entire last year
          const s = new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1))
          const e = new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31))
          return { start: iso(s), end: iso(e) }
        }
        const s = new Date(Date.UTC(today.getUTCFullYear(), 0, 1))
        const e = endOfMonth(today.getUTCFullYear(), prevMonth)
        return { start: iso(s), end: iso(e) }
      }
      case 'Last12': {
        const s = new Date(today.getTime() - 364 * 86400000)
        return { start: iso(s), end: iso(today) }
      }
    }
    return null
  }

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ReportPeriod
    const sp = new URLSearchParams(searchParams?.toString() || '')
    if (next) sp.set('period', next)
    else sp.delete('period')
    if (next === 'Custom') {
      // keep current start/end
    } else {
      const r = deriveRangeForPeriod(next)
      if (r) {
        sp.set('start', r.start); sp.set('end', r.end)
        // Persist via Preferences API
  update({ period: next, compare: compared ? '1' : '0', start: r.start, end: r.end })
        setStart(r.start); setEnd(r.end)
      } else {
        sp.delete('start'); sp.delete('end')
  update({ period: next, compare: compared ? '1' : '0' })
      }
    }
    router.push(`${pathname}?${sp.toString()}` as Route)
  }

  function onCompareChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sp = new URLSearchParams(searchParams?.toString() || '')
    if (e.target.checked) sp.set('compare', '1')
    else sp.delete('compare')
  update({ period: current, compare: e.target.checked ? '1' : '0', start, end })
    router.push(`${pathname}?${sp.toString()}` as Route)
  }

  function onApplyCustom(e: React.FormEvent) {
    e.preventDefault()
    if (!canApply) return
    const sp = new URLSearchParams(searchParams?.toString() || '')
    sp.set('period', 'Custom')
    sp.set('start', start)
    sp.set('end', end)
  update({ period: 'Custom', compare: compared ? '1' : '0', start, end })
    router.push(`${pathname}?${sp.toString()}` as Route)
  }

  return (
    <div className="text-sm text-slate-700 inline-flex items-center gap-3">
      {status === 'saving' && <span className="text-xs text-slate-400">Saving…</span>}
      {status === 'error' && <span className="text-xs text-red-500">Save error</span>}
      <label className="inline-flex items-center gap-2">
        <span>Period</span>
        <select value={current} onChange={onChange} className="max-w-56 truncate rounded-lg border border-slate-200 bg-white px-2 py-1" title="Select reporting period">
          <optgroup label="Common">
            <option value="Today">Today</option>
            <option value="ThisMonth">This Month</option>
            <option value="MTD">Month to Date (MTD)</option>
            <option value="ThisQuarter">This Quarter</option>
            <option value="QTD">Quarter to Date (QTD)</option>
            <option value="ThisYear">This Year</option>
            <option value="YTD">Year to Date (YTD)</option>
            <option value="Last30">Last 30 Days</option>
            <option value="Last12">Last 12 Months</option>
            <option value="Custom">Custom Date Range…</option>
          </optgroup>
          <optgroup label="More ranges">
            <option value="Yesterday">Yesterday</option>
            <option value="ThisWeek">This Week</option>
            <option value="LastWeek">Last Week</option>
            <option value="Last2Weeks">Last 2 Weeks</option>
            <option value="LastMonth">Last Month</option>
            <option value="LastQuarter">Last Quarter</option>
            <option value="LastYear">Last Year</option>
            <option value="YearToLastMonth">Year to Last Month</option>
          </optgroup>
        </select>
      </label>
      {current === 'Custom' && (
        <form onSubmit={onApplyCustom} className="inline-flex items-center gap-2">
          <label className="inline-flex items-center gap-1">
            <span className="sr-only">Start</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1 dark:bg-slate-800 dark:text-slate-100" />
          </label>
          <span>to</span>
          <label className="inline-flex items-center gap-1">
            <span className="sr-only">End</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-slate-200 bg-white text-slate-900 px-2 py-1 dark:bg-slate-800 dark:text-slate-100" />
          </label>
          <button type="submit" disabled={!canApply} className={`rounded-lg border px-3 py-1 text-sm ${canApply ? 'border-slate-200 bg-white/80 hover:bg-white' : 'border-slate-200 bg-white/50 text-slate-400 cursor-not-allowed'}`}>
            Apply
          </button>
        </form>
      )}
      {showCompare && (
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={compared} onChange={onCompareChange} className="size-4" />
          <span>Compare to previous</span>
        </label>
      )}
    </div>
  )
}
