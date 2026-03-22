'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface ProfitAndLossResult {
  from: string
  to: string
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  generatedAt: string
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<ProfitAndLossResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/reports/profit-and-loss`)
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load financial report')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchReport() }, [fetchReport])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || loading) {
    return <div className="p-6 text-center">Loading financial statements…</div>
  }
  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }
  if (!report) {
    return <div className="p-6 text-center text-slate-600">No data available.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Profit &amp; Loss</h1>
          <p className="text-sm text-emerald-600/80">Period: {new Date(report.from).toLocaleDateString()} – {new Date(report.to).toLocaleDateString()}</p>
        </div>
        <button onClick={() => fetchReport()} className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <a href="/reporting/reports-center/financial-statements" className="block p-3 rounded-xl border border-emerald-100 bg-white hover:bg-emerald-50 transition">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Financial Statements</p>
          <h2 className="text-lg font-bold text-emerald-900">Profit & Loss</h2>
          <p className="text-sm text-slate-500">View detailed income and expense report.</p>
        </a>
        <a href="/reporting/reports-center/financial-statements/balance-sheet" className="block p-3 rounded-xl border border-emerald-100 bg-white hover:bg-emerald-50 transition">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Financial Statements</p>
          <h2 className="text-lg font-bold text-emerald-900">Balance Sheet</h2>
          <p className="text-sm text-slate-500">View asset, liability, and equity positions.</p>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <p className="text-sm font-medium text-emerald-500">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-800 mt-2">{fmt(report.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <p className="text-sm font-medium text-rose-500">Total Expenses</p>
          <p className="text-3xl font-bold text-rose-800 mt-2">{fmt(report.totalExpenses)}</p>
        </div>
        <div className={`bg-white rounded-xl border p-4 ${report.netIncome >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
          <p className="text-sm font-medium text-slate-500">Net Income</p>
          <p className={`text-3xl font-bold mt-2 ${report.netIncome >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>{fmt(report.netIncome)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-4 text-sm text-slate-600">
        <p>Report generated: {new Date(report.generatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}
