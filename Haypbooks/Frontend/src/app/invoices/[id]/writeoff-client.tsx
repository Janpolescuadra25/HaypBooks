"use client"
import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

export default function ClientWriteoffControls({ id, defaultAmount }: { id: string; defaultAmount: number }) {
  const { loading, has } = usePermissions()
  const can = !loading && (has('journal:write' as any) || has('invoices:write' as any))
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<string>(() => String(defaultAmount))
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')

  async function submit() {
    if (!can || busy) return
    const amt = Number(amount)
    if (!(amt > 0)) { setError('Enter a positive amount'); return }
    setBusy(true)
    setError(null)
    setAnnounce('Writing off…')
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}/writeoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, date: date || undefined, memo: memo || undefined })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || `Failed (${res.status})`)
        return
      }
      setOpen(false)
      setAnnounce('Invoice written off')
      if (typeof window !== 'undefined') window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
        disabled={!can}
        title="Write off invoice"
      >Write off</button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wo-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        >
          <form
            className="w-full max-w-lg rounded-md shadow-lg bg-white p-5 space-y-4"
            onSubmit={(e) => { e.preventDefault(); void submit() }}
          >
            <h2 id="wo-title" className="text-lg font-semibold">Write off invoice</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="wo-amount">Amount</label>
                <input id="wo-amount" type="number" min="0.01" step="0.01" className="border rounded p-1 text-right" value={amount} onChange={e=>setAmount(e.target.value)} />
                <span className="text-xs text-slate-500">Defaults to remaining balance.</span>
              </div>
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="wo-date">Date (optional)</label>
                <input id="wo-date" type="date" className="border rounded p-1" value={date} onChange={e=>setDate(e.target.value)} />
                <span className="text-xs text-slate-500">Must be in an open period.</span>
              </div>
              <div className="md:col-span-2 flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="wo-memo">Memo (optional)</label>
                <input id="wo-memo" type="text" className="border rounded p-1" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Bad debt write-off" />
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="sr-only" aria-live="polite">{announce}</div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Writing…' : 'Write off'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
