'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { timeService } from '@/services/time.service'

const TIMESHEET_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-50 text-slate-600' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-50 text-blue-700' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
}

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!companyId) return

    timeService.listTimesheets(companyId)
      .then(() => undefined)
      .catch(() => undefined)
  }, [companyId])

  const fetchData = useCallback(async () => {
    if (!companyId) return

    setLoading(true)
    setError('')

    try {
      const params: Record<string, string> = {}
      if (statusFilter) {
        params.status = statusFilter
      }
      const response = await timeService.listTimesheets(companyId, Object.keys(params).length ? params : undefined)
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load timesheets')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    return item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Timesheets</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          disabled={loading}
          onClick={() => fetchData()}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full max-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div className="relative md:ml-auto max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Week Start</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Entries</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No timesheets found</td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const statusInfo = TIMESHEET_STATUS_LABELS[item.status]
                const weekDate = item.weekStart || item.startDate

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{weekDate ? format(new Date(weekDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item._count?.entries ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '—'}</td>
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
