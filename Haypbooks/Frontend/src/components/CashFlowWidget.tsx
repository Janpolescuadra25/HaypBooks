"use client"
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { WidgetPeriodSelect, useDashboardSummary, useMonthlySeries } from './WidgetPeriodSelect'

const Sparkline = dynamic(() => import('./Sparkline'), { ssr: false })

export default function CashFlowWidget() {
  const [period, setPeriod] = useState<string>(()=>localStorage.getItem('dashboard.period.cashFlow')||'YTD')
  const monthly = useMonthlySeries(period)
  const { data } = useDashboardSummary(period)
  useEffect(()=>{ try { localStorage.setItem('dashboard.period.cashFlow', period) } catch {} },[period])

  const line = (name: string) => monthly?.lines?.find((l:any)=>l.name===name)?.values || []

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <WidgetPeriodSelect value={period} onChange={setPeriod} />
      </div>
      {monthly ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-xs text-slate-500">Revenue trend</div>
            <Sparkline values={line('Revenue')} ariaLabel={`Revenue trend ${monthly.start} to ${monthly.end}`} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Expenses trend</div>
            <Sparkline values={(line('Operating Expenses') as number[]).map(v=>Math.abs(v))} color="#ef4444" ariaLabel={`Expenses trend ${monthly.start} to ${monthly.end}`} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Net income trend</div>
            <Sparkline values={line('Net Income')} color="#10b981" ariaLabel={`Net income trend ${monthly.start} to ${monthly.end}`} />
          </div>
        </div>
      ) : (
        <div className="h-24 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          Chart placeholder
        </div>
      )}
      {data?.businessInsights && (
        <div className="mt-2 text-sm text-slate-600">Runway: <span className="font-medium">{Math.round((data.businessInsights as any).runwayMonths)} months</span></div>
      )}
    </div>
  )
}
