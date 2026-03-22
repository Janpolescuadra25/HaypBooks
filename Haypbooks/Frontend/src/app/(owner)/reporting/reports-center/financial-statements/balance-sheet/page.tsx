'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface BalanceSheetSection {
  current?: Array<{ code: string; name: string; balance: number }>
  nonCurrent?: Array<{ code: string; name: string; balance: number }>
  total: number
}

interface BalanceSheetResult {
  asOf: string
  assets: BalanceSheetSection
  liabilities: BalanceSheetSection
  equity: { items: Array<{ code: string; name: string; balance: number }> ; total: number }
  isBalanced: boolean
  generatedAt: string
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<BalanceSheetResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/reports/balance-sheet`)
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load balance sheet')
    } finally {
      setLoading(false)
    }
  }, [companyId])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Balance Sheet</h1>
          <p className="text-sm text-emerald-600/80">As of {new Date(report.asOf).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <button onClick={() => fetchReport()} className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Assets" total={report.assets.total} fmt={fmt} data={report.assets} />
        <div className="space-y-4">
          <Section title="Liabilities" total={report.liabilities.total} fmt={fmt} data={report.liabilities} />
          <EquitySection equity={report.equity} fmt={fmt} />
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

function Section({ title, total, fmt, data }: { title: string; total: number; fmt: (n: number) => string; data: BalanceSheetSection & { total: number }; }) {
  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4">
      <h2 className="text-lg font-bold text-emerald-900">{title}</h2>
      <div className="mt-2 text-sm text-slate-600">Total: {fmt(total)}</div>
      <div className="mt-4 space-y-3">
        {data.current && data.current.length > 0 && <Subsection title="Current" rows={data.current} fmt={fmt} />}
        {data.nonCurrent && data.nonCurrent.length > 0 && <Subsection title="Non-current" rows={data.nonCurrent} fmt={fmt} />}
      </div>
    </div>
  )
}

function EquitySection({ equity, fmt }: { equity: BalanceSheetResult['equity']; fmt: (n: number) => string }) {
  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4">
      <h2 className="text-lg font-bold text-emerald-900">Equity</h2>
      <div className="mt-2 text-sm text-slate-600">Total: {fmt(equity.total)}</div>
      <div className="mt-4 space-y-2">
        {equity.items.map((item) => (
          <div key={item.code} className="grid grid-cols-2 gap-2 text-sm text-slate-700">
            <div>{item.name} ({item.code})</div>
            <div className="text-right font-semibold">{fmt(item.balance)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Subsection({ title, rows, fmt }: { title: string; rows: Array<{ code: string; name: string; balance: number }>; fmt: (n: number) => string }) {
  return (
    <div>
      <div className="font-semibold text-emerald-700">{title}</div>
      <div className="mt-2 space-y-1">
        {rows.map(row => (
          <div key={row.code} className="grid grid-cols-2 text-sm text-slate-700">
            <div>{row.name} ({row.code})</div>
            <div className="text-right font-medium">{fmt(row.balance)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}