'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, ArrowLeftRight, Shield, FileText } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { taxService } from '@/services/tax.service'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'

function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export default function TaxSummaryPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [from, setFrom] = useState(() => `${new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)}`)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data: summary } = await taxService.getSummary(companyId, { from, to })
      setSummary(summary)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax summary data')
    } finally {
      setLoading(false)
    }
  }, [companyId, from, to])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchSummary()
  }, [companyLoading, companyId, fetchSummary])

  const netVatClass = summary?.netVat > 0 ? 'text-rose-700' : 'text-emerald-700'

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Tax Summary Report</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Output VAT Collected',
            value: summary?.outputVat ?? 0,
            icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
            cardClass: 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'Input VAT Paid',
            value: summary?.inputVat ?? 0,
            icon: <TrendingDown className="h-5 w-5 text-blue-600" />,
            cardClass: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Net VAT',
            value: summary?.netVat ?? 0,
            icon: <ArrowLeftRight className="h-5 w-5 text-slate-600" />,
            cardClass: summary?.netVat > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'Total Withholding',
            value: summary?.totalWithholding ?? 0,
            icon: <Shield className="h-5 w-5 text-amber-600" />,
            cardClass: 'bg-amber-50 text-amber-700',
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-5 ${card.cardClass}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 p-3 text-current">{card.icon}</div>
              <div>
                <p className="text-sm font-medium text-slate-700">{card.label}</p>
                <p className="text-2xl font-bold">{formatCurrency(card.value, currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Summary Breakdown</h2>
        </div>
        <table className="w-full">
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 text-slate-600">Output VAT Collected</td>
              <td className="px-4 py-3 text-right text-slate-900 font-medium">{formatCurrency(summary?.outputVat ?? 0, currency)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600">Less: Input VAT Paid</td>
              <td className="px-4 py-3 text-right text-slate-900 font-medium">-{formatCurrency(summary?.inputVat ?? 0, currency)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600">Net VAT</td>
              <td className={`px-4 py-3 text-right font-semibold ${netVatClass}`}>{formatCurrency(summary?.netVat ?? 0, currency)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600">Total Withholding Tax</td>
              <td className="px-4 py-3 text-right text-slate-900 font-medium">{formatCurrency(summary?.totalWithholding ?? 0, currency)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600">VAT Payable</td>
              <td className={`px-4 py-3 text-right font-semibold ${summary?.vatPayable > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>{formatCurrency(summary?.vatPayable ?? 0, currency)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600">VAT Refundable</td>
              <td className={`px-4 py-3 text-right font-semibold ${summary?.vatRefundable > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>{formatCurrency(summary?.vatRefundable ?? 0, currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="px-4 py-3 text-slate-600 font-semibold">Report generated at</td>
              <td className="px-4 py-3 text-right text-slate-500">{summary?.generatedAt ? formatDateTime(summary.generatedAt) : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
