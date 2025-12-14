"use client"
import { useEffect, useState } from 'react'
import { api } from '../../../../lib/client-api'
import BackBar from '@/components/BackBar'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
import { useRouter } from 'next/navigation'

type Customer = { id: string; name: string }

export default function NewEstimatePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [number, setNumber] = useState('EST-' + Math.floor(Math.random()*9000+1000))
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [terms, setTerms] = useState<string>('')
  const [lines, setLines] = useState<Array<{ description: string; amount: number }>>([{ description: '', amount: 0 }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ rows: Customer[] }>(`/api/customers`)
      .then((d: { rows: Customer[] }) => setCustomers(d.rows || []))
      .catch((e: unknown) => setError((e as any)?.message ?? 'Failed to load customers'))
  }, [])

  function setLine(i: number, patch: Partial<{ description: string; amount: number }>) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }
  function addLine() { setLines(prev => [...prev, { description: '', amount: 0 }]) }
  function removeLine(i: number) { setLines(prev => prev.filter((_, idx) => idx !== i)) }
  const total = lines.reduce((s,l)=> s + (Number(l.amount)||0), 0)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api(`/api/estimates`, { method: 'POST', body: JSON.stringify({ number, customerId, date, expiryDate: expiryDate || undefined, terms: terms || undefined, lines }) })
      router.push('/sales/estimates')
    } catch (err: any) {
      setError(err?.message || 'Failed to create estimate')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <BackBar href="/sales/estimates" />
        <h1 className="text-xl font-semibold text-slate-900 mb-3">New Estimate</h1>
        {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">Number
              <input className="input" value={number} onChange={e=>setNumber(e.target.value)} required />
            </label>
            <label className="text-sm">Customer
              <select className="input" value={customerId} onChange={e=>setCustomerId(e.target.value)} required>
                <option value="">Select…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm">Date
              <input className="input bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
            </label>
            <label className="text-sm">Expiry Date
              <input className="input bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} />
            </label>
            <label className="text-sm md:col-span-2">Terms
              <input className="input" placeholder="e.g., Net 30" value={terms} onChange={e=>setTerms(e.target.value)} />
            </label>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Line Items</h2>
              <button type="button" className="btn-secondary !px-2 !py-1 text-xs" onClick={addLine}>Add line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-8 gap-2 items-center">
                  <input className="input md:col-span-6" placeholder="Description" value={l.description} onChange={e=>setLine(i,{ description: e.target.value })} required />
                  <input className="input md:col-span-1" type="number" step="0.01" placeholder="Amount" value={l.amount} onChange={e=>setLine(i,{ amount: Number(e.target.value) })} required />
                  <button type="button" className="btn-danger !px-2 !py-1 text-xs md:col-span-1" onClick={()=>removeLine(i)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="text-right text-sm mt-2">Total: <span className="font-semibold"><Amount value={Number(total||0)} /></span></div>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Estimate'}</button>
            <button type="button" className="btn-secondary" onClick={()=>router.back()} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
