'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ScrollText } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { taxService } from '@/services/tax.service'
import { formatCurrency } from '@/lib/format'

const STATUS_OPTIONS = ['All', 'DRAFT', 'READY', 'FILED', 'VOID'] as const

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

export default function TaxReturnsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [formTypeSearch, setFormTypeSearch] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReturns = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const opts: any = {}
      if (statusFilter !== 'All') opts.status = statusFilter
      if (searchValue.trim()) opts.formType = searchValue.trim()
      const { data } = await taxService.getTaxReturns(companyId, opts)
      const returnsData = Array.isArray(data) ? data : (data?.data ?? [])
      setReturns(returnsData.sort((a: any, b: any) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()))
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax returns')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter, searchValue])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchReturns()
  }, [companyLoading, companyId, fetchReturns])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tax Returns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all tax return filings and payment status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = option === statusFilter
            return (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={formTypeSearch}
          onChange={(e) => setFormTypeSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setSearchValue(formTypeSearch) }}
          placeholder="Search form type..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          onClick={() => setSearchValue(formTypeSearch)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Apply
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Tax Returns</h2>
          <button
            onClick={fetchReturns}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !returns.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ScrollText className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No {statusFilter === 'All' ? 'tax returns' : `${statusFilter.toLowerCase()} returns`} found</p>
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
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payments</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => {
                  const deadline = item.filingDeadline ? new Date(item.filingDeadline) : null
                  const pastDue = deadline && deadline.getTime() < new Date().getTime() && item.status !== 'FILED'
                  const totalPaid = item.payments?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) ?? 0
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">{item.formType}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800">{item.authority?.name}</td>
                      <td className="px-5 py-3 text-slate-700">{formatPeriod(item.periodStart, item.periodEnd)}</td>
                      <td className={`px-5 py-3 ${pastDue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>{item.filingDeadline ? formatDate(item.filingDeadline) : '—'}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-medium">{formatCurrency(Number(item.totalTax), currency)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status] ?? 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{item.payments?.length ? `${item.payments.length} payments — ${formatCurrency(totalPaid, currency)}` : '—'}</td>
                      <td className="px-5 py-3 text-slate-700 font-mono text-[11px]">{item.referenceNumber ?? '—'}</td>
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
