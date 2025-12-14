"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type Task = {
  id: string
  type: 'overdue-invoice' | 'unpaid-bill' | 'pending-approval' | 'reconciliation' | 'other'
  title: string
  description: string
  dueDate?: string
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
}

export default function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ tasks: Task[] }>('/api/dashboard/tasks')
        setTasks(data.tasks || [])
      } catch (err) {
        console.error('Failed to load tasks', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'overdue-invoice':
        return '⚠️'
      case 'unpaid-bill':
        return '📄'
      case 'pending-approval':
        return '✋'
      case 'reconciliation':
        return '🔄'
      default:
        return '📌'
    }
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Tasks & Reminders</h3>
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-sm text-slate-600">All caught up! No pending tasks.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border ${priorityColor(task.priority)} hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcon(task.type)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-xs text-slate-500">Due: {task.dueDate}</p>
                  )}
                </div>
              </div>
              {task.actionUrl && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <a href={task.actionUrl} className="text-sm font-medium hover:underline">
                    Take action →
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Link href="/tasks" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
            View all tasks →
          </Link>
        </div>
      )}
    </div>
  )
}
