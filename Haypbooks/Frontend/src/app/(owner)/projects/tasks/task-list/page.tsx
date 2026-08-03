'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, RefreshCw, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { projectsService } from '@/services/projects.service'

const TASK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  TODO: { label: 'To Do', color: 'bg-slate-50 text-slate-600' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  IN_REVIEW: { label: 'In Review', color: 'bg-amber-50 text-amber-700' },
  DONE: { label: 'Done', color: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-50 text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  HIGH: { label: 'High', color: 'bg-rose-50 text-rose-700' },
}

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    if (!companyId) return

    projectsService.listProjects(companyId, { status: 'ACTIVE' })
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setProjects(data)
      })
      .catch((err: any) => setError(err?.message || 'Failed to load projects'))
  }, [companyId])

  const fetchData = useCallback(async () => {
    if (!companyId || !selectedProjectId) return

    setLoading(true)
    setError('')

    try {
      const params: Record<string, string> = {}
      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await projectsService.listProjectTasks(
        companyId,
        selectedProjectId,
        Object.keys(params).length ? params : undefined,
      )
      const normalized = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      setData(normalized)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedProjectId, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.name?.toLowerCase().includes(q)
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
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Task List</h2>
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
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Select a project...</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full max-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="relative md:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
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
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Task</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedProjectId ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">Select a project to view tasks</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No tasks found</td>
              </tr>
            ) : (
              filteredData.map((task: any) => {
                const statusInfo = TASK_STATUS_LABELS[task.status]
                const priorityInfo = PRIORITY_LABELS[task.priority]

                return (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">{task.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {task.assignedToId ? `${task.assignedToId.slice(0, 8)}...` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {task.priority ? (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                          {priorityInfo?.label || task.priority}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                        {statusInfo?.label || task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '—'}</td>
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
