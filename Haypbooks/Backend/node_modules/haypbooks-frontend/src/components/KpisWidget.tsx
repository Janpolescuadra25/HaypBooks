"use client"
import { useEffect, useState } from 'react'
import { WidgetPeriodSelect, useDashboardSummary } from './WidgetPeriodSelect'
import dynamic from 'next/dynamic'
import { evaluateKpi, statusBg, statusColor } from '@/lib/kpi-benchmarks'

const Amount = dynamic(()=>import('./Amount'),{ ssr:false })

function KpiBox({ kind, current, prev }:{ kind:string; current:number; prev:number }) {
  let label = kind
  let status:'good'|'warn'|'bad'='warn'
  if(kind==='revenue'){ status = evaluateKpi('Revenue (K)', [prev,current]).status }
  else if(kind==='cash'){ status = evaluateKpi('Cash (K)', [prev,current]).status }
  else if(kind==='netIncome'){ status = evaluateKpi('Gross margin (K)', [prev,current]).status }
  else if(kind==='expenses'){ const delta=current-prev; const pct = prev!==0? (delta/Math.abs(prev))*100:0; status = pct<=0? 'good': pct<=5? 'warn':'bad' }
  return (
    <div className={`rounded border p-4 ${statusBg(status)}`}>
      <div className="text-sm text-slate-600 flex items-center justify-between">
        <span>{label}</span>
        <span className={`text-xs ${statusColor(status)}`}>{label}</span>
      </div>
      <div className="text-2xl font-bold mt-1"><Amount value={current} /></div>
      <div className="text-xs text-slate-500">Prev: <Amount value={prev} /></div>
    </div>
  )
}

export default function KpisWidget(){
  const [period,setPeriod] = useState<string>(()=>localStorage.getItem('dashboard.period.kpis')||'YTD')
  const { data } = useDashboardSummary(period)
  useEffect(()=>{ try { localStorage.setItem('dashboard.period.kpis', period) } catch {} },[period])
  const k = data?.kpis
  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <WidgetPeriodSelect value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {k ? (
          <>
            <KpiBox kind="revenue" current={k.revenue.current} prev={k.revenue.prev} />
            <KpiBox kind="expenses" current={k.expenses.current} prev={k.expenses.prev} />
            <KpiBox kind="netIncome" current={k.netIncome.current} prev={k.netIncome.prev} />
            <KpiBox kind="cash" current={k.cash.current} prev={k.cash.prev} />
          </>
        ) : (
          Array.from({length:4}).map((_,i)=>(
            <div key={i} className="rounded border p-4 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded mt-2" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
