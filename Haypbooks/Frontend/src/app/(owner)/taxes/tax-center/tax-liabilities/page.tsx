'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, FileCheck } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { taxService } from '@/services/tax.service'

const STATUS_OPTIONS = ['All', 'PENDING', 'DUE', 'FILED', 'PAID', 'OVERDUE', 'VOID'] as const

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  DUE: 'bg-amber-100 text-amber-700',
  FILED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
  VOID: 'bg-slate-100 text-slate-400',
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

export default function TaxLiabilitiesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()

  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiabilities = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const status = statusFilter === 'All' ? undefined : statusFilter
      const { data } = await taxService.getLiabilities(companyId, status)
      const liabilitiesData = Array.isArray(data) ? data : (data?.data ?? [])
      setLiabilities(liabilitiesData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax liabilities')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchLiabilities()
  }, [companyLoading, companyId, fetchLiabilities])

  const today = useMemo(() => new Date(), [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tax Liabilities</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track filing obligations and due dates across all tax authorities</p>
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

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Liabilities</h2>
          <button
            onClick={fetchLiabilities}
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
        ) : !liabilities.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <FileCheck className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No {statusFilter === 'All' ? 'tax liabilities' : `${statusFilter.toLowerCase()} liabilities`} found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Form Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Authority</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Filed</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Paid</th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map((liability) => {
                  const due = new Date(liability.dueDate)
                  const isOverdue = liability.status === 'OVERDUE' && due.getTime() < today.getTime()
                  return (
                    <tr key={liability.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold font-mono text-slate-600">
                          {liability.formType}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{liability.authority?.name}</div>
                          <div className="text-xs text-slate-500">{liability.authority?.code}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{formatPeriod(liability.periodStart, liability.periodEnd)}</td>
                      <td className={`px-5 py-3 ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>{formatDate(liability.dueDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[liability.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {liability.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{liability.filedAt ? formatDate(liability.filedAt) : '—'}</td>
                      <td className="px-5 py-3 text-slate-700">{liability.paidAt ? formatDate(liability.paidAt) : '—'}</td>
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
