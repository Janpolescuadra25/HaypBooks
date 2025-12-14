"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import dynamic from 'next/dynamic'

const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

type Vendor = { id: string; name: string }
type Line = { description: string; qty: number; rate: number }

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [number, setNumber] = useState('')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [date, setDate] = useState(today)
  const [lines, setLines] = useState<Line[]>([{ description: '', qty: 1, rate: 0 }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [rbacChecked, setRbacChecked] = useState(false)
  const [canWrite, setCanWrite] = useState<boolean>(true)
  const firstRef = useRef<HTMLSelectElement | null>(null)

  // RBAC: client-side guard similar to Bills New
  useEffect(() => {
    let alive = true
    async function check() {
      try {
        const r = await fetch('/api/user/profile', { cache: 'no-store' })
        const p = r.ok ? await r.json() : null
        const can = !!p?.permissions?.includes?.('bills:write')
        if (alive) {
          setCanWrite(can)
          setRbacChecked(true)
          if (!can) router.replace('/purchase-orders')
        }
      } catch {
        if (alive) { setCanWrite(false); setRbacChecked(true); router.replace('/purchase-orders') }
      }
    }
    check()
    return () => { alive = false }
  }, [router])

  // Load vendors
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/vendors', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (alive) setVendors(data.vendors || [])
        }
      } catch {
        if (alive) setVendors([])
      }
    }
    load()
    return () => { alive = false }
  }, [])

  useEffect(() => { firstRef.current?.focus() }, [])

  const total = lines.reduce((s, l) => s + (Number(l.qty) * Number(l.rate) || 0), 0)

  function addLine() { setLines(l => [...l, { description: '', qty: 1, rate: 0 }]) }
  function removeLine(idx: number) { setLines(l => l.length > 1 ? l.filter((_, i) => i !== idx) : l) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorId) { setError('Select a vendor'); return }
    const cleanLines = lines.filter(l => l.description && l.qty > 0 && l.rate >= 0)
    if (cleanLines.length === 0) { setError('Add at least one line item'); return }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/purchase-orders', { method: 'POST', body: JSON.stringify({ vendorId, number: number || undefined, date, lines: cleanLines }) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to create purchase order')
      }
      router.push('/purchase-orders')
    } catch (e: any) {
      setError(e?.message || 'Failed to create purchase order')
    } finally {
      setSaving(false)
    }
  }

  if (!rbacChecked || !canWrite) {
    // Let the redirect happen; keep UI minimal
    return null
  }

  return (
    <div className="glass-card">
      <h1 className="text-xl font-semibold mb-4 text-slate-900">New Purchase Order</h1>
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="po-vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
            <select id="po-vendor" ref={firstRef} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={vendorId} onChange={e => setVendorId(e.target.value)} required>
              <option value="">Select vendor…</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="po-number" className="block text-sm font-medium text-slate-700">PO #</label>
            <input id="po-number" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Optional" value={number} onChange={e => setNumber(e.target.value)} />
          </div>
          <div>
            <label htmlFor="po-date" className="block text-sm font-medium text-slate-700">PO date</label>
            <input id="po-date" type="date" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Line items</span>
            <button type="button" className="btn-secondary" onClick={addLine}>+ Add item</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {lines.map((l, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      <input className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Description" value={l.description} onChange={e => setLines(arr => arr.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input aria-label={`Qty line ${idx + 1}`} title="Quantity" type="number" min={0} step={1} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={l.qty} onChange={e => setLines(arr => arr.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value) } : x))} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input aria-label={`Rate line ${idx + 1}`} title="Rate" type="number" min={0} step={0.01} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-right" value={l.rate} onChange={e => setLines(arr => arr.map((x, i) => i === idx ? { ...x, rate: Number(e.target.value) } : x))} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="btn-secondary" onClick={() => removeLine(idx)} disabled={lines.length <= 1}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-700">Total</span>
          <span className={`tabular-nums font-mono ${total < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            <Amount value={total} />
          </span>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save PO'}</button>
          <BackButton ariaLabel="Back to Purchase Orders" fallback="/purchase-orders" disabled={saving}>Cancel</BackButton>
        </div>
      </form>
    </div>
  )
}
