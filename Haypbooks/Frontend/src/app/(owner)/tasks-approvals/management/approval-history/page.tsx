'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { History, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { tasksApprovalsService } from '@/services/tasks-approvals.service'

const HISTORY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
}

const HISTORY_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ApprovalHistoryPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [historyFilter, setHistoryFilter] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await tasksApprovalsService.listApprovals(companyId)
      const approvalData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []
      setData(approvalData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load approval history')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data
    .filter((item: any) => item.status === 'approved' || item.status === 'rejected')
    .filter((item: any) => {
      if (!historyFilter) return true
      return item.status === historyFilter
    })
    .filter((item: any) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.requesterName && item.requesterName.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q))
      )
    })

  if (loading || companyLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Approval History</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {HISTORY_FILTER_OPTIONS.map((option) => {
          const active = historyFilter === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setHistoryFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search approval history..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TITLE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">REQUESTER</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">AMOUNT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SUBMITTED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">REASON</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  {searchQuery || historyFilter
                    ? 'No approval history matches your filters.'
                    : 'No approval history found.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.type
                      ? item.type.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.title || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.requesterName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.currency || 'USD',
                    }).format(item.amount || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${HISTORY_STATUS_LABELS[item.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {HISTORY_STATUS_LABELS[item.status]?.label || item.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.submittedAt ? format(new Date(item.submittedAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.status === 'rejected' ? item.rejectionReason || '—' : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
