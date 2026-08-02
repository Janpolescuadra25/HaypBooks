'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Archive } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { accountingService } from '@/services/accounting.service'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
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
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await accountingService.listPeriods(companyId)
      const periodsData = Array.isArray(data) ? data : (data?.data ?? [])
      setPeriods(periodsData.filter((period: any) => period.status === 'CLOSED' || period.status === 'LOCKED'))
    } catch (err: any) {
      setError(err?.message || 'Failed to load archive periods')
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

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Close Archive</h1>
        <p className="text-sm text-slate-500 mt-0.5">History of all closed and locked accounting periods</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !periods.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Archive className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No closed periods in the archive</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Period Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Start Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">End Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Closed At</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duration</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{period.name ?? 'Untitled Period'}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(period.startDate)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(period.endDate)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyle(period.status)}`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{period.closedAt ? formatDateTime(period.closedAt) : '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{getDurationLabel(period.startDate, period.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
