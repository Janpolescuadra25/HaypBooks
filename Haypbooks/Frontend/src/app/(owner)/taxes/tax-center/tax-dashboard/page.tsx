'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, ArrowLeftRight, Shield } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { taxService } from '@/services/tax.service'
import { formatCurrency } from '@/lib/format'

const STATUS_STYLES: Record<string, string> = {
  overdue: 'bg-rose-100 text-rose-700',
  upcoming: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-slate-100 text-slate-600',
}

function formatDueDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TaxDashboardPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [from, setFrom] = useState(() => `${new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)}`)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<any | null>(null)
  const [calendar, setCalendar] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: summary }, { data: calendar }] = await Promise.all([
        taxService.getSummary(companyId, { from, to }),
        taxService.getCalendar(companyId, new Date(from).getFullYear()),
      ])
      setSummary(summary)
      setCalendar(calendar)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax dashboard data')
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

  const sortedDeadlines = useMemo(() => {
    if (!calendar?.deadlines) return []
    return [...calendar.deadlines].sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [calendar])

  const today = useMemo(() => new Date(), [])

  const getStatus = (dueDate: string) => {
    const due = new Date(dueDate)
    const diff = due.getTime() - today.getTime()
    if (diff < 0) return 'overdue'
    if (diff <= 7 * 24 * 60 * 60 * 1000) return 'upcoming'
    return 'scheduled'
  }

  const kpiCards = [
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
  ]

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
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tax Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your tax obligations and filing deadlines</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
          <h2 className="text-sm font-semibold text-slate-800">Filing Calendar</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !sortedDeadlines.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-sm">No calendar deadlines available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Form Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedDeadlines.map((deadline: any) => {
                  const status = getStatus(deadline.dueDate)
                  return (
                    <tr key={`${deadline.formType}-${deadline.dueDate}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold font-mono text-slate-700">
                          {deadline.formType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{deadline.description}</td>
                      <td className="px-5 py-3 text-slate-600">{formatDueDate(deadline.dueDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                          {status === 'overdue' ? 'Overdue' : status === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                        </span>
                      </td>
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
