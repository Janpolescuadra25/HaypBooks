'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { format } from 'date-fns'
import { payrollService } from '@/services/payroll.service'
import { FileText, RefreshCw } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const TIME_OFF_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  VACATION: { label: 'Vacation', color: 'bg-blue-100 text-blue-700' },
  SICK: { label: 'Sick', color: 'bg-amber-100 text-amber-700' },
  UNPAID: { label: 'Unpaid', color: 'bg-slate-100 text-slate-600' },
  OTHER: { label: 'Other', color: 'bg-purple-100 text-purple-700' },
}

const LEAVE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600' },
}

export default function LeaveRequestsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [approvingId, setApprovingId] = useState('')
  const [rejectingId, setRejectingId] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    try {
      setLoading(true)
      setError('')
      const res = await payrollService.listLeaveRequests(
        companyId,
        statusFilter ? { status: statusFilter } : undefined,
      )
      setData(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (requestId: string) => {
    if (!companyId) return
    try {
      setApprovingId(requestId)
      await payrollService.approveLeaveRequest(companyId, requestId)
      toast.success('Leave request approved')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve leave request')
    } finally {
      setApprovingId('')
    }
  }

  const handleReject = async (requestId: string) => {
    if (!companyId) return
    try {
      setRejectingId(requestId)
      await payrollService.rejectLeaveRequest(companyId, requestId)
      toast.success('Leave request rejected')
      await fetchData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject leave request')
    } finally {
      setRejectingId('')
    }
  }

  if (companyLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Leave Requests</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employee</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Start Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">End Date</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Hours</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No leave requests found.</td>
              </tr>
            ) : (
              data.map((item) => {
                const typeInfo = TIME_OFF_TYPE_LABELS[item.timeOffType]
                const statusInfo = LEAVE_STATUS_LABELS[item.status]
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {typeInfo?.label || item.timeOffType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.startDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.endDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.hours != null ? Number(item.hours).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.status === 'PENDING' ? (
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
                            onClick={() => handleReject(item.id)}
                            disabled={rejectingId === item.id || approvingId === item.id}
                            className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                          >
                            {rejectingId === item.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      ) : null}
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
