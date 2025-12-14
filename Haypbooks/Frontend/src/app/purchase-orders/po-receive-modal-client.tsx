"use client"
import { useEffect, useRef, useState } from 'react'
import { reloadPage } from '@/utils/navigation'
import { todayLocalISODate } from '@/utils/dates'

export function ReceivePOModalButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [billNumber, setBillNumber] = useState('')
  const [billDate, setBillDate] = useState(() => todayLocalISODate())
  const [terms, setTerms] = useState('Net 30')
  const [busy, setBusy] = useState(false)
  const firstRef = useRef<HTMLInputElement|null>(null)

  useEffect(()=> { if (open) firstRef.current?.focus() }, [open])

  async function submit() {
    setBusy(true)
    try {
      const body = { billNumber: billNumber || undefined, billDate, terms }
      const res = await fetch(`/api/purchase-orders/${id}/receive`, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed')
  reloadPage()
    } catch (e: any) {
      alert(e.message || 'Receive failed')
    } finally { setBusy(false) }
  }

  return (
    <>
      <button className="btn-secondary mr-2" disabled={disabled} onClick={()=>setOpen(true)}>Receive</button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="po-rec-title"
          aria-describedby="po-rec-desc"
          onKeyDown={e=>{ if (e.key==='Escape') setOpen(false) }}
          onMouseDown={()=> setOpen(false)}
        >
          <form
            className="w-full max-w-md bg-white rounded-md shadow-lg p-5 space-y-4"
            onSubmit={e=>{ e.preventDefault(); void submit() }}
            onMouseDown={e=> e.stopPropagation()}
          >
            <h2 id="po-rec-title" className="text-lg font-semibold">Receive Purchase Order</h2>
            <p id="po-rec-desc" className="text-sm text-slate-600">Enter the bill details to receive this purchase authorization.</p>
            <div className="grid gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-medium" htmlFor="po-rec-number">Bill #</label>
                <input ref={firstRef} id="po-rec-number" className="border rounded px-2 py-1" placeholder="Optional" value={billNumber} onChange={e=>setBillNumber(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium" htmlFor="po-rec-date">Bill date</label>
                <input id="po-rec-date" type="date" className="border rounded px-2 py-1" value={billDate} onChange={e=>setBillDate(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium" htmlFor="po-rec-terms">Terms</label>
                <input id="po-rec-terms" className="border rounded px-2 py-1" value={terms} onChange={e=>setTerms(e.target.value)} placeholder="Net 30, Due on receipt…" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={()=>setOpen(false)} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Receiving…' : 'Receive'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
