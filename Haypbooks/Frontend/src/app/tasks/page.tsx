"use client"
import React from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<any[]>([])
  React.useEffect(() => { void load() }, [])
  async function load() {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('Failed')
      const d = await res.json()
      setTasks(d || [])
    } catch (e) { setTasks([]) }
  }
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Tasks</h1>
        </div>
      </div>
      <div className="glass-card">
        <ul className="space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-slate-500">{t.description}</div>
                </div>
                <div className="text-sm text-slate-600">{t.status}</div>
              </div>
            </li>
          ))}
          {tasks.length === 0 && (<li className="text-slate-500">No tasks yet.</li>)}
        </ul>
      </div>
    </div>
  )
}

