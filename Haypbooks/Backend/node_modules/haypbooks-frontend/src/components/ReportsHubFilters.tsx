"use client"
import { useEffect, useMemo, useState } from 'react'
import { RefreshButton } from '@/components/ReportActions'

type Preset = 'YTD' | 'ThisYear' | 'ThisMonth' | 'MTD' | 'ThisQuarter' | 'QTD' | 'Last30' | 'Last12' | 'Custom'

function deriveRange(preset: Preset): { start: string; end: string } | null {
  if (preset === 'Custom') return null
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const endOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0))
  const startOfQuarterMonth = Math.floor(today.getUTCMonth() / 3) * 3
  const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1))
  switch (preset) {
    case 'ThisMonth': {
      const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const e = endOfMonth(today.getUTCFullYear(), today.getUTCMonth())
      return { start: iso(s), end: iso(e) }
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
    case 'QTD': {
      const s = new Date(Date.UTC(today.getUTCFullYear(), startOfQuarterMonth, 1))
      return { start: iso(s), end: iso(today) }
    }
    case 'ThisYear':
    case 'YTD': {
      const s = startOfYear
      return { start: iso(s), end: iso(today) }
    }
    case 'Last30': {
      const s = new Date(today.getTime() - 29 * 86400000)
      return { start: iso(s), end: iso(today) }
    }
    case 'Last12': {
      const s = new Date(today.getTime() - 364 * 86400000)
      return { start: iso(s), end: iso(today) }
    }
  }
}

export default function ReportsHubFilters() {
  // Component no longer renders the default period control; keep only Refresh for quick data reload
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-700">
      <div className="ml-auto"><RefreshButton /></div>
    </div>
  )
}
