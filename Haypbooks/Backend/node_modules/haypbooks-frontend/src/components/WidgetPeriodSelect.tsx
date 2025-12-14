"use client"
import { useState, useEffect } from 'react'

export type DashboardSummary = {
  period: string
  counts: { openInvoices: number; overdueInvoices: number; openBills: number; overdueBills: number }
  kpis: Record<string, { current: number; prev: number }>
  businessInsights?: { runwayMonths: number }
  cashFlowForecast?: Array<{ period: string; projectedInflow: number; projectedOutflow: number; netCashFlow: number; cumulativeCash: number }>
}

const PERIODS = ["YTD","MTD","QTD","LastMo","LastQ","Last12"]

export function WidgetPeriodSelect({ value, onChange }: { value: string; onChange: (p: string)=>void }) {
  return (
    <div className="inline-flex rounded border bg-white overflow-hidden text-xs" role="radiogroup" aria-label="Select period">
      {PERIODS.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-2 py-1 ${value===p? 'bg-emerald-600 text-white':'hover:bg-slate-50'}`}
          aria-pressed={value===p}
        >{p}</button>
      ))}
    </div>
  )
}

export function useDashboardSummary(period: string) {
  const [data,setData] = useState<DashboardSummary|null>(null)
  const [loading,setLoading] = useState(false)
  useEffect(()=>{
    let ignore=false
    async function run(){
      setLoading(true)
      try {
        const res = await fetch(`/api/dashboard/summary?period=${encodeURIComponent(period)}&enhanced=true`)
        if(!res.ok) throw new Error('Failed summary')
        const j = await res.json()
        if(!ignore) setData(j)
      } catch(e){ if(!ignore) setData(null) }
      finally { if(!ignore) setLoading(false) }
    }
    run()
    return ()=>{ignore=true}
  },[period])
  return { data, loading }
}

export function useMonthlySeries(period: string) {
  const [data,setData] = useState<any|null>(null)
  useEffect(()=>{
    let ignore=false
    async function run(){
      try {
        const res = await fetch(`/api/reports/profit-loss-by-month?period=${encodeURIComponent(period)}`)
        if(!res.ok) throw new Error('Failed monthly')
        const j = await res.json()
        if(!ignore) setData(j)
      } catch(e){ if(!ignore) setData(null) }
    }
    run();
    return ()=>{ignore=true}
  },[period])
  return data
}