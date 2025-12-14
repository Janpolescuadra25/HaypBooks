"use client"
import { useEffect, useRef, useState } from 'react'

export default function NewPOForm() {
  const [open, setOpen] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [lines, setLines] = useState<Array<{ description: string; qty: number; rate: number }>>([
    { description: '', qty: 1, rate: 0 },
  ])
  const [saving, setSaving] = useState(false)
  const firstRef = useRef<HTMLSelectElement|null>(null)

  useEffect(() => {
    if (open) firstRef.current?.focus()
  }, [open])

  useEffect(() => {
    fetch('/api/vendors', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data?.vendors) ? data.vendors : []))
      .catch(() => setVendors([]))
  }, [])

  const addLine = () => setLines(l => [...l, { description: '', qty: 1, rate: 0 }])
  const removeLine = (idx: number) => setLines(l => l.length > 1 ? l.filter((_,i)=> i!==idx) : l)

  async function submit() {
    if (!vendorId) { alert('Select a vendor.'); return }
    const payload = { vendorId, lines: lines.filter(l => l.description && l.qty > 0 && l.rate >= 0) }
    if (payload.lines.length === 0) { alert('Add at least one line item'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/purchase-orders', { method: 'POST', body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Failed to create PO')
    } finally { setSaving(false) }
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => setOpen(true)}>New PO</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="po-new-title" onKeyDown={e=>{ if (e.key==='Escape') setOpen(false) }}>
          <form className="w-full max-w-3xl bg-white rounded-md shadow-lg p-5 space-y-4" onSubmit={e=>{ e.preventDefault(); void submit() }}>
            <h2 id="po-new-title" className="text-lg font-semibold">New Purchase Order</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-medium" htmlFor="po-vendor">Vendor<span className="text-rose-600">*</span></label>
                <select ref={firstRef} id="po-vendor" className="border rounded px-2 py-1" value={vendorId} onChange={e=>setVendorId(e.target.value)} required>
                  <option value="">Select vendor…</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Line items<span className="text-rose-600">*</span></div>
              <div className="max-h-80 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Description</th>
                      <th className="text-right font-medium px-3 py-2 w-24">Qty</th>
                      <th className="text-right font-medium px-3 py-2 w-28">Rate</th>
                      <th className="text-right font-medium px-3 py-2 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2"><input className="w-full border rounded px-2 py-1" placeholder="Description" value={l.description} onChange={e=>setLines(arr => arr.map((x,i)=> i===idx?{...x, description: e.target.value}:x))} /></td>
                        <td className="px-3 py-2 text-right"><input aria-label={`Qty line ${idx+1}`} title="Quantity" placeholder="Qty" type="number" className="w-full border rounded px-2 py-1 text-right" min={0} step={1} value={l.qty} onChange={e=>setLines(arr => arr.map((x,i)=> i===idx?{...x, qty: Number(e.target.value)}:x))} /></td>
                        <td className="px-3 py-2 text-right"><input aria-label={`Rate line ${idx+1}`} title="Rate" placeholder="Rate" type="number" className="w-full border rounded px-2 py-1 text-right" min={0} step={0.01} value={l.rate} onChange={e=>setLines(arr => arr.map((x,i)=> i===idx?{...x, rate: Number(e.target.value)}:x))} /></td>
                        <td className="px-3 py-2 text-right"><button type="button" className="btn" onClick={()=>removeLine(idx)} disabled={lines.length===1}>Remove</button></td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-500">No lines. Add one below.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div><button type="button" className="btn" onClick={addLine}>+ Add line</button></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={()=>setOpen(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create PO'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
