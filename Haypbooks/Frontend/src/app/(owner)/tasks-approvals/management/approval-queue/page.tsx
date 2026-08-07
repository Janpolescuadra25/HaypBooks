'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastProvider'
import { ListChecks, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { tasksApprovalsService } from '@/services/tasks-approvals.service'
import RejectionReasonModal from '@/components/shared/RejectionReasonModal'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
  on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-600' },
  delegated: { label: 'Delegated', color: 'bg-blue-50 text-blue-600' },
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'on_hold', 'delegated']

export default function ApprovalQueuePage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [approvingId, setApprovingId] = useState('')
  const [rejectingId, setRejectingId] = useState('')
  const [rejectionModal, setRejectionModal] = useState({ open: false, id: '' })

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await tasksApprovalsService.listApprovals(
        companyId,
        statusFilter ? { status: statusFilter } : undefined,
      )
      const approvalData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []
      setData(approvalData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load approval requests')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  async function handleApprove(id: string) {
    if (!companyId) return
    setApprovingId(id)

    try {
      await tasksApprovalsService.approveRequest(companyId, id)
      toast.success('Approval request approved')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve request')
    } finally {
      setApprovingId('')
    }
  }

  async function handleRejectConfirm(reason: string) {
    if (!companyId || !rejectionModal.id) return
    setRejectingId(rejectionModal.id)

    try {
      await tasksApprovalsService.rejectRequest(companyId, rejectionModal.id, { reason })
      toast.success('Approval request rejected')
      setRejectionModal({ open: false, id: '' })
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject request')
    } finally {
      setRejectingId('')
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (statusFilter && item.status !== statusFilter) return false
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
          <ListChecks className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Approval Queue</h2>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search approvals..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${statusFilter === 'pending' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Pending
          </button>
          {STATUS_OPTIONS.filter((status) => status !== 'pending').map((status) => {
            const active = statusFilter === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {STATUS_LABELS[status]?.label || status}
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TYPE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">TITLE</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">REQUESTER</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">AMOUNT</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">SUBMITTED</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">PENDING</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">STATUS</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  {searchQuery || statusFilter
                    ? 'No approval requests match your filters.'
                    : 'No approval requests found.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const typeLabel = item.type
                  ? item.type.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
                  : '—'
                const daysPendingClass = item.daysPending > 7 ? 'text-rose-600 font-medium' : ''
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{typeLabel}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.title || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.requesterName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: item.currency || 'USD',
                      }).format(item.amount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.submittedAt ? format(new Date(item.submittedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm ${daysPendingClass}`}>{item.daysPending ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_LABELS[item.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[item.status]?.label || item.status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            disabled={approvingId === item.id}
                            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            {approvingId === item.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectionModal({ open: true, id: item.id })}
                            disabled={rejectingId === item.id || approvingId === item.id}
                            className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                          >
                            {rejectingId === item.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <RejectionReasonModal
        open={rejectionModal.open}
        onClose={() => setRejectionModal({ open: false, id: '' })}
        onConfirm={handleRejectConfirm}
        title="Reject Approval Request"
        description="Please provide a reason for rejecting this request."
      />
    </div>
  )
}
