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

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<ProfitAndLossResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), 0, 1)
  const [from, setFrom] = useState(toDateInput(defaultFrom))
  const [to, setTo] = useState(toDateInput(now))

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(
        `/companies/${companyId}/reports/profit-and-loss?from=${from}&to=${to}`
      )
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load profit and loss report')
    } finally {
      setLoading(false)
    }
  }, [companyId, from, to])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading) return <div className="p-6 text-center">Loading…</div>
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="border-l-4 border-emerald-500 pl-4">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
            FINANCIAL STATEMENTS
          </p>
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">Profit &amp; Loss</h1>
          <p className="text-sm text-slate-500">Income and expense summary for the selected period.</p>
        </div>
        <button
          onClick={() => fetchReport()}
          className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-emerald-100 p-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Error / Loading states */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading && !report && (
        <div className="p-6 text-center text-slate-500 text-sm">Loading report…</div>
      )}

      {!loading && !error && report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-emerald-100 p-5">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Total Revenue</p>
              <p className="text-3xl font-black text-emerald-800 mt-2">{fmt(report.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-rose-100 p-5">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Total Expenses</p>
              <p className="text-3xl font-black text-rose-800 mt-2">{fmt(report.totalExpenses)}</p>
            </div>
            <div className={`bg-white rounded-xl border p-5 ${report.netIncome >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${report.netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                Net Income
              </p>
              <p className={`text-3xl font-black mt-2 ${report.netIncome >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(report.netIncome)}
              </p>
            </div>
          </div>

          {/* Margin summary */}
          <div className="bg-white rounded-xl border border-emerald-100 p-5">
            <h2 className="text-base font-bold text-emerald-900 mb-3">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Total Revenue</span>
                <span className="font-semibold text-emerald-700">{fmt(report.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Expenses</span>
                <span className="font-semibold text-rose-700">({fmt(report.totalExpenses)})</span>
              </div>
              <div className="border-t border-emerald-100 pt-2 flex justify-between font-bold text-sm">
                <span className="text-slate-800">Net Income</span>
                <span className={report.netIncome >= 0 ? 'text-emerald-800' : 'text-red-700'}>
                  {fmt(report.netIncome)}
                </span>
              </div>
              {report.totalRevenue > 0 && (
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>Net Margin</span>
                  <span>{((report.netIncome / report.totalRevenue) * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Generated: {new Date(report.generatedAt).toLocaleString()} — Period:{' '}
            {new Date(report.from).toLocaleDateString()} – {new Date(report.to).toLocaleDateString()}
          </p>
        </>
      )}
    </div>
  )
}
