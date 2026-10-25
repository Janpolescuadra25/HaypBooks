'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import apiClient from '@/lib/api-client'

type PracticeTask = {
  id: string
  title: string
  description?: string | null
  priority: string
  status: string
  companyId?: string | null
  assigneeId?: string | null
  dueDate?: string | null
}

type TaskModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  task?: PracticeTask | null
}

type ClientOption = { companyId: string; companyName: string }
type MemberOption = { userId: string; user: { name?: string | null; email: string } }

const initialForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'IN_PROGRESS',
  companyId: '',
  assigneeId: '',
  dueDate: '',
}

function errorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

export default function TaskModal({ isOpen, onClose, onSuccess, task }: TaskModalProps) {
  const [form, setForm] = useState(initialForm)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setForm(
      task
        ? {
            title: task.title ?? '',
            description: task.description ?? '',
            priority: task.priority ?? 'MEDIUM',
            status: task.status ?? 'IN_PROGRESS',
            companyId: task.companyId ?? '',
            assigneeId: task.assigneeId ?? '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
          }
        : initialForm,
    )
    setError(null)
    setLoadingOptions(true)

    void Promise.all([
      apiClient.get('/api/practice-hub/clients'),
      apiClient.get('/api/practice-hub/members'),
    ])
      .then(([clientsResponse, membersResponse]) => {
        setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : [])
        setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : [])
      })
      .catch((requestError) => {
        setError(errorMessage(requestError, 'Unable to load clients and team members'))
      })
      .finally(() => setLoadingOptions(false))
  }, [isOpen, task])

  if (!isOpen) return null

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Task title is required')
      return
    }

    setSubmitting(true)
    setError(null)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      companyId: form.companyId || null,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00`).toISOString() : null,
    }

    try {
      if (task) {
        await apiClient.patch(`/api/practice-hub/tasks/${task.id}`, payload)
      } else {
        await apiClient.post('/api/practice-hub/tasks', payload)
      }
      onSuccess()
      onClose()
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to save task'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-modal-title" className="text-2xl font-bold text-slate-950">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Organize client work, ownership, priority, and due dates.</p>
          </div>
          <button
            type="button"
            aria-label="Close task dialog"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input
              aria-label="Task title"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className={inputClass}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Description
            <textarea
              aria-label="Task description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`${inputClass} min-h-24 resize-y`}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Priority
              <select aria-label="Task priority" value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className={inputClass}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Status
              <select aria-label="Task status" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={inputClass}>
                <option value="IN_PROGRESS">In progress</option>
                <option value="PENDING">Awaiting review</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Client
              <select aria-label="Task client" value={form.companyId} onChange={(event) => updateField('companyId', event.target.value)} className={inputClass} disabled={loadingOptions}>
                <option value="">General practice task</option>
                {clients.map((client) => <option key={client.companyId} value={client.companyId}>{client.companyName}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Assignee
              <select aria-label="Task assignee" value={form.assigneeId} onChange={(event) => updateField('assigneeId', event.target.value)} className={inputClass} disabled={loadingOptions}>
                <option value="">Unassigned</option>
                {members.map((member) => <option key={member.userId} value={member.userId}>{member.user.name || member.user.email}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700 sm:max-w-xs">
            Due date
            <input aria-label="Task due date" type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} className={inputClass} />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting || loadingOptions} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
