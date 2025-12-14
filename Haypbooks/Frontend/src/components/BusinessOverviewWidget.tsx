"use client"
import { WidgetPeriodSelect, useDashboardSummary } from './WidgetPeriodSelect'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Amount = dynamic(()=>import('./Amount'),{ ssr:false })

export default function BusinessOverviewWidget(){
  const [period,setPeriod] = useState(()=>localStorage.getItem('dashboard.period.businessOverview')||'YTD')
  const { data } = useDashboardSummary(period)
  useEffect(()=>{ try{ localStorage.setItem('dashboard.period.businessOverview', period) }catch{} },[period])
  const b = data?.businessInsights as any
  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <WidgetPeriodSelect value={period} onChange={setPeriod} />
      </div>
      {b ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Revenue Growth</div>
            <div className={`text-lg font-semibold ${(b.revenueGrowthRate ?? 0) >=0 ? 'text-green-600':'text-red-600'}`}>{(b.revenueGrowthRate ?? 0)>0?'+':''}{(b.revenueGrowthRate ?? 0).toFixed(1)}%</div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Monthly Burn Rate</div>
            <div className="text-lg font-semibold"><Amount value={b.cashBurnRate ?? 0} /></div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Customer Count</div>
            <div className="text-lg font-semibold">{b.customerCount ?? 0}</div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Avg Invoice Value</div>
            <div className="text-lg font-semibold"><Amount value={b.averageInvoiceValue ?? 0} /></div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Payment Compliance</div>
            <div className={`text-lg font-semibold ${(b.paymentTermsCompliance ?? 0) >=80? 'text-green-600':'text-yellow-600'}`}>{(b.paymentTermsCompliance ?? 0).toFixed(1)}%</div>
          </div>
          <div className="rounded border p-4 bg-white">
            <div className="text-sm text-slate-500">Runway (months)</div>
            <div className="text-lg font-semibold">{Math.round(b.runwayMonths ?? 0)}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="rounded border p-4 bg-white animate-pulse">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded mt-3" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
