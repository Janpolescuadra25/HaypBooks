'use client'

import React, { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AgingSummary {
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  over90: number
  total: number
}

interface AgingVendor {
  vendorId: string
  vendorName: string
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  over90: number
  total: number
}

interface APAgingResult {
  summary: AgingSummary
  vendors: AgingVendor[]
}

const BUCKET_LABELS = ['Current', '1–30 Days', '31–60 Days', '61–90 Days', 'Over 90']

export default function Page() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [report, setReport] = useState<APAgingResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/reports/aging`)
      setReport(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load A/P aging report')
    } finally {
      setLoading(false)
    }
  }, [companyId])

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
            EXPENSE REPORTS
          </p>
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">A/P Aging Report</h1>
          <p className="text-sm text-slate-500">Outstanding payables aged by overdue days.</p>
        </div>
        <button
          onClick={() => fetchReport()}
          className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading && !report && (
        <div className="p-6 text-center text-slate-500 text-sm">Loading report…</div>
      )}

      {!loading && !error && report && (
        <>
          {/* Summary KPI tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Current', value: report.summary.current, color: 'text-emerald-700' },
              { label: '1–30 Days', value: report.summary.days1to30, color: 'text-yellow-700' },
              { label: '31–60 Days', value: report.summary.days31to60, color: 'text-orange-600' },
              { label: '61–90 Days', value: report.summary.days61to90, color: 'text-rose-600' },
              { label: 'Over 90', value: report.summary.over90, color: 'text-red-700' },
              { label: 'Total', value: report.summary.total, color: 'text-slate-900' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-emerald-100 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className={`text-lg font-black mt-1 ${color}`}>{fmt(value)}</p>
              </div>
            ))}
          </div>

          {/* Bucket bar */}
          {report.summary.total > 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 p-5">
              <h2 className="text-sm font-bold text-emerald-900 mb-3">Aging Distribution</h2>
              <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                {[
                  { v: report.summary.current, bg: 'bg-emerald-400' },
                  { v: report.summary.days1to30, bg: 'bg-yellow-400' },
                  { v: report.summary.days31to60, bg: 'bg-orange-400' },
                  { v: report.summary.days61to90, bg: 'bg-rose-500' },
                  { v: report.summary.over90, bg: 'bg-red-600' },
                ].map(({ v, bg }, i) => {
                  const pct = (v / report.summary.total) * 100
                  if (pct === 0) return null
                  return (
                    <div
                      key={i}
                      className={`${bg} h-full`}
                      style={{ width: `${pct}%` }}
                      title={`${BUCKET_LABELS[i]}: ${fmt(v)}`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                {[
                  { label: 'Current', bg: 'bg-emerald-400' },
                  { label: '1–30', bg: 'bg-yellow-400' },
                  { label: '31–60', bg: 'bg-orange-400' },
                  { label: '61–90', bg: 'bg-rose-500' },
                  { label: 'Over 90', bg: 'bg-red-600' },
                ].map(({ label, bg }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${bg}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vendor detail table */}
          <div className="bg-white rounded-xl border border-emerald-100 overflow-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left bg-emerald-50 border-b border-emerald-100 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th className="px-4 py-3 text-right">1–30 Days</th>
                  <th className="px-4 py-3 text-right">31–60 Days</th>
                  <th className="px-4 py-3 text-right">61–90 Days</th>
                  <th className="px-4 py-3 text-right">Over 90</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400 italic">
                      No outstanding payables found.
                    </td>
                  </tr>
                ) : (
                  report.vendors.map((v) => (
                    <tr key={v.vendorId} className="border-b border-slate-50 hover:bg-emerald-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{v.vendorName}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{fmt(v.current)}</td>
                      <td className="px-4 py-3 text-right text-yellow-700">{fmt(v.days1to30)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{fmt(v.days31to60)}</td>
                      <td className="px-4 py-3 text-right text-rose-600">{fmt(v.days61to90)}</td>
                      <td className="px-4 py-3 text-right text-red-700">{fmt(v.over90)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50 border-t border-emerald-100 font-bold text-sm text-emerald-900">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.current)}</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.days1to30)}</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.days31to60)}</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.days61to90)}</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.over90)}</td>
                  <td className="px-4 py-3 text-right">{fmt(report.summary.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
