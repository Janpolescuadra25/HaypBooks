'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface TrialBalanceRow {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  totalDebit: number
  totalCredit: number
  netBalance: number
}

interface TrialBalanceResult {
  asOf: string
  generatedAt: string
  accounts: TrialBalanceRow[]
  totals: {
    totalDebit: number
    totalCredit: number
    netBalance: number
  }
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<TrialBalanceResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10))

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get('/reporting/trial-balance', { params: { companyId, asOf } })
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load trial balance')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || loading) {
    return <div className="p-6 text-center">Loading trial balance…</div>
  }
  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }
  if (!report) {
    return <div className="p-6 text-center text-slate-600">No trial balance data found.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Trial Balance</h1>
          <p className="text-sm text-emerald-600/80">As of {report ? new Date(report.asOf).toLocaleDateString() : new Date(asOf).toLocaleDateString()}</p>
          <p className="text-sm text-slate-500">Generated: {report ? new Date(report.generatedAt).toLocaleString() : '—'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">As of</label>
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button onClick={() => fetchReport()} className="px-4 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50">Refresh</button>
        </div>
      </div>

      <div className="overflow-auto bg-white rounded-xl border border-emerald-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-emerald-50 border-b border-emerald-100 text-emerald-700">
              <th className="px-4 py-2">Account</th>
              <th className="px-4 py-2 hidden md:table-cell">Code</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Credit</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {report.accounts.map((row) => (
              <tr key={row.accountId} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                <td className="px-4 py-2">{row.accountName}</td>
                <td className="px-4 py-2 hidden md:table-cell">{row.accountCode}</td>
                <td className="px-4 py-2">{row.accountType}</td>
                <td className="px-4 py-2 text-right">{fmt(row.totalDebit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.totalCredit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.netBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-emerald-200 font-semibold">
              <td className="px-4 py-2" colSpan={3}>Totals</td>
              <td className="px-4 py-2 text-right">{fmt(report.totals.totalDebit)}</td>
              <td className="px-4 py-2 text-right">{fmt(report.totals.totalCredit)}</td>
              <td className="px-4 py-2 text-right">{fmt(report.totals.netBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={`text-sm ${Math.abs(report.totals.netBalance) < 0.005 ? 'text-emerald-700' : 'text-red-600'}`}>
        Books are {Math.abs(report.totals.netBalance) < 0.005 ? 'balanced' : 'not balanced'}.
      </div>
    </div>
  )
}
