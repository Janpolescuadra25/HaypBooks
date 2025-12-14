"use client"
import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

type Project = { id: string; name: string; customerId: string; hourlyRate?: number; active: boolean }
type Customer = { id: string; name: string }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const { baseCurrency, formatCurrency } = useCurrency()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', customerId: '', hourlyRate: '' })
  const canSave = form.name && form.customerId

  useEffect(() => {
    ;(async () => {
      const [p, c] = await Promise.all([
        fetch('/api/projects', { headers: { 'cookie': 'role=admin' as any } }).then(r=>r.json()),
        fetch('/api/customers?page=1&limit=100').then(r=>r.json()).catch(()=>({ customers: [] })),
      ])
      setProjects(p.projects || [])
      setCustomers(c.customers || [])
    })()
  }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave || busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, customerId: form.customerId, hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined }) })
      const j = await res.json()
      if (res.ok) { setProjects((prev)=> [j.project, ...prev]); setForm({ name: '', customerId: '', hourlyRate: '' }) }
    } finally { setBusy(false) }
  }

  function customerName(id: string) { return customers.find(c=>c.id===id)?.name || id }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        <form onSubmit={createProject} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Project name" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
          <select className="input" aria-label="Customer" value={form.customerId} onChange={e=>setForm(f=>({ ...f, customerId: e.target.value }))}>
            <option value="">Select customer</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input" type="number" step="0.01" placeholder="Hourly rate (optional)" value={form.hourlyRate} onChange={e=>setForm(f=>({ ...f, hourlyRate: e.target.value }))} />
          <button className="btn-primary" disabled={!canSave || busy}>Create</button>
        </form>
      </div>

      <div className="glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Hourly Rate</th>
              <th className="py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t border-gray-200/30">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{customerName(p.customerId)}</td>
                <td className="py-2 tabular-nums font-mono">{typeof p.hourlyRate === 'number' ? formatCurrency(p.hourlyRate) : '—'}</td>
                <td className="py-2">{p.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td className="py-6 text-center text-gray-400" colSpan={4}>No projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
