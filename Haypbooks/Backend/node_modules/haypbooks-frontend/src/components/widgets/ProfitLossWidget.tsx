"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type ProfitLossData = {
  income: number
  expenses: number
  netIncome: number
  period: 'MTD' | 'QTD' | 'YTD'
}

export default function ProfitLossWidget() {
  const [data, setData] = useState<ProfitLossData>({
    income: 0,
    expenses: 0,
    netIncome: 0,
    period: 'MTD'
  })
  const [period, setPeriod] = useState<'MTD' | 'QTD' | 'YTD'>('MTD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type ProfitLossApiResponse = { data?: ProfitLossData }
        const result = await api<ProfitLossApiResponse>(`/api/dashboard/profit-loss?period=${period}`)
        setData(result?.data || data)
      } catch (err) {
        console.error('Failed to load P&L', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  const incomePercent = data.income > 0 ? 100 : 0
  const expensePercent = data.income > 0 ? (data.expenses / data.income) * 100 : 0
  const isProfit = data.netIncome >= 0

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Profit & Loss</h3>
        <div className="flex gap-1">
          {(['MTD', 'QTD', 'YTD'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                period === p
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Visual Bar Chart */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-green-700">Income</span>
              <span className="font-semibold text-green-900">
                <Amount value={data.income} />
              </span>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-red-700">Expenses</span>
              <span className="font-semibold text-red-900">
                <Amount value={data.expenses} />
              </span>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-500"
                style={{ width: `${Math.min(expensePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Net Income */}
        <div className={`p-4 rounded-lg ${isProfit ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm font-medium mb-1 ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
            Net {isProfit ? 'Income' : 'Loss'}
          </p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-900' : 'text-red-900'}`}>
            <Amount value={Math.abs(data.netIncome)} />
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link href="/reports/profit-loss" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View full P&L report →
        </Link>
      </div>
    </div>
  )
}
