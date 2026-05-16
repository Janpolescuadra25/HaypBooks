'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface BalanceSheetSection {
  accounts: Array<{ accountId: string; accountCode: string; accountName: string; balance: number }>
  total: number
}

interface BalanceSheetResult {
  asOf: string
  generatedAt: string
  sections: {
    assets: BalanceSheetSection
    liabilities: BalanceSheetSection
    equity: BalanceSheetSection
  }
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  isBalanced: boolean
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<BalanceSheetResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get('/reporting/balance-sheet', { params: { companyId, asOf } })
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load balance sheet')
    } finally {
      setLoading(false)
    }
  }, [companyId, asOf])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || loading) {
    return <div className="p-6 text-center">Loading balance sheet…</div>
  }
  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }
  if (!report) {
    return <div className="p-6 text-center text-slate-600">No balance sheet data available.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Balance Sheet</h1>
          <p className="text-sm text-emerald-600/80">As of {new Date(report?.asOf ?? asOf).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">Generated: {report ? new Date(report.generatedAt).toLocaleString() : '—'}</p>
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
          <button onClick={() => fetchReport()} className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Assets" total={report.sections.assets.total} fmt={fmt} data={report.sections.assets} />
        <div className="space-y-4">
          <Section title="Liabilities" total={report.sections.liabilities.total} fmt={fmt} data={report.sections.liabilities} />
          <EquitySection equity={report.sections.equity} fmt={fmt} />
        </div>
      </div>

      <div className={`rounded-lg p-4 text-sm font-semibold ${report.isBalanced ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-red-50 border border-red-100 text-red-700'}`}>
        {report.isBalanced
          ? 'Balanced: Assets = Liabilities + Equity'
          : 'Unbalanced: Check GL posting and trial balance values.'}
      </div>
    </div>
  )
}

function Section({ title, total, fmt, data }: { title: string; total: number; fmt: (n: number) => string; data: BalanceSheetSection }) {
  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4">
      <h2 className="text-lg font-bold text-emerald-900">{title}</h2>
      <div className="mt-2 text-sm text-slate-600">Total: {fmt(total)}</div>
      <div className="mt-4 space-y-2">
        {data.accounts.length === 0 ? (
          <div className="text-sm text-slate-400">No accounts in this section.</div>
        ) : (
          data.accounts.map((item) => (
            <div key={item.accountId} className="grid grid-cols-2 text-sm text-slate-700 gap-2">
              <div>{item.accountName} ({item.accountCode})</div>
              <div className="text-right font-medium">{fmt(item.balance)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EquitySection({ equity, fmt }: { equity: BalanceSheetSection; fmt: (n: number) => string }) {
  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4">
      <h2 className="text-lg font-bold text-emerald-900">Equity</h2>
      <div className="mt-2 text-sm text-slate-600">Total: {fmt(equity.total)}</div>
      <div className="mt-4 space-y-2">
        {equity.accounts.length === 0 ? (
          <div className="text-sm text-slate-400">No equity accounts available.</div>
        ) : (
          equity.accounts.map((item) => (
            <div key={item.accountId} className="grid grid-cols-2 gap-2 text-sm text-slate-700">
              <div>{item.accountName} ({item.accountCode})</div>
              <div className="text-right font-semibold">{fmt(item.balance)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
