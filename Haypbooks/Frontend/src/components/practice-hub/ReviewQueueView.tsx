'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, RotateCcw } from 'lucide-react'
import apiClient from '@/lib/api-client'

type ReviewTask = {
  id: string
  title: string
  priority: string
  companyId?: string | null
  dueDate?: string | null
  updatedAt?: string | null
  assignee?: { user?: { name?: string | null; email?: string | null } } | null
}

type ClientOption = { companyId: string; companyName: string }

function requestError(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

export default function ReviewQueueView() {
  const [tasks, setTasks] = useState<ReviewTask[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const clientNames = useMemo(() => new Map(clients.map((client) => [client.companyId, client.companyName])), [clients])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reviewResponse, clientResponse] = await Promise.all([
        apiClient.get('/api/practice-hub/reviews', { params: { page, limit: 10 } }),
        apiClient.get('/api/practice-hub/clients'),
      ])
      setTasks(reviewResponse.data?.tasks ?? [])
      setTotal(reviewResponse.data?.total ?? 0)
      setTotalPages(Math.max(reviewResponse.data?.totalPages ?? 1, 1))
      setClients(Array.isArray(clientResponse.data) ? clientResponse.data : [])
    } catch (reviewError) {
      setError(requestError(reviewError, 'Unable to load the review queue'))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  const decide = async (task: ReviewTask, decision: 'approve' | 'changes') => {
    setUpdatingId(task.id)
    setError(null)
    try {
      await apiClient.patch(`/api/practice-hub/tasks/${task.id}`, {
        status: decision === 'approve' ? 'DONE' : 'IN_PROGRESS',
      })
      await loadReviews()
    } catch (decisionError) {
      setError(requestError(decisionError, decision === 'approve' ? 'Unable to approve task' : 'Unable to request changes'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Review Queue</h2>
        <p className="mt-1 text-sm text-slate-500">Tasks awaiting supervisor or manager sign-off. {total} item{total === 1 ? '' : 's'} pending.</p>
      </div>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => void loadReviews()} className="font-bold underline">Retry</button></div>}

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div aria-label="Loading reviews" className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center"><p className="font-semibold text-slate-800">No tasks awaiting review</p><p className="mt-2 text-sm text-slate-500">Submitted tasks will appear here for a manager decision.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Submitted / Due</th><th className="px-4 py-3">Decision</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-4 font-semibold text-slate-900">{task.title}</td>
                    <td className="px-4 py-4 text-slate-600">{task.companyId ? clientNames.get(task.companyId) || 'Client' : 'General'}</td>
                    <td className="px-4 py-4 text-slate-600">{task.assignee?.user?.name || task.assignee?.user?.email || 'Unassigned'}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{task.priority}</span></td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(task.dueDate || task.updatedAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => void decide(task, 'approve')} disabled={updatingId === task.id} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{updatingId === task.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve</button>
                      <button type="button" onClick={() => void decide(task, 'changes')} disabled={updatingId === task.id} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"><RotateCcw size={14} /> Request Changes</button>
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
    </div>
  )
}
