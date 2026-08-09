'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Archive } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { accountingService } from '@/services/accounting.service'

type ArchivePeriod = {
  id: string
  status: 'OPEN' | 'CLOSED' | 'LOCKED'
  name?: string
  startDate?: string
  endDate?: string
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

function statusBadgeStyle(status: string) {
  switch (status) {
    case 'OPEN':
      return 'bg-emerald-100 text-emerald-700'
    case 'CLOSED':
      return 'bg-blue-100 text-blue-700'
    case 'LOCKED':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

function getDurationLabel(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const months = Math.floor(diffDays / 30)
  return months >= 1 ? `${diffDays} days (${months} months)` : `${diffDays} days`
}

export default function CloseArchivePage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [periods, setPeriods] = useState<ArchivePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await accountingService.listPeriods(companyId)
      const periodsData = Array.isArray(data) ? data : (data?.data ?? [])
      setPeriods((periodsData as ArchivePeriod[]).filter((period) => period.status === 'CLOSED' || period.status === 'LOCKED'))
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr?.message || 'Failed to load archive periods')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchPeriods()
  }, [companyId, companyLoading, fetchPeriods])

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Close Archive</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchPeriods()}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Period Name</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Start Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">End Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Closed At</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No items found.</td>
              </tr>
            ) : (
              periods.map((period) => (
                <tr key={period.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{period.name ?? 'Untitled Period'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(period.startDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(period.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyle(period.status)}`}>
                      {period.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{period.closedAt ? formatDateTime(period.closedAt) : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{getDurationLabel(period.startDate, period.endDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
