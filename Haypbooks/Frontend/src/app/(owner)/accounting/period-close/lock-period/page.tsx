'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Lock, Unlock } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { accountingService } from '@/services/accounting.service'

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

export default function LockPeriodPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  const fetchPeriods = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await accountingService.listPeriods(companyId)
      const periodsData = Array.isArray(data) ? data : (data?.data ?? [])
      setPeriods(periodsData)
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr?.message || 'Failed to load accounting periods')
    } finally {
      setLoading(false)
      setActiveActionId(null)
    }
  }, [companyId])

  const handleClose = async (periodId: string) => {
    if (!companyId) return
    if (!window.confirm('Closing this period will prevent new entries. Are you sure?')) return
    setActiveActionId(periodId)
    setError(null)
    try {
      await accountingService.closePeriod(companyId, periodId)
      await fetchPeriods()
    } catch (err: unknown) {
      console.error('Error closing period:', err)
      setError('Failed to close period. Please try again.')
      setActiveActionId(null)
    }
  }

  const handleReopen = async (periodId: string) => {
    if (!companyId) return
    if (!window.confirm('Reopening this period will allow new entries again. Are you sure?')) return
    setActiveActionId(periodId)
    setError(null)
    try {
      await accountingService.reopenPeriod(companyId, periodId)
      await fetchPeriods()
    } catch (err: unknown) {
      console.error('Error reopening period:', err)
      setError('Failed to reopen period. Please try again.')
      setActiveActionId(null)
    }
  }

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
          <Lock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Lock Period</h2>
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
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No items found.</td>
              </tr>
            ) : (
              periods.map((period) => {
                const isActionLoading = activeActionId === period.id
                return (
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
                    <td className="px-4 py-3">
                      {period.status === 'OPEN' ? (
                        <button
                          type="button"
                          onClick={() => handleClose(period.id)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                        >
                          {isActionLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                          Close
                        </button>
                      ) : period.status === 'CLOSED' ? (
                        <button
                          type="button"
                          onClick={() => handleReopen(period.id)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {isActionLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                          Reopen
                        </button>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
