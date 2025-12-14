"use client"
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { WidgetPeriodSelect, useDashboardSummary } from './WidgetPeriodSelect'

const Amount = dynamic(()=>import('./Amount'),{ ssr:false })

export default function CashFlowForecastWidget(){
  const [period,setPeriod] = useState(()=>localStorage.getItem('dashboard.period.cashFlowForecast')||'YTD')
  const { data } = useDashboardSummary(period)
  useEffect(()=>{ try{ localStorage.setItem('dashboard.period.cashFlowForecast', period) }catch{} },[period])
  const rows = data?.cashFlowForecast || []
  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <WidgetPeriodSelect value={period} onChange={setPeriod} />
      </div>
      {rows.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rows.map(f => (
            <div key={f.period} className="text-center rounded border p-3 bg-white">
              <div className="text-sm font-medium text-slate-600 mb-2">{new Date(f.period+'-01').toLocaleDateString('en-US',{month:'short', year:'numeric'})}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-green-600">Inflow:</span><Amount value={f.projectedInflow} /></div>
                <div className="flex justify-between"><span className="text-red-600">Outflow:</span><Amount value={f.projectedOutflow} /></div>
                <div className="border-t pt-2 flex justify-between font-medium"><span>Net Cash:</span><Amount value={f.netCashFlow} /></div>
                <div className="text-xs text-slate-500">Cumulative: <Amount value={f.cumulativeCash} /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded border p-4 text-slate-500 bg-white">No forecast</div>
      )}
    </div>
  )
}
