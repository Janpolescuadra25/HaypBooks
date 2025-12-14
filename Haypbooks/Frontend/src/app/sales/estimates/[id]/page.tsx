"use client"
import { useEffect, useState } from 'react'
import { api } from '../../../../lib/client-api'
import BackBar from '@/components/BackBar'
import { useRouter, useParams } from 'next/navigation'
import toHref from '@/lib/route'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

type Estimate = { id: string; number: string; customerId: string; status: string; date: string; total: number; expiryDate?: string; terms?: string; lines: { description: string; amount: number }[] }
type Customer = { id: string; name: string }

export default function EstimateDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [est, setEst] = useState<Estimate | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [{ estimate }, cust] = await Promise.all([
          api<{ estimate: Estimate }>(`/api/estimates/${encodeURIComponent(id)}`),
          api<{ rows: Customer[] }>(`/api/customers`),
        ])
        setEst(estimate)
        setCustomers(cust.rows || [])
      } catch (e: any) { setError(e?.message || 'Failed to load estimate') }
    }
    if (id) load()
  }, [id])

  function setLine(i: number, patch: Partial<{ description: string; amount: number }>) {
    if (!est) return
    setEst({ ...est, lines: est.lines.map((l, idx) => idx === i ? { ...l, ...patch } : l) })
  }
  function addLine() { if (!est) return; setEst({ ...est, lines: [...est.lines, { description: '', amount: 0 }] }) }
  function removeLine(i: number) { if (!est) return; setEst({ ...est, lines: est.lines.filter((_, idx) => idx !== i) }) }
  const total = (est?.lines || []).reduce((s,l)=> s + (Number(l.amount)||0), 0)

  async function save() {
    if (!est) return
    setSaving(true)
    setError(null)
    try {
      await api(`/api/estimates/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...est, total: undefined }) })
      router.push(toHref('/sales/estimates'))
    } catch (e: any) { setError(e?.message || 'Failed to save') } finally { setSaving(false) }
  }
  async function convert() {
    try {
      await api(`/api/estimates/${encodeURIComponent(id)}/convert`, { method: 'POST', body: JSON.stringify({}) })
      router.push(toHref('/invoices'))
    } catch (e: any) { setError(e?.message || 'Failed to convert') }
  }

  if (!est) return (
    <div className="glass-card"><BackBar href="/sales/estimates" /><div className="p-4">Loading…</div></div>
  )

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <BackBar href="/sales/estimates" />
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-slate-900">Edit Estimate</h1>
        </div>
        {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm">Number
            <input className="input" value={est.number} onChange={e=>setEst({ ...est, number: e.target.value })} />
          </label>
          <label className="text-sm">Customer
            <select className="input" value={est.customerId} onChange={e=>setEst({ ...est, customerId: e.target.value })}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Date
            <input className="input bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" type="date" value={est.date.slice(0,10)} onChange={e=>setEst({ ...est, date: e.target.value })} />
          </label>
          <label className="text-sm">Expiry Date
            <input className="input bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" type="date" value={est.expiryDate?.slice(0,10) || ''} onChange={e=>setEst({ ...est, expiryDate: e.target.value })} />
          </label>
          <label className="text-sm md:col-span-2">Terms
            <input className="input" placeholder="e.g., Net 30" value={est.terms || ''} onChange={e=>setEst({ ...est, terms: e.target.value })} />
          </label>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Line Items</h2>
            <button className="btn-secondary !px-2 !py-1 text-xs" onClick={addLine}>Add line</button>
          </div>
          <div className="space-y-2">
            {est.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-8 gap-2 items-center">
                <input className="input md:col-span-6" placeholder="Description" value={l.description} onChange={e=>setLine(i,{ description: e.target.value })} />
                <input className="input md:col-span-1" type="number" step="0.01" placeholder="Amount" value={l.amount} onChange={e=>setLine(i,{ amount: Number(e.target.value) })} />
                <button className="btn-danger !px-2 !py-1 text-xs md:col-span-1" onClick={()=>removeLine(i)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="text-right text-sm mt-2">Total: <span className="font-semibold"><Amount value={Number(total||0)} /></span></div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          {est.status !== 'converted' && <button className="btn-secondary" onClick={convert}>Convert to Invoice</button>}
          <button className="btn-secondary" onClick={()=>router.back()} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
