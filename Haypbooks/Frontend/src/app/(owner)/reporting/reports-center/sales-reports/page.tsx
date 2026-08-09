'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { TrendingUp, Download, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { downloadFromResponse } from '@/lib/download'
import { reportingService } from '@/services/reporting.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const formatAmount = (value: number) => formatCurrency(value ?? 0, 'USD')
const defaultDate = (date: Date) => date.toISOString().slice(0, 10)

export default function Page() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dateFrom, setDateFrom] = useState(defaultDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)))
  const [dateTo, setDateTo] = useState(defaultDate(new Date()))

  const fetchReport = useCallback(async () => {
    if (!companyId) return
    setFetchLoading(true)
    try {
      const response = await reportingService.getSalesReport(companyId, { from: dateFrom, to: dateTo })
      setData(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
      setError('')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load sales report')
    } finally {
      setFetchLoading(false)
    }
  }, [companyId, dateFrom, dateTo])

  useEffect(() => {
    fetchReport()
  }, [companyId])

  useEffect(() => {
    if (!banner) return
    const timer = window.setTimeout(() => setBanner(null), 3000)
    return () => window.clearTimeout(timer)
  }, [banner])

  const handleExport = async () => {
    if (!companyId) return
    try {
      const response = await reportingService.exportSalesReport(companyId, { from: dateFrom, to: dateTo })
      if (!response.ok) throw new Error('Failed to export report')
      await downloadFromResponse(response, 'sales-report.csv')
      setBanner({ type: 'success', message: 'Report exported successfully' })
    } catch {
      setBanner({ type: 'error', message: 'Failed to export report' })
    }
  }

  const totalQuantity = data.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const totalRevenue = data.reduce((sum, row) => sum + Number(row.total || 0), 0)

  if (companyIdError) {
    return <div className="p-6 text-center text-red-600">{companyIdError}</div>
  }

  if (companyIdLoading || fetchLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Sales Reports</h1>
            <p className="text-sm text-emerald-500 mt-1">Analyze sales activity, customers, and product performance</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={fetchReport}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {banner && (
        <div className={`rounded-2xl border p-4 text-sm ${banner.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {banner.message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchReport}
            className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No report data available for the selected period
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-emerald-50 border-b border-emerald-100 text-emerald-700">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Product/Service</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.id ?? index} className="border-b border-emerald-50 hover:bg-emerald-50/30">
                  <td className="px-4 py-2">{row.date ?? '—'}</td>
                  <td className="px-4 py-2">{row.customer ?? '—'}</td>
                  <td className="px-4 py-2">{row.product ?? row.service ?? '—'}</td>
                  <td className="px-4 py-2 text-right">{Number(row.quantity || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{formatAmount(Number(row.unitPrice || 0))}</td>
                  <td className="px-4 py-2 text-right">{formatAmount(Number(row.total || 0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-emerald-200 font-semibold">
                <td className="px-4 py-2" colSpan={3}>Totals</td>
                <td className="px-4 py-2 text-right">{totalQuantity.toLocaleString()}</td>
                <td className="px-4 py-2" />
                <td className="px-4 py-2 text-right">{formatAmount(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
