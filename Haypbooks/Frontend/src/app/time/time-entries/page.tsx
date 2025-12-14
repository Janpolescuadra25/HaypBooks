"use client"
import { formatNumber } from '@/lib/format'
import { useCurrency } from '@/components/CurrencyProvider'
import { useEffect, useMemo, useState } from 'react'

type Project = { id: string; name: string; customerId: string; hourlyRate?: number }
type Customer = { id: string; name: string }
type TimeEntry = { id: string; customerId: string; projectId?: string; date: string; hours: number; description?: string; amount: number; status: 'unbilled'|'billed'|'nonbillable'; _selected?: boolean }

export default function TimeEntriesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const { baseCurrency, formatCurrency } = useCurrency()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ customerId: '', projectId: '', date: '', hours: '', description: '' })
  const [filter, setFilter] = useState<'all'|'unbilled'|'billed'|'nonbillable'>('all')
  const unbilledSelected = useMemo(()=> entries.filter(e=>e.status==='unbilled' && e._selected), [entries]) as any
  const selectionMeta = useMemo(() => {
    const sel = entries.filter(e => e._selected && e.status === 'unbilled')
    const customerIds = new Set(sel.map(e => e.customerId))
    return {
      count: sel.length,
      singleCustomerId: customerIds.size === 1 ? Array.from(customerIds)[0] : null,
      multipleCustomers: customerIds.size > 1,
      hours: sel.reduce((s, e) => s + Number(e.hours || 0), 0),
      amount: sel.reduce((s, e) => s + Number(e.amount || 0), 0),
    }
  }, [entries])

  useEffect(() => {
    ;(async () => {
      const [p, c, t] = await Promise.all([
        fetch('/api/projects').then(r=>r.json()),
        fetch('/api/customers?page=1&limit=100').then(r=>r.json()).catch(()=>({ customers: [] })),
        fetch('/api/time/entries').then(r=>r.json()),
      ])
      setProjects(p.projects || [])
      setCustomers(c.customers || [])
      setEntries((t.timeEntries || []).map((e:any)=>({ ...e, _selected: false })))
    })()
  }, [])

  async function createEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerId || !form.date || !form.hours || busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/time/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: form.customerId, projectId: form.projectId || undefined, date: form.date, hours: Number(form.hours), description: form.description }) })
      const j = await res.json()
      if (res.ok) { setEntries(prev=> [{ ...j.timeEntry, _selected: false }, ...prev]); setForm({ customerId: '', projectId: '', date: '', hours: '', description: '' }) }
    } finally { setBusy(false) }
  }

  async function convertSelected() {
    const ids = entries.filter((e:any)=> e._selected && e.status==='unbilled').map(e=>e.id)
    if (ids.length === 0) return
    setBusy(true)
    try {
      const res = await fetch('/api/time/invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryIds: ids }) })
      if (res.ok) {
        // Refresh entries list
        const t = await fetch('/api/time/entries').then(r=>r.json())
        setEntries((t.timeEntries || []).map((e:any)=>({ ...e, _selected: false })))
      }
    } finally { setBusy(false) }
  }

  function customerName(id: string) { return customers.find(c=>c.id===id)?.name || id }
  function projectName(id?: string) { return projects.find(p=>p.id===id)?.name || '' }

  const filtered = entries.filter(e => filter==='all' ? true : e.status === filter)

  return (
    <div className="space-y-4">

      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Time entries</h2>
          <div className="flex items-center gap-2">
            <select className="input" aria-label="Filter" value={filter} onChange={e=>setFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="unbilled">Unbilled</option>
              <option value="billed">Billed</option>
              <option value="nonbillable">Non-billable</option>
            </select>
            <button
              className="btn-primary"
              onClick={convertSelected}
              disabled={busy || selectionMeta.count === 0 || !selectionMeta.singleCustomerId}
              title={!selectionMeta.singleCustomerId && selectionMeta.count > 0 ? 'Select entries for a single customer' : ''}
            >
              Create Invoice from selected
            </button>
          </div>
        </div>
        {selectionMeta.count > 0 && (
          <div className="mb-3 text-sm text-gray-300 flex items-center gap-4">
            <span>{selectionMeta.count} selected</span>
            <span>Hours: <span className="tabular-nums font-mono">{formatNumber(selectionMeta.hours, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
            <span>Amount: <span className="tabular-nums font-mono">{formatCurrency(selectionMeta.amount)}</span></span>
            {selectionMeta.multipleCustomers && (
              <span className="text-amber-400">Select entries for a single customer to create an invoice.</span>
            )}
          </div>
        )}
        <form onSubmit={createEntry} className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <select className="input" aria-label="Customer" value={form.customerId} onChange={e=>setForm(f=>({ ...f, customerId: e.target.value }))}>
            <option value="">Select customer</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" aria-label="Project" value={form.projectId} onChange={e=>setForm(f=>({ ...f, projectId: e.target.value }))}>
            <option value="">No project</option>
            {projects.filter(p=> !form.customerId || p.customerId === form.customerId).map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" type="date" aria-label="Date" value={form.date} onChange={e=>setForm(f=>({ ...f, date: e.target.value }))} />
          <input className="input" type="number" step="0.25" placeholder="Hours" value={form.hours} onChange={e=>setForm(f=>({ ...f, hours: e.target.value }))} />
          <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} />
          <button className="btn-primary" disabled={!form.customerId || !form.date || !form.hours || busy}>Add</button>
        </form>
      </div>

      <div className="glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th></th>
              <th className="py-2">Date</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Project</th>
              <th className="py-2">Hours</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e: any) => (
              <tr key={e.id} className="border-t border-gray-200/30">
                <td className="py-2"><input type="checkbox" aria-label="select" disabled={e.status!=='unbilled'} checked={!!e._selected} onChange={ev=> setEntries(prev => prev.map(x => x.id === e.id ? { ...x, _selected: ev.target.checked } : x))} /></td>
                <td className="py-2">{e.date.slice(0,10)}</td>
                <td className="py-2">{customerName(e.customerId)}</td>
                <td className="py-2">{projectName(e.projectId)}</td>
                <td className="py-2 tabular-nums font-mono">{formatNumber(Number(e.hours || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-2 tabular-nums font-mono">{formatCurrency(Number(e.amount ?? 0))}</td>
                <td className="py-2">{e.status}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="py-6 text-center text-gray-400" colSpan={7}>No entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
