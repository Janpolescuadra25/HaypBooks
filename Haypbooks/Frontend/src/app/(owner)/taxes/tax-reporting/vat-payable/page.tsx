'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Wallet, FileText } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { taxService } from '@/services/tax.service'
import { formatCurrency } from '@/lib/format'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  READY: 'bg-amber-100 text-amber-700',
  FILED: 'bg-emerald-100 text-emerald-700',
  VOID: 'bg-rose-100 text-rose-700',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPeriod(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()
  const startLabel = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endLabel = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: sameMonth ? undefined : 'numeric' })
  return `${startLabel} – ${endLabel}, ${endDate.getFullYear()}`
}

export default function VatPayablePage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [from, setFrom] = useState(() => `${new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)}`)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<any | null>(null)
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: summaryData }, { data: returnsData }] = await Promise.all([
        taxService.getSummary(companyId, { from, to }),
        taxService.getTaxReturns(companyId),
      ])
      setSummary(summaryData)
      const returnsList = Array.isArray(returnsData) ? returnsData : (returnsData?.data ?? [])
      const filtered = returnsList.filter((item: any) => item.formType?.startsWith('2550') || item.formType?.startsWith('2551'))
      setReturns(filtered.sort((a: any, b: any) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()))
    } catch (err: any) {
      setError(err?.message || 'Failed to load VAT payable data')
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
    fetchData()
  }, [companyLoading, companyId, fetchData])

  const kpiCards = useMemo(() => [
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
      label: 'VAT Payable',
      value: summary?.vatPayable ?? 0,
      icon: <Wallet className="h-5 w-5 text-rose-600" />,
      cardClass: 'bg-rose-50 text-rose-700',
    },
  ], [summary])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">VAT Payable</h1>
          <p className="text-sm text-slate-500 mt-0.5">VAT liability summary and return filing status</p>
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
            onClick={fetchData}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpiCards.map((card) => (
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">VAT Return Filings</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !returns.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <FileText className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No VAT returns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Form Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Authority</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Filing Deadline</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Tax</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Filed Date</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => {
                  const deadline = item.filingDeadline ? new Date(item.filingDeadline) : null
                  const pastDue = deadline && deadline.getTime() < new Date().getTime() && item.status !== 'FILED'
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">{item.formType}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800">{item.authority?.name}</td>
                      <td className="px-5 py-3 text-slate-700">{formatPeriod(item.periodStart, item.periodEnd)}</td>
                      <td className={`px-5 py-3 ${pastDue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>{item.filingDeadline ? formatDate(item.filingDeadline) : '—'}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.totalTax), currency)}</td>
                      <td className="px-5 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status] ?? 'bg-slate-100 text-slate-600'}`}>{item.status}</span></td>
                      <td className="px-5 py-3 text-slate-700">{item.filedAt ? formatDate(item.filedAt) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
