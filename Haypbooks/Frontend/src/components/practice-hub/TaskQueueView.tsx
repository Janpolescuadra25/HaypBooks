'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, RotateCcw, Send, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import TaskModal from './TaskModal'

type PracticeTask = {
  id: string
  title: string
  description?: string | null
  priority: string
  status: string
  companyId?: string | null
  assigneeId?: string | null
  dueDate?: string | null
  assignee?: { user?: { name?: string | null; email?: string | null } } | null
}

type ClientOption = { companyId: string; companyName: string }
type MemberOption = { userId: string; user: { name?: string | null; email: string } }

const badgeStyles: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-sky-100 text-sky-700',
  HIGH: 'bg-amber-100 text-amber-800',
  URGENT: 'bg-rose-100 text-rose-700',
  PENDING: 'bg-violet-100 text-violet-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  BLOCKED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
}

function readable(value: string) {
  if (value === 'PENDING') return 'Awaiting review'
  if (value === 'DONE') return 'Completed'
  return value.replace(/_/g, ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase())
}

function requestError(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

export default function TaskQueueView() {
  const [tasks, setTasks] = useState<PracticeTask[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<PracticeTask | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const clientNames = useMemo(() => new Map(clients.map((client) => [client.companyId, client.companyName])), [clients])

  const loadOptions = useCallback(async () => {
    try {
      const [clientResponse, memberResponse] = await Promise.all([
        apiClient.get('/api/practice-hub/clients'),
        apiClient.get('/api/practice-hub/members'),
      ])
      setClients(Array.isArray(clientResponse.data) ? clientResponse.data : [])
      setMembers(Array.isArray(memberResponse.data) ? memberResponse.data : [])
    } catch (optionError) {
      setError(requestError(optionError, 'Unable to load task filters'))
    }
  }, [])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/practice-hub/tasks', {
        params: {
          page,
          limit: 10,
          status: status || undefined,
          priority: priority || undefined,
          companyId: companyId || undefined,
          assigneeId: assigneeId || undefined,
          search: search.trim() || undefined,
        },
      })
      setTasks(response.data?.tasks ?? [])
      setTotal(response.data?.total ?? 0)
      setTotalPages(Math.max(response.data?.totalPages ?? 1, 1))
    } catch (taskError) {
      setError(requestError(taskError, 'Unable to load practice tasks'))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [assigneeId, companyId, page, priority, search, status])

  useEffect(() => {
    void loadOptions()
  }, [loadOptions])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const mutateTask = async (task: PracticeTask, action: 'review' | 'delete') => {
    setUpdatingId(task.id)
    setError(null)
    try {
      if (action === 'review') {
        await apiClient.patch(`/api/practice-hub/tasks/${task.id}`, { status: 'PENDING' })
      } else {
        await apiClient.delete(`/api/practice-hub/tasks/${task.id}`)
      }
      await loadTasks()
    } catch (mutationError) {
      setError(requestError(mutationError, action === 'review' ? 'Unable to submit task for review' : 'Unable to delete task'))
    } finally {
      setUpdatingId(null)
    }
  }

  const resetFilters = () => {
    setStatus('')
    setPriority('')
    setCompanyId('')
    setAssigneeId('')
    setSearch('')
    setPage(1)
  }

  const openCreate = () => {
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const inputClass = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">{total} task{total === 1 ? '' : 's'} across your practice and client workspaces.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus size={17} /> New Task
        </button>
      </div>

      <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
        <input aria-label="Search tasks" placeholder="Search tasks" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className={`${inputClass} xl:col-span-2`} />
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className={inputClass}>
          <option value="">All statuses</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="PENDING">Awaiting review</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DONE">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select aria-label="Filter by priority" value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1) }} className={inputClass}>
          <option value="">All priorities</option>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value} value={value}>{readable(value)}</option>)}
        </select>
        <select aria-label="Filter by client" value={companyId} onChange={(event) => { setCompanyId(event.target.value); setPage(1) }} className={inputClass}>
          <option value="">All clients</option>
          {clients.map((client) => <option key={client.companyId} value={client.companyId}>{client.companyName}</option>)}
        </select>
        <select aria-label="Filter by assignee" value={assigneeId} onChange={(event) => { setAssigneeId(event.target.value); setPage(1) }} className={inputClass}>
          <option value="">All assignees</option>
          {members.map((member) => <option key={member.userId} value={member.userId}>{member.user.name || member.user.email}</option>)}
        </select>
        <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 xl:col-start-6">
          <RotateCcw size={15} /> Reset Filters
        </button>
      </div>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => void loadTasks()} className="font-bold underline">Retry</button></div>}

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div aria-label="Loading tasks" className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-slate-800">No tasks found matching current filters</p>
            <p className="mt-2 text-sm text-slate-500">Create a task or adjust the filters to organize upcoming work.</p>
            <button type="button" onClick={openCreate} className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Create Task</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="align-top">
                    <td className="px-4 py-4"><p className="font-semibold text-slate-900">{task.title}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{task.description || 'No description'}</p></td>
                    <td className="px-4 py-4 text-slate-600">{task.companyId ? clientNames.get(task.companyId) || 'Client' : 'General'}</td>
                    <td className="px-4 py-4 text-slate-600">{task.assignee?.user?.name || task.assignee?.user?.email || 'Unassigned'}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeStyles[task.priority] || badgeStyles.MEDIUM}`}>{readable(task.priority)}</span></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeStyles[task.status] || badgeStyles.IN_PROGRESS}`}>{readable(task.status)}</span></td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-2">
                      <button type="button" aria-label={`Edit ${task.title}`} onClick={() => { setSelectedTask(task); setIsModalOpen(true) }} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={15} /></button>
                      {task.status !== 'PENDING' && task.status !== 'DONE' && <button type="button" aria-label={`Submit ${task.title} for review`} onClick={() => void mutateTask(task, 'review')} disabled={updatingId === task.id} className="rounded-lg border border-violet-200 p-2 text-violet-700 hover:bg-violet-50 disabled:opacity-50"><Send size={15} /></button>}
                      <button type="button" aria-label={`Delete ${task.title}`} onClick={() => void mutateTask(task, 'delete')} disabled={updatingId === task.id} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50">{updatingId === task.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>Page {page} of {totalPages} · {total} total</span>
        <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-xl border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-xl border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40">Next</button></div>
      </div>

      <TaskModal isOpen={isModalOpen} task={selectedTask} onClose={() => setIsModalOpen(false)} onSuccess={() => void loadTasks()} />
    </div>
  )
}
