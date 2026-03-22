'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface TrialBalanceRow {
  accountId: string
  code: string
  name: string
  category: string
  debit: number
  credit: number
  balance: number
}

interface TrialBalanceResult {
  rows: TrialBalanceRow[]
  totalDebits: number
  totalCredits: number
  balanced: boolean
  generatedAt: string
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<TrialBalanceResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/reports/trial-balance`)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Trial Balance</h1>
          <p className="text-sm text-emerald-600/80">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <button onClick={() => fetchReport()} className="px-4 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50">Refresh</button>
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
            {report.rows.map((row) => (
              <tr key={row.accountId} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 hidden md:table-cell">{row.code}</td>
                <td className="px-4 py-2">{row.category}</td>
                <td className="px-4 py-2 text-right">{fmt(row.debit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.credit)}</td>
                <td className="px-4 py-2 text-right">{fmt(row.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-emerald-200 font-semibold">
              <td className="px-4 py-2" colSpan={3}>Totals</td>
              <td className="px-4 py-2 text-right">{fmt(report.totalDebits)}</td>
              <td className="px-4 py-2 text-right">{fmt(report.totalCredits)}</td>
              <td className="px-4 py-2 text-right">{fmt(report.totalDebits - report.totalCredits)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={`text-sm ${report.balanced ? 'text-emerald-700' : 'text-red-600'}`}>
        Books are {report.balanced ? 'balanced' : 'not balanced'}.
      </div>
    </div>
  )
}
