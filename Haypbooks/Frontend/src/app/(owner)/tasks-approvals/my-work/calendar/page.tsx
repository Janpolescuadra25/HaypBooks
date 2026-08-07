'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { tasksApprovalsService } from '@/services/tasks-approvals.service'

const TASK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-slate-50 text-slate-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
  on_hold: { label: 'On Hold', color: 'bg-amber-50 text-amber-700' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-50 text-slate-600' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  high: { label: 'High', color: 'bg-rose-50 text-rose-700' },
  urgent: { label: 'Urgent', color: 'bg-rose-100 text-rose-800' },
}

function formatType(type?: string) {
  if (!type) return '—'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase())
}

export default function CalendarPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const response = await tasksApprovalsService.listTasks(companyId)
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []
      setData(taskData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load calendar tasks')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const groupedData = useMemo(() => {
    if (!data.length) return []

    const groups: Record<string, any[]> = {}
    const sorted = [...data].sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return da - db
    })

    for (const item of sorted) {
      const dateKey = item.dueDate ? format(new Date(item.dueDate), 'yyyy-MM-dd') : 'No Due Date'
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(item)
    }

    return Object.entries(groups)
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  if (loading || companyLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Calendar</h2>
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

      {groupedData.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="px-4 py-12 text-center text-sm text-slate-500">No tasks scheduled.</div>
        </div>
      ) : (
        groupedData.map((group) => (
          <div key={group.date} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">
                {group.date === 'No Due Date'
                  ? 'No Due Date'
                  : group.date === today
                  ? 'Today'
                  : group.date === tomorrow
                  ? 'Tomorrow'
                  : format(new Date(group.date), 'EEEE, MMM d, yyyy')}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {group.tasks.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-800">{item.title || '—'}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_LABELS[item.priority]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {PRIORITY_LABELS[item.priority]?.label || item.priority || '—'}
                    </span>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TASK_STATUS_LABELS[item.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                    {TASK_STATUS_LABELS[item.status]?.label || item.status || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
