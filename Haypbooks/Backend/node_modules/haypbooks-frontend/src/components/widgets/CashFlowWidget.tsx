"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type CashFlowItem = {
  date: string
  inflow: number
  outflow: number
  description: string
}

type CashFlowData = {
  forecast: CashFlowItem[]
  currentBalance: number
  projectedBalance: number
}

export default function CashFlowWidget() {
  const [data, setData] = useState<CashFlowData>({
    forecast: [],
    currentBalance: 0,
    projectedBalance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type CashFlowApiResponse = { data?: CashFlowData }
        const result = await api<CashFlowApiResponse>('/api/dashboard/cash-flow')
        setData(result?.data || { forecast: [], currentBalance: 0, projectedBalance: 0 })
      } catch (err) {
        console.error('Failed to load cash flow', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  const netChange = data.projectedBalance - data.currentBalance
  const isPositive = netChange >= 0

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Cash Flow</h3>
        <Link href="/reports/cash-flow" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View report
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">Current Balance</p>
          <p className="text-xl font-bold text-slate-900">
            <Amount value={data.currentBalance} />
          </p>
        </div>
        
        <div className={`p-3 rounded-lg border ${isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-slate-600 mb-1">Projected (30d)</p>
          <p className={`text-xl font-bold ${isPositive ? 'text-green-900' : 'text-red-900'}`}>
            <Amount value={data.projectedBalance} />
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Upcoming (Next 7 Days)</h4>
        {data.forecast.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No upcoming transactions</p>
        ) : (
          data.forecast.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.description}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
              <div className="text-right ml-2">
                {item.inflow > 0 && (
                  <p className="text-sm font-semibold text-green-600">
                    +<Amount value={item.inflow} />
                  </p>
                )}
                {item.outflow > 0 && (
                  <p className="text-sm font-semibold text-red-600">
                    -<Amount value={item.outflow} />
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className={`text-sm font-medium ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
          Net change: {isPositive ? '+' : ''}<Amount value={netChange} />
        </p>
      </div>
    </div>
  )
}
