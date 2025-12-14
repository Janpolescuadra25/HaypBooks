"use client"
import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/components/CurrencyProvider'
import { useEffect, useState } from 'react'

type Project = { 
  id: string
  name: string
  customerId: string
  hourlyRate?: number
  active: boolean
}

type Customer = { 
  id: string
  name: string 
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const { baseCurrency, formatCurrency } = useCurrency()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ 
    name: '', 
    customerId: '', 
    hourlyRate: '', 
    active: true 
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const [p, c] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/customers?page=1&limit=100').then(r => r.json()).catch(() => ({ customers: [] })),
      ])
      setProjects(p.projects || [])
      setCustomers(c.customers || [])
    })()
  }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.customerId || busy) return
    setBusy(true)
    try {
      const payload = {
        name: form.name,
        customerId: form.customerId,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        active: form.active
      }
      const res = await fetch('/api/projects', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      const j = await res.json()
      if (res.ok) { 
        setProjects(prev => [j.project, ...prev])
        setForm({ name: '', customerId: '', hourlyRate: '', active: true })
      }
    } finally { 
      setBusy(false) 
    }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    setBusy(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const j = await res.json()
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? j.project : p))
        setEditingId(null)
      }
    } finally {
      setBusy(false)
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id))
      }
    } finally {
      setBusy(false)
    }
  }

  function customerName(id: string) { 
    return customers.find(c => c.id === id)?.name || id 
  }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        
        <form onSubmit={createProject} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
          <input 
            className="input" 
            placeholder="Project name" 
            aria-label="Project name"
            value={form.name} 
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
            required
          />
          <select 
            className="input" 
            aria-label="Customer" 
            value={form.customerId} 
            onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
            required
          >
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input 
            className="input" 
            type="number" 
            step="0.01" 
            placeholder="Hourly rate (optional)" 
            aria-label="Hourly rate (optional)"
            value={form.hourlyRate} 
            onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} 
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={form.active} 
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} 
            />
            <span>Active</span>
          </label>
          <button 
            className="btn-primary" 
            disabled={!form.name || !form.customerId || busy}
          >
            Add Project
          </button>
        </form>
      </div>

      <div className="glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Hourly Rate</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-gray-200/30">
                <td className="py-2">
                  {editingId === project.id ? (
                    <input 
                      className="input text-sm w-full" 
                      defaultValue={project.name}
                      aria-label="Edit project name"
                      onBlur={e => updateProject(project.id, { name: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          updateProject(project.id, { name: e.currentTarget.value })
                        }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => setEditingId(project.id)}
                    >
                      {project.name}
                    </span>
                  )}
                </td>
                <td className="py-2">{customerName(project.customerId)}</td>
                <td className="py-2 tabular-nums font-mono">
                  {project.hourlyRate ? formatCurrency(project.hourlyRate) : '—'}
                </td>
                <td className="py-2">
                  <button
                    className={`px-2 py-1 text-xs rounded border ${
                      project.active 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                    onClick={() => updateProject(project.id, { active: !project.active })}
                    disabled={busy}
                  >
                    {project.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => setEditingId(editingId === project.id ? null : project.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={() => deleteProject(project.id)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-400" colSpan={5}>
                  No projects yet. Create your first project above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}