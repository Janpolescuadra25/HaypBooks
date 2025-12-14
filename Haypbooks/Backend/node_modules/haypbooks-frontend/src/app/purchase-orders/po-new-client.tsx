"use client"
import { useEffect, useState } from 'react'

export default function NewPOForm() {
  const [open, setOpen] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [lines, setLines] = useState<Array<{ description: string; qty: number; rate: number }>>([
    { description: 'Materials', qty: 5, rate: 100 },
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load vendors for dropdown
    fetch('/api/vendors')
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data?.vendors) ? data.vendors : []))
      .catch(() => setVendors([]))
  }, [])

  const submit = async () => {
    if (!vendorId) { alert('Select a vendor.'); return }
    setSaving(true)
    try {
      const payload = { vendorId, lines: lines.filter(l => l.description && l.qty > 0 && l.rate >= 0) }
      if (payload.lines.length === 0) throw new Error('Add at least one line item')
      const res = await fetch('/api/purchase-orders', { method: 'POST', body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Failed to create PO')
    } finally { setSaving(false) }
  }

  return (
    <div className="inline-flex items-center gap-2">
      {!open ? (
        <button className="btn-secondary" onClick={()=>setOpen(true)}>New PO</button>
      ) : (
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm w-48" value={vendorId} onChange={e=>setVendorId(e.target.value)} aria-label="Vendor">
            <option value="">Select vendor…</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm w-44" placeholder="Description" value={line.description} onChange={e=>setLines(l => l.map((x,i)=> i===idx?{...x, description: e.target.value}:x))} />
              <input type="number" aria-label="Quantity" title="Quantity" placeholder="Qty" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm w-20" value={line.qty} onChange={e=>setLines(l => l.map((x,i)=> i===idx?{...x, qty: Number(e.target.value)}:x))} />
              <input type="number" aria-label="Rate" title="Rate" placeholder="Rate" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm w-24" value={line.rate} onChange={e=>setLines(l => l.map((x,i)=> i===idx?{...x, rate: Number(e.target.value)}:x))} />
              {lines.length > 1 && <button className="btn-secondary" title="Remove line" onClick={()=> setLines(l => l.filter((_,i)=> i!==idx))}>−</button>}
            </div>
          ))}
          <button className="btn-secondary" onClick={()=> setLines(l => [...l, { description: '', qty: 1, rate: 0 }])}>+ Line</button>
          <button className="btn-secondary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
          <button className="btn-secondary" onClick={()=>setOpen(false)} disabled={saving}>Cancel</button>
        </div>
      )}
    </div>
  )
}
