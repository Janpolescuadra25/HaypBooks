'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface CashFlowRow {
  accountId: string
  code: string
  name: string
  net: number
}

interface CashFlowResult {
  from: string
  to: string
  method: string
  operating: {
    startingNetIncome: number
    adjustments: CashFlowRow[]
    total: number
  }
  investing: {
    items: CashFlowRow[]
    total: number
  }
  financing: {
    items: CashFlowRow[]
    total: number
  }
  netCashChange: number
  generatedAt: string
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<CashFlowResult | null>(null)
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
        `/companies/${companyId}/reports/cash-flow?from=${from}&to=${to}`
      )
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load cash flow statement')
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
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">Statement of Cash Flows</h1>
          <p className="text-sm text-slate-500">Indirect method — operating, investing, and financing activities.</p>
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

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading && !report && (
        <div className="p-6 text-center text-slate-500 text-sm">Loading report…</div>
      )}

      {!loading && !error && report && (
        <>
          {/* Net Cash Change KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-emerald-100 p-5">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Operating Activities</p>
              <p className={`text-2xl font-black mt-2 ${report.operating.total >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(report.operating.total)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Investing Activities</p>
              <p className={`text-2xl font-black mt-2 ${report.investing.total >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(report.investing.total)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financing Activities</p>
              <p className={`text-2xl font-black mt-2 ${report.financing.total >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(report.financing.total)}
              </p>
            </div>
          </div>

          {/* Net Cash Change */}
          <div className={`rounded-xl border p-5 ${report.netCashChange >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Net Change in Cash</p>
              <p className={`text-2xl font-black ${report.netCashChange >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(report.netCashChange)}
              </p>
            </div>
          </div>

          {/* Operating Section */}
          <CashFlowSection
            title="Operating Activities"
            color="emerald"
            items={[
              { name: 'Net Income', code: '', net: report.operating.startingNetIncome },
              ...report.operating.adjustments,
            ]}
            total={report.operating.total}
            totalLabel="Net Cash from Operating Activities"
            fmt={fmt}
          />

          {/* Investing Section */}
          <CashFlowSection
            title="Investing Activities"
            color="blue"
            items={report.investing.items}
            total={report.investing.total}
            totalLabel="Net Cash from Investing Activities"
            fmt={fmt}
          />

          {/* Financing Section */}
          <CashFlowSection
            title="Financing Activities"
            color="violet"
            items={report.financing.items}
            total={report.financing.total}
            totalLabel="Net Cash from Financing Activities"
            fmt={fmt}
          />

          <p className="text-xs text-slate-400">
            Method: {report.method} — Generated: {new Date(report.generatedAt).toLocaleString()} — Period:{' '}
            {new Date(report.from).toLocaleDateString()} – {new Date(report.to).toLocaleDateString()}
          </p>
        </>
      )}
    </div>
  )
}

function CashFlowSection({
  title,
  color,
  items,
  total,
  totalLabel,
  fmt,
}: {
  title: string
  color: 'emerald' | 'blue' | 'violet'
  items: Array<{ accountId?: string; code: string; name: string; net: number }>
  total: number
  totalLabel: string
  fmt: (n: number) => string
}) {
  const borderColor = { emerald: 'border-emerald-100', blue: 'border-blue-100', violet: 'border-violet-100' }[color]
  const headingColor = { emerald: 'text-emerald-900', blue: 'text-blue-900', violet: 'text-violet-900' }[color]

  return (
    <div className={`bg-white rounded-xl border ${borderColor} p-5`}>
      <h2 className={`text-base font-bold ${headingColor} mb-3`}>{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No activity recorded.</p>
      ) : (
        <div className="space-y-1.5 text-sm">
          {items.map((item, i) => (
            <div key={item.accountId ?? i} className="flex justify-between text-slate-700">
              <span>{item.name}{item.code ? ` (${item.code})` : ''}</span>
              <span className={`font-semibold ${item.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {fmt(item.net)}
              </span>
            </div>
          ))}
          <div className={`border-t ${borderColor} pt-2 flex justify-between font-bold`}>
            <span className="text-slate-800">{totalLabel}</span>
            <span className={total >= 0 ? 'text-emerald-800' : 'text-red-700'}>{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
