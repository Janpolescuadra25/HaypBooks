"use client"
import { useEffect, useState } from 'react'
import { WidgetPeriodSelect, useDashboardSummary } from './WidgetPeriodSelect'

export default function MetricsBarWidget() {
  const [period, setPeriod] = useState<string>(()=>localStorage.getItem('dashboard.period.metricsBar')||'YTD')
  const { data, loading } = useDashboardSummary(period)

  useEffect(()=>{ try { localStorage.setItem('dashboard.period.metricsBar', period) } catch {} },[period])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600">Key metrics</div>
        <WidgetPeriodSelect value={period} onChange={setPeriod} />
      </div>
      {data ? (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-xs uppercase tracking-wide text-slate-500">Open Invoices</span>
            <span className="mt-1 text-lg font-semibold tabular-nums">{data.counts.openInvoices}</span>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-xs uppercase tracking-wide text-slate-500">Overdue Invoices</span>
            <span className="mt-1 text-lg font-semibold tabular-nums text-rose-600">{data.counts.overdueInvoices}</span>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-xs uppercase tracking-wide text-slate-500">Open Bills</span>
            <span className="mt-1 text-lg font-semibold tabular-nums">{data.counts.openBills}</span>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-xs uppercase tracking-wide text-slate-500">Overdue Bills</span>
            <span className="mt-1 text-lg font-semibold tabular-nums text-rose-600">{data.counts.overdueBills}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_,i) => (
            <div key={i} className="rounded-xl border bg-white px-4 py-3 shadow-sm min-w-[140px] animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-10 bg-slate-200 rounded mt-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
